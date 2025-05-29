'use client'

import { productApi } from '@/api'
import { Container, ProductList } from '@/components/common'
import { SkeletonProducts } from '@/components/common/Loading'
import { useToastify } from '@/hooks'
import { IProduct } from '@/models'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Search() {
   const searchParams = useSearchParams()
   const [products, setProducts] = useState<IProduct[]>([])
   const [loading, setLoading] = useState<boolean>(true)
   const params = new URLSearchParams(searchParams?.toString())
   const { error } = useToastify()

   useEffect(() => {
      ;(async () => {
         try {
            if (params.get('q')) {
               setLoading(true)
               const res = await productApi.searchProduct(params.get('q') as string)
               setProducts(res.data.products)
            }
         } catch (err) {
            error((err as Error).message)
         }
         setLoading(false)
      })()
   }, [searchParams])

   return (
      <Container>
         <div>
            <h1 className="text-secondary font-semibold text-[22px] text-center">
               <span className="uppercase">
                  Kết quả tìm kiếm sản phẩm &quot;{params.get('q') || ''}&quot;
               </span>
            </h1>
            {products.length > 0 && !loading && (
               <ProductList products={products} className="grid-cols-5 gap-5 mt-6" />
            )}
            {products.length === 0 && !loading && (
               <p className="text-center text-sapo mt-10 mb-4 text-sm">
                  Không có sản phẩm nào bạn đang tìm kiếm.
               </p>
            )}
            {loading && (
               <SkeletonProducts className="grid-cols-5 !gap-5 mt-6" length={5} />
            )}
         </div>
      </Container>
   )
}
