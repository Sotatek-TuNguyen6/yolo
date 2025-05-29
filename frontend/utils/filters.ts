import { ICategory, IColor, ISize } from '@/models'

export type IAllFilters = ICategory[] | IColor[] | ISize[]

export const getListEachFilter = <T extends any[]>(
   type: string,
   params: URLSearchParams,
   list: T
) => {
   const ids = params.getAll(type) || [params.get(type)]
   const newList = list
      ?.filter(
         (x) => ids.includes(x._id as string) || ids.includes(JSON.stringify(x.value))
      )
      .map((c) => ({ ...c, type }))

   return newList
}
