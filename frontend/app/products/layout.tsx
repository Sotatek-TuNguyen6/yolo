import { Metadata } from 'next'
import { ReactNode } from 'react'

export interface IProductLayoutProps {
   children: ReactNode
}

export const metadata: Metadata = {
   title: 'Các mặt hàng dành cho nam, nữ và trẻ em - LUMEN',
}

export default function ProductLayout({ children }: IProductLayoutProps) {
   return <div className="pt-22">{children}</div>
}
