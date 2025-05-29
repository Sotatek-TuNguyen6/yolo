import { EMPTY_OPTION } from '@/constants'
import { ICommonObject } from '@/models'
import { Control, FieldValues, Path, useController } from 'react-hook-form'
import { Dispatch, SetStateAction } from 'react'

export type ISelectFieldProps<TFormValues extends FieldValues = FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   options: ICommonObject[]
   label: string
   required?: boolean
   className?: string
   initValue?: boolean
   placeholder?: string
   setVal?: Dispatch<SetStateAction<any>>
   disabled?: boolean
}

export function SelectField<TFormValues extends FieldValues = FieldValues>({
   control,
   name,
   label,
   required = false,
   className = '',
   options,
   initValue = false,
   placeholder = '',
   disabled = false,
}: ISelectFieldProps<TFormValues>) {
   const {
      field: { onChange, value, onBlur, ref },
      formState: { errors },
   } = useController({
      name,
      control,
      rules: { required },
   })

   const error =
      name.split('.').length > 1 && name.includes('.')
         ? (errors?.[name.split('.')[0] as string] as any)?.[name.split('.')[1] as string]
         : ''

   return (
      <div className={`py-2 ${className}`} ref={ref}>
         <label
            htmlFor={label}
            className={`block mb-2 text-sm font-semibold text-gray-900 ${
               !!error ? 'text-red-600' : ''
            }`}
         >
            {label} {required ? <span className="text-red-600">*</span> : ''}
         </label>
         <select
            id={label}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            className={`bg-gray-50 border cursor-pointer border-gray-300 text-gray-900 text-sm rounded focus:ring-secondary focus:border-secondary block w-full p-2.5 ${
               !!error ? 'border-red-600' : ''
            } disabled:cursor-default`}
            disabled={disabled}
         >
            {initValue && <option value={EMPTY_OPTION}>{placeholder}</option>}
            {options.map((option) => (
               <option
                  key={(option.value || option.code) as string}
                  value={
                     (option.value ||
                        JSON.stringify({
                           name: option.name,
                           code: option.code,
                        })) as string
                  }
               >
                  {option.name as string}
               </option>
            ))}
         </select>
         {!!error && (
            <p className="mt-2 text-xs pl-2 text-red-600 font-medium">
               {error.message as string}
            </p>
         )}
      </div>
   )
}
