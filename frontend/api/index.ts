import axios from 'axios'
import { setupInterceptors } from '@/api/interceptor'
export * as authApi from '@/api/authApi'
export * as userApi from '@/api/userApi'
export * as addressApi from '@/api/addressApi'
export * as productApi from '@/api/productApi'
export * as colorApi from '@/api/colorApi'
export * as categoryApi from '@/api/categoryApi'
export * as orderApi from '@/api/orderApi'
export * as cartApi from '@/api/cartApi'
export * as commentApi from '@/api/commentApi'
export * as sizeApi from '@/api/sizeApi'
export * as contactApi from '@/api/contactApi'
export * as subCategoryApi from '@/api/subCategoryApi'
export * as reportApi from '@/api/reportApi'

const AxiosClient = axios.create({
   baseURL: process.env.NEXT_PUBLIC_BASE_API,
   headers: {
      'Content-Type': 'application/json',
   },
})

setupInterceptors(AxiosClient)

export default AxiosClient
