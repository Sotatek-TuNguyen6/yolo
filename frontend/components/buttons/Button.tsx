import { ITypeButton } from '@/models'
import { ReactNode } from 'react'
import { AnimateSpinIcon } from '@/components/icons'

export interface IButtonProps {
   title: string | ReactNode
   className?: string
   isLoading?: boolean
   type?: ITypeButton
   disabled?: boolean
   loadingClassName?: string
   disabledClassName?: string
   onClick?: (() => void) | (() => Promise<void>)
   children?: ReactNode
   id?: string
}

export function Button({
   className = '',
   title,
   isLoading = false,
   type = 'button',
   disabled = false,
   loadingClassName = '',
   disabledClassName = 'disabled-btn',
   onClick,
   children,
   id,
}: IButtonProps) {
   return (
      <button
         type={type}
         className={`btn ${disabledClassName} ${className}`}
         disabled={disabled}
         onClick={onClick ? onClick : undefined}
         id={id || ''}
      >
         {!isLoading ? (
            <>
               {title} {children}
            </>
         ) : (
            <AnimateSpinIcon className={loadingClassName} />
         )}
      </button>
   )
}
