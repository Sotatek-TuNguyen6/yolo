'use client'

import { IMAGE_BLUR } from '@/constants'
import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import { CiPause1 } from 'react-icons/ci'
import { PiPlayLight } from 'react-icons/pi'

export interface IImageProductProps {
   link: string
}

export function ImageProduct({ link }: IImageProductProps) {
   const videoRef = useRef<HTMLVideoElement | null>(null)
   const [isPlay, setIsPlay] = useState<boolean>(true)

   const isVideo = useMemo(() => {
      return link.includes('mp4')
   }, [link])

   const handlePlay = () => {
      if (videoRef.current) {
         videoRef.current.play()
         setIsPlay(true)
      }
   }

   const handlePause = () => {
      if (videoRef.current) {
         videoRef.current.pause()
         setIsPlay(false)
      }
   }

   return (
      <div className="max-w-[520px] w-full h-[517px] relative group">
         {isVideo ? (
            <div className="relative w-full overflow-hidden rounded">
               <video
                  ref={videoRef}
                  className="w-full h-full rounded scale-[1.01]"
                  autoPlay
                  muted
                  loop
                  playsInline
               >
                  <source src={link} type="video/mp4" />
               </video>
               <div className="absolute group-hover:opacity-100 opacity-0 cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-60 rounded-full d-flex duration-common">
                  {isPlay ? (
                     <CiPause1 onClick={handlePause} className="text-[26px] text-white" />
                  ) : (
                     <PiPlayLight
                        onClick={handlePlay}
                        className="text-[26px] text-white"
                     />
                  )}
               </div>
            </div>
         ) : (
            <Image
               src={link}
               alt={link}
               fill
               sizes="100%"
               className="rounded object-cover"
               placeholder="blur"
               blurDataURL={IMAGE_BLUR}
            />
         )}
      </div>
   )
}
