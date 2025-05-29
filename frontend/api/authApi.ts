import { IChangePassword, ILogin, ILoginGoogle, ISignUp } from '@/models'
import AxiosClient from '.'

const BASE_URL = '/auth'

export const login = async (data: ILogin) => {
   return AxiosClient.post(`${BASE_URL}/login`, data).then((res) => res.data)
}

export const loginGoogle = async (data: ILoginGoogle) => {
   return AxiosClient.post(`${BASE_URL}/login/google`, data).then((res) => res.data)
}

export const signUp = async (data: ISignUp) => {
   return AxiosClient.post(`${BASE_URL}/signup`, data).then((res) => res.data)
}

export const verifyAccount = (token: string) => {
   return AxiosClient.get(`${BASE_URL}/verify-account`, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
   })
}

export const refreshToken = async (token: string) => {
   return AxiosClient.get(`${BASE_URL}/refresh-token`, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
   }).then((res) => res.data)
}

export const verifyEmail = async (emailAddress: string) => {
   return AxiosClient.post(`${BASE_URL}/verify-email`, { emailAddress }).then(
      (res) => res.data
   )
}

export const resetPassword = async (password: string) => {
   return AxiosClient.post(`${BASE_URL}/reset-password`, { password }).then(
      (res) => res.data
   )
}

export const changePassword = async (data: IChangePassword) => {
   return AxiosClient.post(`${BASE_URL}/change-password`, data).then((res) => res.data)
}
