import { Control, FieldValues, Path, useController } from 'react-hook-form'
import Datepicker from 'react-tailwindcss-datepicker'

export type IDatePickerFieldProps<TFormValues extends FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   label?: string
   required?: boolean
   className?: string
   placeholder?: string
   disabled?: boolean
}

export function DatePickerField<TFormValues extends FieldValues>({
   control,
   name,
   label = '',
   required = false,
   className = '',
   placeholder = '',
   disabled = false,
}: IDatePickerFieldProps<TFormValues>) {
   const {
      field: { onChange, value, ref },
      formState: { errors },
   } = useController({
      name,
      control,
      rules: { required },
   })

   const error = errors[name] ? 'text-red-600' : ''

   return (
      <div className={`py-2 ${className}`} ref={ref}>
         <label
            htmlFor={label}
            className={`block mb-2 text-sm font-semibold text-gray-900 ${error}`}
         >
            {label} {required ? <span className="text-red-600">*</span> : ''}
         </label>
         <Datepicker
            i18n={'vi'}
            primaryColor={'blue'}
            useRange={false}
            asSingle={true}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            displayFormat="DD/MM/YYYY"
            inputClassName={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 ${
               errors[name]
                  ? 'border-red-600 focus:ring-red-500 focus:border-red-500'
                  : ''
            }`}
            disabled={disabled}
         />
         <p className="mt-2 text-xs pl-2 text-red-600 font-medium">
            {errors[name]?.message as string}
         </p>
      </div>
   )
}
