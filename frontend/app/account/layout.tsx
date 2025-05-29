import { OwnerInfo } from '@/components/common'
import { Metadata } from 'next'
import { ReactNode } from 'react'

export interface IAccountLayoutProps {
   children: ReactNode
}

export const metadata: Metadata = {
   title: 'Trang khách hàng - LUMEN',
}

export default function AccountLayout({ children }: IAccountLayoutProps) {
   return (
      <section className="min-h-screen bg-cart pt-[88px] pb-10">
         <OwnerInfo title="Tài khoản">{children}</OwnerInfo>
      </section>
   )
}
