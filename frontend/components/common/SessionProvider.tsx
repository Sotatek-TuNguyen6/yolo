'use client'

import { Session } from 'next-auth'
import { SessionProvider as Provider } from 'next-auth/react'
import { ReactNode } from 'react'

export interface ISessionProviderProps {
   children: ReactNode
   session: Session | null
}

export function SessionProvider({ children, session }: ISessionProviderProps) {
   return <Provider session={session}>{children}</Provider>
}
