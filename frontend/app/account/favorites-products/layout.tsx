import { Metadata } from 'next'
import { ReactNode } from 'react'

export interface IFavoritesProductProps {
   children: ReactNode
}

export const metadata: Metadata = {
   title: 'Yêu thích - Sản phẩm không thể bỏ lỡ của LUMEN',
}

export default function FavoritesProduct({ children }: IFavoritesProductProps) {
   return <>{children}</>
}
