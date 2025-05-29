import { Footer, Header } from '@/components/common'
import '@/styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
   title: 'Giỏ hàng',
   icons: {
      icon: '/favicon.ico',
      apple: '/favicon.ico',
   },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
   return (
      <section className="bg-cart w-full min-h-screen pt-[104px] pb-10">
         {children}
      </section>
   )
}
