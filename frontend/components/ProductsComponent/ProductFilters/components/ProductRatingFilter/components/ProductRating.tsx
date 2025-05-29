import { ChoseIcon, StarIcon } from '@/components/icons'
import { useCallback, useId } from 'react'

export interface IProductRatingProps {
   numsStar: number
   currentRating: number[]
   className?: string
   onRatingClick?: (nums: number) => void
}

export function ProductRating({
   numsStar,
   currentRating,
   className = '',
   onRatingClick,
}: IProductRatingProps) {
   const id = useId()

   const checked = useCallback(
      (num: number) => {
         return currentRating.includes(numsStar)
      },
      [currentRating]
   )

   const handleRatingClick = () => {
      if (onRatingClick) onRatingClick(numsStar)
   }

   return (
      <div
         className={`relative block px-3 py-2 rounded cursor-pointer border ${
            checked(numsStar)
               ? 'border-secondary bg-white'
               : 'border-transparent bg-gray-light-border'
         } ${className}`}
         onClick={handleRatingClick}
      >
         {checked(numsStar) && (
            <div className="absolute top-0 right-0 cursor-pointer">
               <ChoseIcon />
            </div>
         )}
         <div className="inline-flex gap-1.5 item-center">
            <span
               className={`font-medium text-sm ${
                  checked(numsStar) ? 'text-secondary' : 'text-tag'
               }`}
            >
               {numsStar}
            </span>
            <ul className="flex items-center">
               {Array.from(new Array(numsStar)).map((_, idx) => (
                  <li key={`${id}-${idx}`}>
                     <StarIcon
                        className="!w-4 !h-4 text-secondary-dark"
                        fill="currentColor"
                     />
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}
