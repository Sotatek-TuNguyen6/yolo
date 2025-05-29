'use client'

import { ChevronUpIcon } from '@/components/icons'
import { ReactNode, useEffect, useRef, useState } from 'react'

export interface IProductDetailAccordingProps {
   title: string
   children: ReactNode
   isDropDown?: boolean
   isShowDropDown?: boolean
   className?: string
   childrenClassName?: string
}

export function ProductDetailAccording({
   children,
   title,
   className = '',
   isDropDown = false,
   isShowDropDown = false,
   childrenClassName = '',
}: IProductDetailAccordingProps) {
   const [isShow, setIsShow] = useState<boolean>(isShowDropDown)
   const [height, setHeight] = useState<string>(`max-h-[300px]`)
   const childrenRef = useRef<HTMLDivElement | null>(null)

   useEffect(() => {
      if (childrenRef.current) {
         setHeight(`max-h-[${childrenRef.current.scrollHeight}px]`)
      }
   }, [childrenRef, isShow])

   const handleShowAccordion = () => {
      if (!isDropDown) return
      setIsShow((prev) => !prev)
   }

   return (
      <article className={`w-full group ${isShow ? 'is-active' : ''} ${className}`}>
         <div className={`px-3 ${isDropDown ? 'cursor-pointer' : 'cursor-default'}`}>
            <h2
               className="flex justify-between items-center text-lg font-semibold text-description uppercase"
               onClick={handleShowAccordion}
            >
               <span className="leading-tight text-sm">{title}</span>
               {isDropDown && (
                  <div>
                     <ChevronUpIcon
                        className={`!w-4 !-h-4 text-gray-900 ${
                           isShow ? 'rotate-0' : 'rotate-180'
                        } !duration-700`}
                     />
                  </div>
               )}
            </h2>
         </div>
         <div
            className={`overflow-hidden max-h-0 group-[.is-active]:max-h-[10000px] duration-500 ease-in-out ${childrenClassName}`}
            ref={childrenRef}
         >
            {children}
         </div>
      </article>
   )
}
