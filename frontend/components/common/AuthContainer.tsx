import { ReactNode } from 'react'

export interface IAuthContainerProps {
   children: ReactNode
   className?: string
}

export function AuthContainer({ children, className = '' }: IAuthContainerProps) {
   return <div className={`d-flex min-h-screen ${className}`}>{children}</div>
}
