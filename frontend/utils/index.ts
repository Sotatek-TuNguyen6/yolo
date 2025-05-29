import { QUERY_KEYS } from '@/constants'
import { Gender, GenderVi } from '@/enums'
import {
   IAddressData,
   IAddressValue,
   IAddressValueFormat,
   ICommonObject,
   IGender,
   IGenderVi,
} from '@/models'

export * from '@/utils/filters'
export * from '@/utils/jwt'
export * from '@/utils/storages'
export * from '@/utils/uploadImage'
export * from '@/utils/date'
export * from '@/utils/status'
export * from '@/utils/calcSize'
export * from '@/utils/api'
export * from '@/utils/generateUsername'

export const formatCurrency = (num: number) => {
   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      num
   )
}

export const formatAddress = (address: IAddressData | IAddressValueFormat) => {
   const street = address.street ? `${address.street}, ` : ''
   const ward = address.ward ? `${(address.ward as IAddressValue).name}, ` : ''
   const district = address.district
      ? `${(address.district as IAddressValue).name}, `
      : ''
   const province = address.province ? `${(address.province as IAddressValue).name}` : ''

   return `${street}${ward}${district}${province}`
}

const excludeQueries = [QUERY_KEYS.PAGE, QUERY_KEYS.SORT]

export const convertUrlParams = (params: URLSearchParams) => {
   const paramsObj: ICommonObject = {}
   for (const key of Array.from(params.keys())) {
      if (excludeQueries.includes(key)) {
         paramsObj[key] = params.get(key) as string
         continue
      }

      if (params.getAll(key).length > 1) {
         paramsObj[key] =
            key === QUERY_KEYS.PRICES
               ? params.getAll(key).map((x) => JSON.parse(x))
               : (params.getAll(key) as string[])
      } else {
         paramsObj[key] =
            key === QUERY_KEYS.PRICES
               ? [JSON.parse((params.get(key) as string) || '')]
               : [params.get(key) as string]
      }
   }

   return paramsObj
}

export const formatGender = (gender: IGender) => {
   let convertGenderToVi: IGenderVi
   switch (gender) {
      case Gender.MALE: {
         convertGenderToVi = GenderVi.MALE
         break
      }
      case Gender.FEMALE: {
         convertGenderToVi = GenderVi.FEMALE
         break
      }
      case Gender.OTHER: {
         convertGenderToVi = GenderVi.OTHER
         break
      }
   }

   return convertGenderToVi
}

export const formatNumber = (num: number) => {
   if (num > 999) {
      const newNum = num / 1000
      return `${newNum}K`
   }
   return num
}
