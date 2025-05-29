import { IUser } from '@/models/user'

export interface IContactData {
   id?: string
   _id?: string
   user: string | IUser
   fullName: string
   emailAddress: string
   content: string
}

export interface IContact extends Omit<IContactData, 'id' | '_id'> {
   id: string
   _id: string
}
