import { HeartIcon } from '@/components/icons'
import { useToastify } from '@/hooks'
import { IProduct, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { setShowModalNotificationLogin } from '@/store/common'
import { likeProduct, unlikeProduct } from '@/store/user/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

export interface IProductLikeProps {
   product: IProduct
   pUser: IUser | null
   pLikeProduct: (productId: string) => Promise<PayloadAction<unknown>>
   pUnLikeProduct: (productId: string) => Promise<PayloadAction<unknown>>
   pShowShowModalNotificationLogin: () => void
}

function ProductLike({
   product,
   pUser,
   pLikeProduct,
   pUnLikeProduct,
   pShowShowModalNotificationLogin,
}: IProductLikeProps) {
   const [isLike, setIsLike] = useState<boolean>(false)
   const { error } = useToastify()

   useEffect(() => {
      if (pUser && pUser._id) {
         const ids = (pUser.favoriteProducts as IProduct[]).map((p) => p._id)
         if (ids.includes(product._id)) {
            setIsLike(true)
         }
      }
   }, [])

   const handleLikeProduct = async () => {
      try {
         if (!pUser) {
            pShowShowModalNotificationLogin()
            return
         }
         if (isLike) {
            setIsLike(false)
            await pUnLikeProduct(product._id)
         } else {
            setIsLike(true)
            await pLikeProduct(product._id)
         }
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <div
         className={`d-fle p-2 rounded-md cursor-pointer ${
            isLike ? 'bg-red-50' : 'bg-tag-light'
         }`}
         title="Thêm vào sản phẩm yêu thích"
         onClick={handleLikeProduct}
      >
         <HeartIcon
            strokeWidth={1.5}
            className={`${isLike ? 'text-red-600' : 'text-gray-dark'}`}
            fill={`${isLike ? 'currentColor' : 'none'}`}
         />
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pLikeProduct: (productId: string) => dispatch(likeProduct(productId)),
      pUnLikeProduct: (productId: string) => dispatch(unlikeProduct(productId)),
      pShowShowModalNotificationLogin: () =>
         dispatch(setShowModalNotificationLogin(true)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductLike)
