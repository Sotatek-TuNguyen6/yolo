'use client'

import { ChangeEvent, useState } from 'react'
import {
   Control,
   FieldValues,
   Path,
   UseFormTrigger,
   useController,
} from 'react-hook-form'
import { EyesCloseIcon, EyesOpenIcon } from '@/components/icons'

export type IPasswordFieldProps<TFormValues extends FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   label?: string
   required?: boolean
   className?: string
   disabled?: boolean
   isTrigger?: boolean
   trigger?: UseFormTrigger<TFormValues>
}

export function PasswordField<TFormValues extends FieldValues = FieldValues>({
   control,
   name,
   label = '',
   required = false,
   className = '',
   disabled = false,
   isTrigger = false,
   trigger,
}: IPasswordFieldProps<TFormValues>) {
   const [show, setShow] = useState<boolean>(false)
   const {
      field: { onChange, value, onBlur, ref },
      formState: { errors },
   } = useController({
      name,
      control,
      rules: { required },
   })

   const error = errors[name] ? 'text-red-600' : ''

   const handleShowChange = () => {
      setShow((prev) => !prev)
   }

   const handlePasswordChange = (e: ChangeEvent) => {
      onChange(e)
      if (isTrigger && trigger) {
         trigger(name)
      }
   }

   return (
      <div className={`py-2 ${className}`} ref={ref}>
         <label
            htmlFor={label}
            className={`block mb-2 text-sm font-semibold text-gray-900 ${error}`}
         >
            {label} {required ? <span className="text-red-600">*</span> : ''}
         </label>
         <div className="w-full relative">
            <input
               id={label}
               type={show ? 'text' : 'password'}
               onChange={handlePasswordChange}
               onBlur={onBlur}
               value={value}
               placeholder="•••••••••"
               className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-secondary focus:border-secondary block w-full p-2.5 ${
                  errors[name]
                     ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                     : ''
               } disabled-input`}
               disabled={disabled}
            />
            <div
               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-dark inline-block cursor-pointer"
               onClick={handleShowChange}
            >
               {show ? (
                  <EyesOpenIcon className="!w-5 !h-5" />
               ) : (
                  <EyesCloseIcon className="!w-5 !h-5" />
               )}
            </div>
         </div>
         {errors[name] && (
            <p className="mt-2 text-xs pl-2 text-red-600 font-medium">
               {errors[name]?.message as string}
            </p>
         )}
      </div>
   )
}
