import { Metadata } from 'next'
import { ReactNode } from 'react'

export interface ISignUpLayoutProps {
   children: ReactNode
}

export const metadata: Metadata = {
   title: 'Đăng ký tài khoản - LUMEN',
   description: 'Đăng ký tài khoản trên LUMEN',
}

export default function SignUpLayout({ children }: ISignUpLayoutProps) {
   return <>{children}</>
}
