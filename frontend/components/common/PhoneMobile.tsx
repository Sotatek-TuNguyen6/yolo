'use client'

import { CloseIcon, PhoneIcon } from '@/components/icons'
import Image from 'next/image'
import { useState } from 'react'

export interface IPhoneMobileProps {}

export function PhoneMobile() {
   const [isShow, setIsShow] = useState<boolean>(false)

   const handlePhoneMobileOpen = () => {
      setIsShow(true)
   }

   const handlePhoneMobileClose = () => {
      setIsShow(false)
   }

   return (
      <div>
         <div className="fixed bottom-28 right-8 cursor-pointer">
            <a
               href="tel:02499986999"
               className="relative inline-block w-14 h-14 animate-animatePhoneCall"
               onClick={handlePhoneMobileOpen}
            >
               <span className="absolute animate-ping inline-block bg-shadow-color w-14 h-14 rounded-full"></span>
               <Image
                  src={'/phone-mobile.png'}
                  alt=""
                  sizes="100%"
                  fill
                  className="object-cover"
               />
            </a>
         </div>
         <div
            className={`fixed shadow-default flex flex-col items-center bottom-28 right-32 w-[350px] px-8 py-10 rounded-md bg-white z-30 ${
               isShow ? 'scale-100' : 'scale-0'
            } duration-common`}
         >
            <div
               className="inline-block absolute right-7 top-6 cursor-pointer"
               onClick={handlePhoneMobileClose}
            >
               <CloseIcon className="!w-7 !h-7" />
            </div>
            <div className="relative w-[250px] h-[250px]">
               <Image
                  src={'/contact-us.png'}
                  alt=""
                  fill
                  sizes="100%"
                  className="object-cover"
               />
            </div>
            <p className="text-center text-sm font-medium text-sapo">
               Liên hệ ngay với LUMEN để được tư vấn
            </p>
            <div className="rounded-full w-4/6 m-auto border border-primary-light d-flex py-2.5 gap-2 mt-6">
               <PhoneIcon fill="currentColor" className="!w-5 !h-5 text-primary-light" />{' '}
               <span className="text-primary-light font-semibold text-lg">
                  02499986999
               </span>
            </div>
         </div>
      </div>
   )
}
