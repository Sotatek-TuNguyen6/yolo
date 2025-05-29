import { Control, FieldValues, Path, useController } from 'react-hook-form'

export type IInputFieldProps<TFormValues extends FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   label?: string
   required?: boolean
   type?: string
   placeholder?: string
   className?: string
   multiline?: boolean
   rows?: number
   disabled?: boolean
   noResize?: boolean
}

export function InputField<TFormValues extends FieldValues = FieldValues>({
   control,
   name,
   label = '',
   required = false,
   type = 'text',
   placeholder = '',
   className = '',
   multiline = false,
   rows = 4,
   disabled = false,
   noResize,
}: IInputFieldProps<TFormValues>) {
   const {
      field: { onChange, value, onBlur, ref },
      formState: { errors },
   } = useController({
      name,
      control,
      rules: { required },
   })

   const error = errors[name] ? 'text-red-600' : ''

   return (
      <div className={`py-2 ${className}`} ref={ref}>
         {label && (
            <label
               htmlFor={label}
               className={`block mb-2 text-sm font-semibold text-gray-900 ${error}`}
            >
               {label} {required ? <span className="text-red-600">*</span> : ''}
            </label>
         )}
         {multiline ? (
            <textarea
               id={label}
               onChange={onChange}
               onBlur={onBlur}
               value={value}
               placeholder={placeholder}
               rows={rows}
               className={`block p-2.5 w-full text-sm text-gray-900 min-h-[100px] bg-gray-50 rounded border border-gray-300 focus:ring-secondary focus:border-secondary ${
                  errors[name]
                     ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                     : ''
               } ${noResize ? 'resize-none' : ''}`}
               disabled={disabled}
            />
         ) : (
            <input
               id={label}
               type={type}
               onChange={onChange}
               onBlur={onBlur}
               value={value}
               ref={ref}
               placeholder={placeholder}
               disabled={disabled}
               className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-secondary focus:border-secondary block w-full p-2.5 ${
                  errors[name]
                     ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                     : ''
               } disabled-input`}
            />
         )}
         {errors[name] && (
            <p className="mt-2 text-xs pl-2 text-red-600 font-medium">
               {errors[name]?.message as string}
            </p>
         )}
      </div>
   )
}
