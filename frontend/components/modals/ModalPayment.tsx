'use client'

import { Button } from '@/components/buttons'
import { useToastify } from '@/hooks'
import { IOrderData } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { resetOrderSave } from '@/store/order'
import { createOrder } from '@/store/user/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from 'react'
import { connect } from 'react-redux'
import { Modal } from '.'
import { resetCart } from '@/store/cart'

export interface IModalPaymentProps {
   isShow: boolean
   setIsShow: Dispatch<SetStateAction<boolean>>
   pOrderSave: IOrderData
   pResetOrderSave: () => void
   pResetCart: () => void
   pCreateOrder: (data: IOrderData) => Promise<PayloadAction<unknown>>
}

export function ModalPayment({
   isShow,
   setIsShow,
   pOrderSave,
   pResetOrderSave,
   pResetCart,
   pCreateOrder,
}: IModalPaymentProps) {
   const router = useRouter()
   const [loading, setLoading] = useState<boolean>(false)
   const { error, success } = useToastify()

   const handleCancelModalPayment = () => {
      setIsShow(false)
   }

   const handleCheckout = async () => {
      try {
         setLoading(true)
         // create order
         await pCreateOrder(pOrderSave)
         // reset order save
         pResetOrderSave()
         // reset cart
         pResetCart()
         // close modal
         handleCancelModalPayment()
         // navigate account
         router.push('/account')
         // show success
         success('Bạn đã đặt hàng thành công. Thanks')
      } catch (err) {
         error((err as Error).message)
      }
      setLoading(false)
   }

   return (
      <Modal isShowModal={isShow}>
         <div className="rounded bg-white w-[650px] p-10 flex flex-col items-center">
            <div className="relative w-[150px] h-[150px]">
               <Image
                  src={'/payment-card.png'}
                  alt=""
                  fill
                  className="object-cover h-auto"
               />
            </div>
            <h1 className="mt-6 text-2xl text-gray-darker font-semibold">
               Thanh toán sản phẩm
            </h1>
            <p className="w-11/12 text-center mt-4 text-sapo">
               Sau khi hoàn tất đơn hàng khoảng 60-90 phút (trong giờ hành chính), LUMEN
               sẽ nhanh chóng gọi điện xác nhận lại thời gian giao hàng với bạn. LUMEN xin
               cảm ơn!
            </p>
            <div className="flex w-full mt-8 gap-2">
               <Button
                  className="btn-cancel w-full flex-1 uppercase font-semibold !py-3"
                  onClick={handleCancelModalPayment}
                  title={'Hủy'}
                  disabled={loading}
               ></Button>
               <Button
                  className="w-full flex-1 uppercase font-semibold !py-3"
                  title={'Đặt hàng ngay'}
                  disabledClassName="disabled-btn-submit"
                  disabled={loading}
                  isLoading={loading}
                  onClick={handleCheckout}
               ></Button>
            </div>
         </div>
      </Modal>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pOrderSave: state.order.orderSave,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pResetOrderSave: () => dispatch(resetOrderSave()),
      pResetCart: () => dispatch(resetCart()),
      pCreateOrder: (data: IOrderData) => dispatch(createOrder(data)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalPayment)
