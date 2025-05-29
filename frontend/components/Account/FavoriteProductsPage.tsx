'use client'

import { ProductList } from '@/components/common'
import { NavUserHeader } from '@/components/common/NavUserInfo/components'
import { IProduct, IUser } from '@/models'
import { AppState } from '@/store'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { connect } from 'react-redux'

export interface IFavoritesProductsProps {
   pUser: IUser | null
}

export function FavoritesProducts({ pUser }: IFavoritesProductsProps) {
   const router = useRouter()

   const productList = useMemo(() => {
      return pUser?.favoriteProducts && pUser?.favoriteProducts?.length > 0
         ? pUser.favoriteProducts
         : []
   }, [pUser])

   if (!pUser) {
      router.push('/login')
      return null
   }

   const handleNavigateProduct = () => router.push('/products')

   return (
      <div className="h-full">
         <NavUserHeader
            title="Sản phẩm yêu thích"
            className="flex items-center justify-between"
         >
            <div>
               <span className="text-tag font-medium">
                  {pUser.favoriteProducts?.length || 0} sản phẩm
               </span>
            </div>
         </NavUserHeader>
         <div className="flex-1 h-full px-[30px] py-4">
            {pUser.favoriteProducts?.length === 0 && (
               <div className="d-flex flex-col h-full gap-4">
                  <div className="w-[70px] h-[102px] relative">
                     <Image src={'/no-heart.png'} alt="Sản phẩm yêu thích trống" fill />
                  </div>
                  <p className="text-tag text-sm font-medium mb-2">
                     Danh sách yêu thích của bạn đang trống
                  </p>
                  <button
                     className="btn text-lg font-semibold !px-10 !py-3"
                     onClick={handleNavigateProduct}
                  >
                     Mua sắm ngay bây giờ
                  </button>
               </div>
            )}
            <ProductList products={productList as IProduct[]} className="gap-4" />
         </div>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

export default connect(mapStateToProps, null)(FavoritesProducts)
