import { IProduct } from '@/models'

export interface ICategoryData {
   id?: string
   _id?: string
   name: string
   description?: string
   imageUrl?: string
   slug?: string
   products?: (IProduct | string)[]
}

export interface ICategory extends Omit<ICategoryData, 'id'> {
   id: string
   _id: string
}
