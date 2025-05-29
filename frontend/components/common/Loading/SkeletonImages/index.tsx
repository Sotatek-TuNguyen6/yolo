import { IMAGE_BLUR } from '@/constants'
import Image from 'next/image'

export interface ISkeletonImagesProps {
   length?: number
   className?: string
   imageClassName?: string
}

export function SkeletonImages({
   length = 6,
   className = '',
   imageClassName = '',
}: ISkeletonImagesProps) {
   return (
      <div className={`grid grid-cols-2 gap-4 w-full ${className}`}>
         {Array.from({ length }).map((item, idx) => (
            <div key={idx} className={`relative w-full h-[517px] ${imageClassName}`}>
               <Image src={IMAGE_BLUR} alt={''} fill sizes="100%" />
            </div>
         ))}
      </div>
   )
}
