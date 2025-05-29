'use client'

import { ITypeMeasurement } from '@/models'
import debounce from 'lodash.debounce'
import { ChangeEvent, useCallback, useRef, useState } from 'react'

export interface IProductChooseSizeRangeProps {
   title: string
   type: ITypeMeasurement
   min: number
   max: number
   currency: string
   onMeasurementChange: (value: number, type: ITypeMeasurement) => void
}

export function ProductChooseSizeRange({
   title,
   type,
   min,
   max,
   currency,
   onMeasurementChange,
}: IProductChooseSizeRangeProps) {
   const [value, setValue] = useState<number>(min)
   const inputRangeRef = useRef<HTMLInputElement | null>(null)

   const handleSendValue = useCallback(
      debounce((value: number) => {
         onMeasurementChange(value, type)
      }, 1000),
      []
   )

   const handleRangeChange = (e: ChangeEvent<HTMLInputElement>) => {
      const currentRange = Number(e.target.value)
      handleSendValue(currentRange)
      if (inputRangeRef.current) {
         const progressPercent = Math.floor(((currentRange - min) / (max - min)) * 100)
         inputRangeRef.current.style.background = `linear-gradient(to right, rgb(252, 175, 23) 0%, rgb(252, 175, 23) ${progressPercent}%, rgb(242, 242, 242) ${progressPercent}%, rgb(242, 242, 242) 100%)`
      }
      setValue(currentRange)
   }

   return (
      <div className="flex flex-col gap-3">
         <div className="text-sm flex justify-between items-center font-medium text-sapo">
            <span>{title}</span>
            <span className="text-base">
               {value}
               {currency}
            </span>
         </div>
         <input
            ref={inputRangeRef}
            type="range"
            defaultValue={min}
            min={min}
            max={max}
            step={1}
            onChange={handleRangeChange}
            className="appearance-none bg-gray-light-border h-[6px] rounded outline-none focus:outline-none"
         />
      </div>
   )
}
