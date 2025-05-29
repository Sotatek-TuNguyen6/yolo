'use client'

import { productApi } from '@/api'
import { useToastify } from '@/hooks'
import { IProduct } from '@/models'
import { useEffect, useState } from 'react'
import { ProductDetailCommonList } from '..'

export interface IProductDetailRecommendsProps {
   id: string
   className?: string
}

export function ProductDetailRecommends({
   id,
   className = '',
}: IProductDetailRecommendsProps) {
   const [products, setProducts] = useState<IProduct[]>([])
   const { error } = useToastify()

   useEffect(() => {
      ;(async () => {
         try {
            const res = await productApi.recommendProducts(id)
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
         title={'Gợi ý cho bạn'}
      />
   )
}
