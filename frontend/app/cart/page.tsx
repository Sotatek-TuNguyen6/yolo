'use client'

import { CartProduct, CartCheckout } from '@/components/Cart'
import { Container } from '@/components/common'
import { ICart, ICartItem, IProduct } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { getAllCategories } from '@/store/category/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import { useEffect, useMemo } from 'react'
import { connect } from 'react-redux'

export interface ICartProps {
   pCart: ICart
   pGetAllCategories: () => Promise<PayloadAction<unknown>>
}

function Cart({ pCart, pGetAllCategories }: ICartProps) {
   const total = useMemo(() => {
      if (!pCart) return 0
      return pCart.items?.reduce((total: number, item: ICartItem) => {
         return (
            ((total + ((item.product as IProduct).price || 0)) as number) *
            item.quantities
         )
      }, 0)
   }, [pCart])

   const quantitiesProduct = useMemo(() => {
      if (!pCart) return 0

      return pCart.items?.length
   }, [pCart])

   useEffect(() => {
      ;(async () => {
         try {
            await pGetAllCategories()
         } catch (error) {
            throw new Error(error as string)
         }
      })()
   }, [])

   return (
      <Container>
         <div className="grid grid-cols-[2fr_1fr]">
            <div className="mx-2.5">
               <CartProduct quantitiesProduct={quantitiesProduct as number} />
            </div>
            <div className="mx-2.5">
               <CartCheckout total={total as number} cart={pCart} />
            </div>
         </div>
      </Container>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pCart: state.cart.cart,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pGetAllCategories: () => dispatch(getAllCategories()),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(Cart)
