import { productApi } from '@/api'
import { QUERY_KEYS } from '@/constants'
import useSWR, { SWRConfiguration } from 'swr'

export interface IProductDetail {
   params: string
   options?: SWRConfiguration
}

export const useProductDetail = ({ params, options }: IProductDetail) => {
   const result = useSWR(
      params ? [QUERY_KEYS.PRODUCT_DETAIL, params] : null,
      () => productApi.getProduct(params),
      {
         keepPreviousData: true,
         dedupingInterval: 30 * 1000, // 30s
         fallbackData: {
            data: {
               product: null,
            },
         },
         ...options,
      }
   )
   return result
}
