'use client'

import { ICommonObject, IPaymentMethodOrder } from '@/models'
import { useState } from 'react'
import {
   Control,
   FieldValues,
   Path,
   UseFormTrigger,
   useController,
} from 'react-hook-form'

export type IRadioFieldProps<TFormValues extends FieldValues = FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   className?: string
   required?: boolean
   radios: ICommonObject[]
   defaultValue?: string
   trigger: UseFormTrigger<TFormValues>
}

export function RadioField<TFormValues extends FieldValues = FieldValues>({
   control,
   name,
   className = '',
   required = false,
   radios,
   defaultValue = '',
   trigger,
}: IRadioFieldProps<TFormValues>) {
   const [radioVal, setRadioVal] = useState<any>(defaultValue)
   const {
      field: { onChange, ref },
   } = useController({
      name,
      control,
      rules: { required },
   })

   const handleRadioChange = (value: string) => {
      setRadioVal(value as IPaymentMethodOrder)
      onChange(value)
      trigger(name)
   }

   return (
      <div className={`py-2 ${className}`} ref={ref}>
         {radios.map((radio) => (
            <label
               htmlFor={radio.val as string}
               key={radio.val as string}
               className={`cursor-pointer grid grid-cols-1 gap-4 items-center py-2.5 my-3 border border-gray-border p-4 rounded first-of-type:mt-0 hover:bg-gray-100 duration-common hover:border-secondary ${
                  radio.val === radioVal ? 'border-secondary' : ''
               }`}
               onClick={() => handleRadioChange(radio.val as string)}
            >
               <div className="flex w-full gap-2 items-center">
                  <input
                     type="radio"
                     id={radio.val as string}
                     value={radio.val as string}
                     className="checked:bg-secondary"
                     name={name}
                     checked={radio.val === radioVal}
                     onChange={() => {}}
                  />
                  <span className="block text-gray-700 text-sm flex-1">
                     {radio.name as string}
                  </span>
               </div>
            </label>
         ))}
      </div>
   )
}
