'use client'

import { getLs } from '@/utils'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export interface IContainerProps {
   children: ReactNode
   className?: string
}

const noLogged = ['/login', '/signup', '/verify-account']

const logged = [
   '/cart',
   '/checkout',
   '/account',
   '/account/addresses',
   '/account/favorite-products',
   '/account/purchase',
   '/account/recently-viewed',
]

export function Container({ children, className = '' }: IContainerProps) {
   const router = useRouter()
   const pathname = usePathname()
   const user = getLs(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY!)

   useEffect(() => {
      if (noLogged.includes(pathname!) && user) {
         router.back()
      }

      if (logged.includes(pathname!) && !user) {
         router.push('/')
      }
   }, [pathname])

   return <div className={`w-[1280px] px-5 m-auto ${className}`}>{children}</div>
}
