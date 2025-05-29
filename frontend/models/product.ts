import { BaseDate, ICategory, IColor, IListResponse, ISize, ISubCategory, IUser } from '.'

export interface IImage {
   color: string | IColor
   images: string[]
}

export interface IProductData {
   id?: string
   _id?: string
   name: string
   subContent?: string
   content?: string
   originPrice?: number
   price?: number
   discount?: number
   imageUrls: IImage[]
   isFreeShip?: boolean
   featuredImage: string
   views?: number
   ratings?: (string | IUser)[]
   ratingAverage: number
   colors?: string[] | IColor[]
   category: string | ICategory
   subCategory: string | ISubCategory
   sizes: (ISize | string)[]
   availableQuantities?: number
   likes: (string | IUser)[]
   comments?: []
   unitsSold: number
   usersSold: (string | IUser)[]
   summary: string
   slug?: string
}

export type IProduct = Omit<IProductData, 'id' | '_id'> &
   BaseDate & {
      id: string
      _id: string
   }

export interface IProductDetailForm {
   color: IColor | null | string
   size: string
   quantities: number
}

export interface IProductResponse extends IListResponse {
   products: IProduct[]
}
