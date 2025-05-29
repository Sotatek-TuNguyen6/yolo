import { BaseDate, ICategory } from '.'

export interface ISubCategoryData {
   id?: string
   _id?: string
   name: string
   categoryParents: (ICategory | string)[]
   slug: string
   imageUrl?: string
}

export type ISubCategory = Omit<ISubCategoryData, 'id' | '_id'> &
   BaseDate & {
      id: string
      _id: string
   }
