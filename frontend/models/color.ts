export interface IColorData {
   id?: string
   _id?: string
   name: string
   value: string
}

export interface IColor extends Omit<IColorData, 'id'> {
   id: string
   _id: string
}
