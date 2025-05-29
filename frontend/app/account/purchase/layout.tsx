import { Metadata } from 'next'
import { ReactNode } from 'react'

export interface IPurchaseLayoutProps {
   children: ReactNode
}

export const metadata: Metadata = {
   title: 'Trang đơn hàng - LUMEN',
}

export default function PurchaseLayout({ children }: IPurchaseLayoutProps) {
   return <>{children}</>
}
