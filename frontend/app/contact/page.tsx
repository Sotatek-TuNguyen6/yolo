'use client'

import { ContactForm, ContactItem } from '@/components/Contact'
import { Container } from '@/components/common'
import { PhoneIcon } from '@/components/icons'
import { BG_CONTACT } from '@/constants'
import Image from 'next/image'
import { FaQuestion } from 'react-icons/fa'

export default function Contact() {
   return (
      <div className="mt-10 mb-14">
         <Container>
            <h1 className="uppercase text-3xl text-sapo font-medium mb-4">
               Liên hệ - Hỗ trợ khách hàng LUMEN
            </h1>
            <div className="grid grid-cols-[300px_1fr_1fr] grid-rows-[auto_1fr] gap-x-5 gap-y-3">
               <div className="col-start-1 col-span-1 rows-start-1 rows-span-1"></div>
               <div className="col-start-2 col-span-1 rows-start-1 rows-span-1">
                  <ContactItem
                     childrenIcon={<FaQuestion />}
                     title={'Gửi thắc mắc:'}
                     description={'chamsockhachhang@LUMEN.vn'}
                     href={'mailto:chamsockhachhang@LUMEN.vn'}
                  />
               </div>
               <div className="col-start-3 col-span-1 rows-start-1 rows-span-1">
                  <ContactItem
                     childrenIcon={
                        <PhoneIcon className="!w-5 !h-5" fill="currentColor" />
                     }
                     title={'Điện thoại:'}
                     description={'18002086'}
                     href={'tel:18002086'}
                  />
               </div>

               <div className="relative w-full min-h-[500px] rows-start-2 rows-span-1">
                  <Image src={BG_CONTACT} alt={''} fill sizes="100%" className="img" />
               </div>
               <div className="col-start-2 col-span-2 rows-start-2 rows-span-1">
                  <ContactForm />
               </div>
            </div>
         </Container>
      </div>
   )
}
