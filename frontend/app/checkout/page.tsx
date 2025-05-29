'use client'

import { CheckoutInfo, CheckoutBill } from '@/components/Checkout'
import { Container } from '@/components/common'
import { ModalPayment } from '@/components/modals'
import { checkoutDefaultVals } from '@/data'
import { PaymentMethodOrder, ShippingMethodOrder, StatusOrder } from '@/enums'
import {
   ICart,
   IOrderData,
   IOrderForm,
   IPaymentMethodOrder,
   IProduct,
   IShippingMethodOrder,
   IUser,
} from '@/models'
import { AppDispatch, AppState } from '@/store'
import { setOrderSave } from '@/store/order'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { connect } from 'react-redux'
import * as yup from 'yup'

export interface ICheckoutProps {
   pUser: IUser | null
   pCart: ICart
   pSetOrderSave: (data: IOrderData) => void
}

const schema = yup.object().shape({
   fullName: yup.string().required('Vui lòng nhập họ và tên của bạn'),
   emailAddress: yup
      .string()
      .required('Vui lòng nhập email của bạn')
      .email('Email của bạn không đúng'),
   phoneNumber: yup
      .string()
      .required('Vui lòng nhập số điện thoại của bạn')
      .matches(
         /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
         'Số điện thoại không đúng'
      )
      .min(10, 'Số điện thoại phải ít nhất 10 số hoặc tối đa 10 số')
      .max(10, 'Số điện thoại phải ít nhất 10 số hoặc tối đa 10 số'),
   address: yup.object().shape({
      street: yup.string(),
      ward: yup.string().required('Vui lòng chọn tên xã / phường'),
      district: yup.string().required('Vui lòng chọn tên huyện / quận'),
      province: yup.string().required('Vui lòng chọn tên tỉnh / thành phố'),
   }),
   noteAddress: yup.string(),
   paymentMethod: yup
      .mixed<IPaymentMethodOrder>()
      .required('Vui lòng chọn hình thức thanh toán')
      .oneOf(
         Object.values(PaymentMethodOrder),
         'Hình thức thanh toán bạn chọn không đúng'
      ),
   shippingMethod: yup
      .mixed<IShippingMethodOrder>()
      .required('Vui lòng chọn hình thức giao hàng')
      .oneOf(
         Object.values(ShippingMethodOrder),
         'Hình thức giao hàng bạn chọn không đúng'
      ),
})

function Checkout({ pUser, pCart, pSetOrderSave }: ICheckoutProps) {
   const [isShowModal, setIsShowModal] = useState<boolean>(false)

   const {
      handleSubmit,
      control,
      watch,
      setValue,
      trigger,
      formState: { isSubmitting, isDirty, isValid },
      getValues,
   } = useForm<IOrderForm>({
      defaultValues: {
         ...checkoutDefaultVals,
         fullName: pUser?.fullName || checkoutDefaultVals.fullName,
         emailAddress: pUser?.email || checkoutDefaultVals.emailAddress,
         phoneNumber: pUser?.phoneNumber || checkoutDefaultVals.phoneNumber,
      },
      resolver: yupResolver(schema) as any,
   })

   const shippingFee = useMemo(() => {
      return getValues('shippingMethod') === ShippingMethodOrder.EXPRESS ? 30000 : 0
   }, [getValues('shippingMethod')])

   useEffect(() => {
      if (pUser) {
         setValue(
            'address.street',
            pUser?.addresses[0]?.street ? JSON.stringify(pUser.addresses[0].street) : ''
         )
         setValue('address.ward', JSON.stringify(pUser?.addresses[0]?.ward))
         setValue('address.district', JSON.stringify(pUser?.addresses[0]?.district))
         setValue('address.province', JSON.stringify(pUser?.addresses[0]?.province))
      }
   }, [pUser])

   const handleCheckout = (values: IOrderForm) => {
      try {
         if (pUser && pUser._id) {
            const subTotal = pCart.items?.reduce((total, item) => {
               return total + ((item.product as IProduct).price || 0) * item.quantities
            }, 0)
            const newValues: IOrderData = {
               ...values,
               user: pUser?._id,
               isPayment: values.paymentMethod === PaymentMethodOrder.CASH ? false : true,
               status: StatusOrder.PENDING,
               items: pCart.items,
               subTotal,
               shippingFee: shippingFee,
               total: subTotal + 30000,
               address: {
                  ...values.address,
                  province: JSON.parse(values.address.province as string),
                  district: JSON.parse(values.address.district as string),
                  ward: JSON.parse(values.address.ward as string),
               },
            }
            pSetOrderSave(newValues)
            setIsShowModal(true)
         }
      } catch (error) {
         throw new Error(error as string)
      }
   }

   return (
      <div>
         <Container>
            <div className="pt-4">
               <form onSubmit={handleSubmit(handleCheckout)}>
                  <div className="grid grid-cols-[2fr_1fr] mt-2">
                     <div className="mx-2.5">
                        <CheckoutInfo
                           control={control}
                           watch={watch}
                           setValue={setValue}
                           isSubmitting={isSubmitting}
                           trigger={trigger}
                        />
                     </div>
                     <div className="mx-2.5">
                        <CheckoutBill
                           isDisabledSubmit={isSubmitting || !isDirty || !isValid}
                           cart={pCart}
                           shippingFee={shippingFee}
                        />
                     </div>
                  </div>
               </form>
            </div>
         </Container>
         <ModalPayment isShow={isShowModal} setIsShow={setIsShowModal} />
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
      pCart: state.cart.cart,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pSetOrderSave: (data: IOrderData) => dispatch(setOrderSave(data)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(Checkout)
