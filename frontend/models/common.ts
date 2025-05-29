import {
   GenderVi,
   TypeBuy,
   TypeMeasurement,
   TypeMessageLoading,
   TypeModalDelete,
} from '@/enums'

export type ICommonObject = Record<string, string | number | boolean | string[] | object>

export type ITypeBuy = TypeBuy.ADD_TO_CART | TypeBuy.BUY_NOW

export interface IChangePasswordForm {
   currentPassword: string
   newPassword: string
   confirmPassword: string
}

export type ITypeButton = 'button' | 'submit'
export type ITypeModalDelete =
   | TypeModalDelete.DELETE_ADDRESS
   | TypeModalDelete.DELETE_PRODUCT
   | TypeModalDelete.DELETE_COMMENT
   | TypeModalDelete.DELETE_REPLY_COMMENT

export interface IUploadImg {
   public_id: string
   url: string
}

export type ITypeMessageLoading = TypeMessageLoading.LOADING | TypeMessageLoading.UPDATE
export type ITypeMeasurement = TypeMeasurement.HEIGHT | TypeMeasurement.WEIGHT

export interface IContactForm {
   fullName: string
   emailAddress: string
   content: string
}

export interface IAddressStoreRes {
   provinces: ICommonObject[]
   districts: ICommonObject[]
   wards: ICommonObject[]
}

export type IGenderVi = GenderVi.MALE | GenderVi.FEMALE | GenderVi.OTHER
