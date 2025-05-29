import { EMPTY_OPTION } from '@/constants'
import { PaymentMethodOrder, ShippingMethodOrder } from '@/enums'
import {
   IAddressForm,
   IChangePasswordForm,
   ICommentForm,
   IContactForm,
   IProductDetailForm,
   IUserAccountForm,
} from '@/models'

export const checkoutDefaultVals = {
   fullName: '',
   emailAddress: '',
   phoneNumber: '',
   address: {
      street: '',
      ward: '',
      district: '',
      province: '',
   },
   noteAddress: '',
   paymentMethod: PaymentMethodOrder.CASH,
   shippingMethod: ShippingMethodOrder.NORMAL,
}

export const commentDefaultVals: ICommentForm = {
   fullName: '',
   emailAddress: '',
   phoneNumber: '',
   comment: '',
   rating: 5,
}

export const productDetailVals: (colorInit: string | null) => IProductDetailForm = (
   colorInit
) => ({
   color: colorInit,
   size: '',
   quantities: 1,
})

export const signUpVals = {
   emailAddress: '',
   fullName: '',
   username: '',
   gender: EMPTY_OPTION,
   dateOfBirth: {
      startDate: new Date(),
      endDate: new Date(),
   },
   phoneNumber: '',
   address: {
      street: '',
      ward: '',
      district: '',
      province: '',
   },
   password: '',
   confirmPassword: '',
}

export const changePasswordVals: IChangePasswordForm = {
   currentPassword: '',
   newPassword: '',
   confirmPassword: '',
}

export const addressVals: IAddressForm = {
   fullName: '',
   phoneNumber: '',
   street: '',
   ward: '',
   district: '',
   province: '',
   isDefault: false,
}

export const contactVals: IContactForm = {
   fullName: '',
   emailAddress: '',
   content: '',
}
