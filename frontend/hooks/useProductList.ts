import { productApi } from '@/api'
import { QUERY_KEYS } from '@/constants'
import { IQueryProduct } from '@/models'
import useSWR, { SWRConfiguration } from 'swr'

export interface IUseProductList {
   params: IQueryProduct
   options?: SWRConfiguration
}

export const useProductList = ({ params, options }: IUseProductList) => {
   const result = useSWR(
      [QUERY_KEYS.PRODUCT_LIST, params],
      () => productApi.getAllProducts(params),
      {
         keepPreviousData: true,
         dedupingInterval: 30 * 1000, // 30s
         fallbackData: {
            data: {
               nextPage: 0,
               prevPage: 0,
               products: [],
               total: 0,
            },
         },
         ...options,
      }
   )
   return result
}
