import { IProduct } from '@/models/product'

export interface ISizeData {
   id?: string
   _id?: string
   name: string
   products: IProduct
}

export interface ISize extends Omit<ISizeData, 'id'> {
   id: string
   _id: string
}
