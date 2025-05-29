'use client'

import { ArrowLeftIcon } from '@/components/icons'
import { Metadata } from 'next'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

export const metadata: Metadata = {
   title: 'Trang không tồn tại',
}

export default function HomeNotFound() {
   const router = useRouter()
   const pathname = usePathname()

   const handleBackNavigate = () => {
      router.back()
   }

   return (
      <div className="w-screen h-screen bg-white">
         <div className="flex items-center flex-col max-w-[650px] w-full mx-auto pt-10">
            <div className="relative w-[300px] h-[300px] mb-4">
               <Image
                  src={'/not-found.png'}
                  alt="not found image"
                  sizes="100%"
                  fill
                  className="object-cover"
               />
            </div>
            <h1 className="text-3xl font-semibold text-gray-darker mb-4">
               404 - Không tìm thấy trang
            </h1>
            <p className="w-11/12 text-center m-auto text-sapo">
               Xin lỗi, chúng tôi không tìm thấy trang{' '}
               <span className="text-secondary font-medium underline">{pathname}</span> mà
               bạn đang tìm kiếm.
               <br /> Tên đường dẫn mà bạn đang tìm không có sẵn trong trang website của
               chúng tôi. Bạn vui lòng vào tên đường dẫn đúng mà trang website chúng tôi
               cung cấp.
            </p>
            <button
               className="btn mt-4 !px-8 !py-3 font-medium !rounded-full gap-2"
               onClick={handleBackNavigate}
            >
               <ArrowLeftIcon className="!w-5 !h-5" /> Trở về
            </button>
         </div>
      </div>
   )
}
