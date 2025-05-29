import { ReactNode } from 'react'

export interface INavUserHeaderProps {
   title: string | ReactNode
   children?: ReactNode
   className?: string
}

export function NavUserHeader({ title, children, className = '' }: INavUserHeaderProps) {
   return (
      <div className={`px-[30px] py-4 border-b border-gray-border ${className}`}>
         <h2 className="font-semibold text-secondary-dark">{title}</h2>
         {children}
      </div>
   )
}
