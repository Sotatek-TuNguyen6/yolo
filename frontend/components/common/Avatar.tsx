import { EMPTY_AVATAR } from '@/constants'
import Image from 'next/image'

export interface IAvatarProps {
   img: string
   className?: string
}

export function Avatar({ img, className = '' }: IAvatarProps) {
   return (
      <Image
         src={img || EMPTY_AVATAR}
         fill
         className={`img !rounded-full ${className}`}
         alt="Rounded avatar"
      />
   )
}
