'use client'

import { ChevronUpIcon } from '@/components/icons'
import { useEffect, useState } from 'react'

export interface IScrollTopProps {}

export function ScrollTop() {
   const [show, setShow] = useState<boolean>(false)

   useEffect(() => {
      const handleScrollTopShow = () => {
         setShow(window.scrollY > 600 ? true : false)
      }
      window.addEventListener('scroll', handleScrollTopShow)
      return () => {
         window.removeEventListener('scroll', handleScrollTopShow)
      }
   })

   const handleScrollTop = () => {
      window.scrollTo(0, 0)
   }

   return (
      <div
         className={`fixed bottom-6 ${
            show ? 'right-8 opacity-100' : '-right-10 opacity-0'
         } duration-common`}
      >
         <div className="relative w-12 h-12 border-2 border-primary-lighter rounded-md">
            <button
               className="absolute top-0 left-0 w-full h-full btn !px-2"
               onClick={handleScrollTop}
            >
               <ChevronUpIcon className="!w-5 !h-5" />
            </button>
         </div>
      </div>
   )
}
