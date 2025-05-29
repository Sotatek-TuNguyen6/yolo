import { IColor, IProduct, ISize, IUser } from '@/models'

export interface ICartItem {
   id?: string
   _id?: string
   product: IProduct | string
   quantities: number
   color: IColor | string
   size: ISize | string
}

export interface ICartData {
   id?: string
   _id?: string
   user: IUser | string
   items: ICartItem[]
}

export interface ICart extends Omit<ICartData, 'id'> {
   id: string
   _id?: string
}

export interface ICartsRes {
   carts: ICart[]
   total: number
}

export interface ICartForm {
   user: string | IUser
   item: ICartItem
}
