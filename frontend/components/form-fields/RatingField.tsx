'use client'

import { rates } from '@/data'
import { Fragment, useState } from 'react'
import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { AiFillStar } from 'react-icons/ai'

export type IRatingFieldProps<TFormValues extends FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   className?: string
}

export function RatingField<TFormValues extends FieldValues = FieldValues>({
   control,
   name,
   className = '',
}: IRatingFieldProps<TFormValues>) {
   const {
      field: { onChange },
   } = useController({
      name,
      control,
   })
   const [val, setVal] = useState<number>(5)

   const handleRatingClick = (rate: number) => {
      onChange(rate)
      setVal(rate)
   }

   return (
      <div className={`${className}`}>
         <div className="inline-flex items-center">
            {rates.map((rate) => (
               <Fragment key={rate.id}>
                  <input
                     id={`rate-${rate.id}`}
                     type="radio"
                     name="rate"
                     className="hidden input-rating"
                     checked={rate.id === val}
                     onChange={() => handleRatingClick(rate.id)}
                  />
                  <label
                     htmlFor={`rate-${rate.id}`}
                     className="cursor-pointer"
                     title={rate.title}
                     onClick={() => handleRatingClick(rate.id)}
                  >
                     <AiFillStar
                        className={`!w-7 !h-7 ${
                           rate.id <= val
                              ? 'text-secondary-dark'
                              : 'text-transparent stroke-secondary-dark'
                        }`}
                        strokeWidth={48}
                     />
                  </label>
               </Fragment>
            ))}
         </div>
      </div>
   )
}
