import { Metadata } from 'next'
import { ReactNode } from 'react'

export interface ILoginLayoutProps {
   children: ReactNode
}

export const metadata: Metadata = {
   title: 'Đăng nhập tài khoản - LUMEN',
   description: 'Đăng nhập tài khoản LUMEN',
}

export default function LoginLayout({ children }: ILoginLayoutProps) {
   return <>{children}</>
}
