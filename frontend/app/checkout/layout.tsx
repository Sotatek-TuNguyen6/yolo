import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
   title: 'Thanh toán - LUMEN',
   icons: {
      icon: '/checkout_favicon.ico',
      apple: '/checkout_favicon.ico',
   },
}

export interface ICheckoutLayoutProps {
   children: ReactNode
}

export default function CheckoutLayout({ children }: ICheckoutLayoutProps) {
   return <section className="bg-cart min-h-screen pt-[88px] pb-10">{children}</section>
}
