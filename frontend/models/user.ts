import { Gender } from '@/enums'
import { IAddress, IOrder, IProduct, ITypeAuth } from '@/models'

// ENUM TYPE
export type IGender = Gender.FEMALE | Gender.MALE | Gender.OTHER

// TYPE | INTERFACE

export interface IUserData {
   id?: string
   _id?: string
   fullName: string
   userName: string
   email: string
   type: ITypeAuth
   avatar: string
   roles: string[]
   gender: IGender
   dateOfBirth: Date
   addresses: IAddress[]
   phoneNumber: string
   favoriteProducts: (string | IProduct)[]
   carts: IProduct[]
   orders: IOrder[]
}

export interface IUser extends Omit<IUserData, 'id'> {
   _id: string
   address: IAddress
}

export interface IUserAccountForm {
   fullName: string
   phoneNumber: string
   emailAddress: string
   gender: IGender
   dateOfBirth: {
      startDate: Date
      endDate: Date
   }
}

export interface IUserAccount extends IUserAccountForm {
   _id: string
   id: string
}
