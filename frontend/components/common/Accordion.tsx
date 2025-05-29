'use client'

import { ChevronUpIcon } from '@/components/icons'
import { ReactNode, useState } from 'react'

export interface IAccordionProps {
   title: string
   children: ReactNode
   className?: string
}

export function Accordion({ title, children, className = '' }: IAccordionProps) {
   const [isShow, setIsShow] = useState<boolean>(true)

   const handleShowAccordion = () => {
      setIsShow((prev) => !prev)
   }

   return (
      <div className={`w-full group ${isShow ? 'is-active' : ''} ${className}`}>
         <h2
            className="cursor-pointer flex justify-between font-medium text-sapo pt-1 mb-2"
            onClick={handleShowAccordion}
         >
            <span className="text-[#333]">{title}</span>
            <div>
               <ChevronUpIcon
                  className={`!w-4 !-h-4 !text-sapo ${
                     isShow ? 'rotate-0' : 'rotate-180'
                  } !duration-700`}
               />
            </div>
         </h2>
         <div className="filter-scroll max-h-0 overflow-y-auto group-[.is-active]:max-h-[300px] pr-2 h-auto group-[.is-active]:pb-2 duration-700 ease-in-out">
            {children}
         </div>
      </div>
   )
}
