import { ReactNode } from 'react'

export interface ICheckoutFormProps {
   children: ReactNode
   title: string
   className?: string
}

export function CheckoutForm({ children, title, className = '' }: ICheckoutFormProps) {
   return (
      <div className={`border border-gray-border rounded p-10 ${className}`}>
         <h2 className="font-medium text-gray-900 my-2">{title}</h2>
         {children}
      </div>
   )
}
