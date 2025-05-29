'use client'

import { ProductFilters, ProductList } from '@/components/ProductsComponent'
import { ProductSortFilter } from '@/components/ProductsComponent/ProductFilters/components'
import { Container } from '@/components/common'
import { QUERY_KEYS } from '@/constants'
import { useProductList } from '@/hooks'
import { IQueryProduct } from '@/models'
import { convertUrlParams } from '@/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function Product() {
   const searchParams = useSearchParams()
   const router = useRouter()
   const pathname = usePathname()
   const params = new URLSearchParams(searchParams?.toString())

   const filters: IQueryProduct = {
      limit: 12,
      ...(convertUrlParams(params) as any),
   }
   const { data, isLoading } = useProductList({ params: filters })
   console.log('data', data)
   const totalProducts = data.data.total || 0
   const productList = data.data.products

   useEffect(() => {
      if (params.has(QUERY_KEYS.PAGE)) return

      params.set(QUERY_KEYS.PAGE, '1')
      const updatedUrl = `${pathname}?${params.toString()}`
      router.push(updatedUrl)
   }, [])

   return (
      <Container>
         <div className="grid grid-cols-[252px_1fr] grid-rows-[auto_auto] py-4">
            <aside className="px-2.5 row-start-1 row-span-1 col-start-2 col-span-1">
               <ProductSortFilter total={totalProducts} />
            </aside>
            <div className="px-2.5 row-start-2 row-span-1 col-start-1 col-span-1">
               <ProductFilters />
            </div>
            <section className="px-2.5 row-start-2 row-span-1 col-start-2 col-span-1">
               <ProductList
                  productList={productList}
                  total={totalProducts}
                  isLoading={isLoading}
               />
            </section>
         </div>
      </Container>
   )
}
