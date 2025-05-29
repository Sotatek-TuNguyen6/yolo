import { Metadata } from 'next'
import { ReactNode } from 'react'

export interface IVerifyAccountLayoutProps {
   children: ReactNode
}

export const metadata: Metadata = {
   title: 'Xác nhận tài khoản - LUMEN',
   description: 'Xác nhận tài khoản đã đăng ký',
}

export default function VerifyAccountLayout({ children }: IVerifyAccountLayoutProps) {
   return <>{children}</>
}
