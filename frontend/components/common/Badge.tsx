import { ReactNode } from 'react'

export interface IBadgeProps {
   quantities: number
   icon: ReactNode
   className?: string
   onClick?: () => void
}

export function Badge({ quantities = 0, icon, className = '', onClick }: IBadgeProps) {
   return (
      <button
         type="button"
         className={`relative inline-flex items-center p-2 text-sm font-medium text-center text-gray-700 rounded-full ${className}`}
         onClick={onClick}
      >
         {icon}
         <span className="sr-only">Notifications</span>
         {quantities > 0 && (
            <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2">
               {quantities}
            </div>
         )}
      </button>
   )
}
