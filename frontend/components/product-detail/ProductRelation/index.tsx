'use client'

import { productApi } from '@/api'
import { useToastify } from '@/hooks'
import { IProduct } from '@/models'
import { useEffect, useState } from 'react'
import { ProductDetailCommonList } from '..'

export interface IProductDetailRelationProps {
   id: string
   className?: string
}

export function ProductDetailRelation({
   id,
   className = '',
}: IProductDetailRelationProps) {
   const [products, setProducts] = useState<IProduct[]>([])
   const { error } = useToastify()

   useEffect(() => {
      ;(async () => {
         try {
            const res = await productApi.relatedProducts(id)
            setProducts(res.data.products)
         } catch (err) {
            error((err as Error).message)
         }
      })()
   }, [])

   return (
      <ProductDetailCommonList
         className={className}
         productList={products}
         title={'Các sản phẩm liên quan'}
         isCenterTitle
      />
   )
}
