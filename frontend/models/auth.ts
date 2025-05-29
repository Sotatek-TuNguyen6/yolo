import { TypeAuth } from '@/enums'
import { IGender } from '@/models'

// ENUM TYPE
export type ITypeAuth = TypeAuth.EMAIL | TypeAuth.FACEBOOK | TypeAuth.GOOGLE

// INTERFACE | TYPE
export interface ILogin {
   email: string
   password: string
}

export interface ILoginForm extends ILogin {
   rememberMe: boolean
}

export interface IAddressValue {
   code: number
   name: string
}

export interface ILoginGoogle {
   fullName: string
   username: string
   email: string
   avatar: string
}

export interface ISignUp {
   fullName: string
   username: string
   emailAddress: string
   password: string
   gender: IGender | string
   dateOfBirth: Date
   phoneNumber: string
   address: {
      street?: string
      ward: IAddressValue | string
      district: IAddressValue | string
      province: IAddressValue | string
   }
}

export interface ISignUpForm extends Omit<ISignUp, 'dateOfBirth'> {
   confirmPassword: string
   dateOfBirth: {
      startDate: string | Date
      endDate: string | Date
   }
}

export interface IChangePassword {
   newPassword: string
   password: string
}

export interface IVerifyEmailForm {
   emailAddress: string
}

export interface IResetPasswordForm {
   newPassword: string
   confirmPassword: string
}

export interface IQuery {
   page: number
   limit: number
   sort?: string
   fields?: string
}

export interface IQueryProduct extends IQuery {
   ratingAverage?: number
   sizes?: string[]
   colors?: string[]
   prices?: Record<string, number>[]
   categories?: string[]
   ratings?: string[]
}

export interface IResponse<T> {
   data: T
}

export interface IListResponse {
   total?: number
   prevPage?: number | null
   nextPage?: number | null
}
