import { getLs, setLs } from '@/utils'
import {
   AxiosError,
   AxiosInstance,
   AxiosResponse,
   InternalAxiosRequestConfig,
} from 'axios'
import { authApi } from '.'

const onRequestConfig = (config: InternalAxiosRequestConfig) => {
   if (!config.headers['Authorization']) {
      const token = getLs(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY as string)
      if (token) {
         config.headers['Authorization'] = `Bearer ${token}`
      }
   }

   if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
   }

   return config
}

const onError = (error: AxiosError): Promise<AxiosError> => {
   return Promise.reject(error.response?.data)
}

const onResponseConfig = (res: AxiosResponse): AxiosResponse => {
   return res
}

const onResponseError = async (
   err: AxiosError,
   axiosInstance: AxiosInstance
): Promise<AxiosError | undefined> => {
   const originalConfig = err.config as InternalAxiosRequestConfig

   console.log('status:', err.response?.status)

   if (err.response?.status === 401) {
      const refreshToken = getLs(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY as string)
      console.log('refresh token:', refreshToken)
      if (!refreshToken) window.location.href = '/login'

      const token = await authApi.refreshToken(refreshToken)

      setLs(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY as string, token.data.accessToken)
      setLs(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY as string, token.data.refreshToken)

      originalConfig.headers.Authorization = `Bearer ${token.data.accessToken}`
      return axiosInstance(originalConfig)
   }

   return Promise.reject(err?.response?.data)
}

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
   axiosInstance.interceptors.request.use(onRequestConfig, onError)
   axiosInstance.interceptors.response.use(onResponseConfig, (err: AxiosError) =>
      onResponseError(err, axiosInstance)
   )
}
