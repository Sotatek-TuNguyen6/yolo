'use client'

import { HomeProductList } from '@/components/Home'
import { Container } from '@/components/common'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { swiperImages } from '@/data'
import { ICategory, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { getAllCarts } from '@/store/cart/thunkApi'
import { getAllCategories } from '@/store/category/thunkApi'
import { getAllColors } from '@/store/color/thunkApi'
import { getAllSizes } from '@/store/size/thunkApi'
import { getAllSubCategories } from '@/store/subCategory/thunkApi'
import { resetRecentlyProduct } from '@/store/user'
import { handleGetNewProducts, handleGetTopProducts, handleRecommendUser } from '@/utils'
import { PayloadAction } from '@reduxjs/toolkit'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import 'swiper/css'
import 'swiper/css/pagination'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

export interface ISwiperButtonProps {
   className?: string
   nextEl?: string
   prevEl?: string
}

export function SwiperButton({
   className = '',
   nextEl = 'btn-next-slide',
   prevEl = 'btn-prev-slide',
}: ISwiperButtonProps) {
   return (
      <div>
         <button
            className={`${prevEl} absolute left-5 top-1/2 z-20 -translate-y-1/2 d-flex p-2 bg-black bg-opacity-60 rounded-full cursor-pointer text-white hover:scale-110 duration-common ${className}`}
         >
            <ChevronLeftIcon className="!w-5 !h-5" />
         </button>
         <button
            className={`${nextEl} absolute right-5 top-1/2 z-20 -translate-y-1/2 d-flex p-2 bg-black bg-opacity-60 rounded-full cursor-pointer text-white hover:scale-110 duration-common ${className}`}
         >
            <ChevronRightIcon className="!w-5 !h-5" />
         </button>
      </div>
   )
}

export interface IHomeProps {
   pGetAllSizes: () => Promise<PayloadAction<unknown>>
   pGetAllCategories: () => Promise<PayloadAction<unknown>>
   pGetAllColors: () => Promise<PayloadAction<unknown>>
   pGetAllSubCategories: () => Promise<PayloadAction<unknown>>
   pGetAllCartsByUser: (id: string) => Promise<PayloadAction<unknown>>
   pCategories: ICategory[]
   pUser: IUser | null
   pResetRecentlyProducts: () => void
}

function Home({
   pGetAllSizes,
   pGetAllCategories,
   pGetAllColors,
   pCategories,
   pGetAllSubCategories,
   pUser,
   pGetAllCartsByUser,
}: IHomeProps) {
   const navigate = useRouter()

   useEffect(() => {
      ;(async () => {
         await pGetAllSizes()
         await pGetAllCategories()
         await pGetAllColors()
         await pGetAllSubCategories()
         if (pUser) {
            console.log('pUser', pUser)
            await pGetAllCartsByUser(pUser._id)
         }
      })()
   }, [])

   return (
      <section className="pt-header">
         <Container>
            <div className="py-4">
               {/* Swiper */}
               <section>
                  <Swiper
                     className="relative w-full overflow-hidden rounded"
                     spaceBetween={10}
                     slidesPerView={1}
                     autoplay
                     loop
                     navigation={{
                        nextEl: '.btn-next-slide',
                        prevEl: '.btn-prev-slide',
                     }}
                     pagination={{ clickable: true }}
                     modules={[Navigation, Pagination, Autoplay]}
                  >
                     {swiperImages.map((img) => (
                        <SwiperSlide key={img.id} className="h-[388px] overflow-hidden">
                           <div className="w-full relative h-[388px]">
                              <Image
                                 src={img.img}
                                 alt=""
                                 priority
                                 fill
                                 className="rounded object-cover"
                              />
                           </div>
                        </SwiperSlide>
                     ))}
                     <SwiperButton />
                  </Swiper>
               </section>

               {/* Category */}
               <section className="section">
                  <h3 className="title-home !font-bold text-center text-xl">DANH MỤC</h3>
                  <ul className="grid grid-cols-3 gap-6 w-4/6 m-auto mt-8">
                     {pCategories?.map((category) => (
                        <li
                           key={category._id}
                           className="relative overflow-hidden rounded group"
                        >
                           <div className="absolute top-0 left-0 w-full h-full opacity-0 z-10 bg-black bg-opacity-60 group-hover:opacity-100 duration-common">
                              <div className="d-flex flex-col h-full px-8">
                                 <h5 className="text-white font-semibold text-2xl">
                                    {category.name}
                                 </h5>
                                 <button
                                    className="btn gap-1 mt-2 border-2 !bg-transparent font-semibold rounded text-sm border-white text-white hover:!bg-white hover:text-description duration-common"
                                    onClick={() =>
                                       navigate.push(
                                          `/products?categories=${category._id}&page=1`
                                       )
                                    }
                                 >
                                    <span>Xem chi tiết</span>{' '}
                                    <ArrowRightIcon className="!w-5 !h-5" />
                                 </button>
                              </div>
                           </div>
                           <Link
                              href={`/products?categories=${category._id}`}
                              className="relative w-full h-auto"
                              scroll
                           >
                              <Image
                                 src={category.imageUrl as string}
                                 alt={category.name}
                                 width={1000}
                                 height={1000}
                                 priority
                                 className="h-auto rounded object-cover"
                              />
                           </Link>
                        </li>
                     ))}
                  </ul>
               </section>

               {/* Products New */}
               <HomeProductList
                  title={'Hàng Mới Về'}
                  nextEl={'btn-next-slide-2'}
                  prevEl={'btn-prev-slide-2'}
                  linkSeeMore={'/products?sort=-createdAt'}
                  onHandleApi={handleGetNewProducts}
               />

               {/* Product Best Seller */}
               <HomeProductList
                  title={'Hàng Bán Chạy Nhất'}
                  nextEl={'btn-next-slide-3'}
                  prevEl={'btn-prev-slide-3'}
                  linkSeeMore={'/products?sort=-price'}
                  isHot
                  onHandleApi={handleGetTopProducts}
               />

               {/* Recommend Product for user */}
               {pUser && (
                  <HomeProductList
                     title={'Dành cho bạn'}
                     nextEl={'btn-next-slide-4'}
                     prevEl={'btn-prev-slide-4'}
                     linkSeeMore={''}
                     onHandleApi={handleRecommendUser}
                  />
               )}
            </div>
         </Container>
      </section>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pCategories: state.category.categories,
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pGetAllSizes: () => dispatch(getAllSizes()),
      pGetAllCategories: () => dispatch(getAllCategories()),
      pGetAllColors: () => dispatch(getAllColors()),
      pGetAllSubCategories: () => dispatch(getAllSubCategories()),
      pGetAllCartsByUser: (id: string) => dispatch(getAllCarts(id)),
      pResetRecentlyProducts: () => dispatch(resetRecentlyProduct()),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
