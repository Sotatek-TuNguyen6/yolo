import { SwiperButton } from '@/app/page'
import { ProductItem } from '@/components/common'
import { ChevronRightIcon } from '@/components/icons'
import { useToastify } from '@/hooks'
import { IProduct } from '@/models'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SkeletonProducts } from '@/components/common/Loading'

export interface IHomeProductListProps {
   title: string
   linkSeeMore: string
   nextEl?: string
   prevEl?: string
   isHot?: boolean
   onHandleApi: () => Promise<IProduct[]>
}

export function HomeProductList({
   nextEl,
   prevEl,
   title,
   linkSeeMore,
   isHot = false,
   onHandleApi,
}: IHomeProductListProps) {
   const [products, setProducts] = useState<IProduct[]>([])
   const [loading, setLoading] = useState<boolean>(false)
   const { error } = useToastify()

   useEffect(() => {
      ;(async () => {
         try {
            setLoading(true)
            const products = await onHandleApi()
            setProducts(products)
         } catch (err) {
            error((err as Error).message)
         }
         setLoading(false)
      })()
   }, [])

   const isHasProducts = useMemo(() => {
      return products.length === 0 ? false : true
   }, [products])

   return (
      <section className="section">
         <div className="flex justify-between items-center">
            {isHasProducts && linkSeeMore && (
               <>
                  <h3 className="title-home !font-semibold">{title}</h3>
                  <Link
                     href={linkSeeMore}
                     className="flex items-center gap-0.5 font-medium text-sm text-gray-dark"
                     scroll
                  >
                     Xem thêm <ChevronRightIcon className="!w-4 !h-4" />
                  </Link>
               </>
            )}
         </div>
         {isHasProducts && !loading && (
            <div className="relative">
               <Swiper
                  className="relative overflow-hidden rounded mt-4 w-[88%]"
                  spaceBetween={30}
                  slidesPerView={4}
                  navigation={{
                     nextEl: `.${nextEl}`,
                     prevEl: `.${prevEl}`,
                  }}
                  modules={[Navigation]}
               >
                  {products.map((product) => (
                     <SwiperSlide key={product.id} className="w-full">
                        <ProductItem product={product} isHot={isHot} />
                     </SwiperSlide>
                  ))}
               </Swiper>
               <SwiperButton nextEl={nextEl} prevEl={prevEl} />
            </div>
         )}
         {loading && <SkeletonProducts className="w-[88%] m-auto" />}
      </section>
   )
}
