import { ReactNode } from 'react'

export interface IAuthLayoutProps {
   children: ReactNode
}

export default function AuthLayout({ children }: IAuthLayoutProps) {
   return (
      <section className="w-screen h-auto bg-auth-pattern bg-center bg-fixed bg-no-repeat bg-cover overflow-x-hidden pt-10">
         {children}
      </section>
   )
}
