import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
   title: 'Liên hệ - Hỗ trợ khách hàng LUMEN',
}

export interface IContactLayoutProps {
   children: ReactNode
}

export default function ContactLayout({ children }: IContactLayoutProps) {
   return <section className="pt-header">{children}</section>
}
