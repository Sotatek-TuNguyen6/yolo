'use client'

import { ProductList } from '@/components/common'
import { NavUserHeader } from '@/components/common/NavUserInfo/components'
import { IProduct } from '@/models'
import { AppState } from '@/store'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { connect } from 'react-redux'

export interface IRecentlyViewedProps {
   pRecentlyViewed: IProduct[]
}

function RecentlyViewed({ pRecentlyViewed }: IRecentlyViewedProps) {
   const router = useRouter()

   const recentlyViewed = useMemo(() => {
      return !pRecentlyViewed || pRecentlyViewed.length === 0 ? [] : pRecentlyViewed
   }, [pRecentlyViewed])

   const handleNavigateProduct = () => router.push('/products')

   return (
      <div>
         <NavUserHeader title={'Đã xem gần đây'}></NavUserHeader>
         <div className="px-[30px] py-4">
            {recentlyViewed.length > 0 && <ProductList products={recentlyViewed} />}
            {recentlyViewed.length === 0 && (
               <div className="d-flex flex-col h-full gap-4">
                  <div className="w-[70px] h-[102px] relative">
                     <Image src={'/no-heart.png'} alt="Sản phẩm yêu thích trống" fill />
                  </div>
                  <p className="text-tag text-sm font-medium mb-2">
                     Danh sách các sản phẩm đã xem của bạn đang trống
                  </p>
                  <button
                     className="btn text-lg font-semibold !px-10 !py-3"
                     onClick={handleNavigateProduct}
                  >
                     Đi đến các sản phẩm ngay!
                  </button>
               </div>
            )}
         </div>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pRecentlyViewed: state.user.recentlyViewed,
   }
}

export default connect(mapStateToProps, null)(RecentlyViewed)
