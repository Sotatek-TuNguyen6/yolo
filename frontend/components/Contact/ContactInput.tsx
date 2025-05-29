import { Control, FieldValues, Path, useController } from 'react-hook-form'

export type IContactInputProps<IForms extends FieldValues = FieldValues> = {
   label: string
   control: Control<IForms>
   name: Path<IForms>
   required?: boolean
   multiline?: boolean
   className?: string
   rows?: number
}

export function ContactInput<IForms extends FieldValues = FieldValues>({
   required = false,
   name,
   control,
   label,
   multiline = false,
   className = '',
   rows = 3,
}: IContactInputProps<IForms>) {
   const {
      field: { onChange, onBlur, value },
      formState: { errors },
   } = useController({
      name,
      control,
   })

   const error = errors[name]

   return (
      <div className={`flex flex-col w-full mb-4 ${className}`}>
         <label
            className={`inline-block mb-2 text-sm font-semibold ${
               error ? 'text-red-500' : 'text-sapo'
            }`}
         >
            {label} {required && <span className="text-red-600">*</span>}
         </label>
         {multiline ? (
            <textarea
               rows={rows}
               value={value}
               onChange={onChange}
               onBlur={onBlur}
               className={`resize-none bg-cart-dark rounded-tr rounded-br p-2.5 pl-4 shadow-none border-transparent !border-l-2 text-sm font-medium appearance-none text-sapo focus:border-transparent focus:outline-none focus:appearance-none outline-none min-h-[280px] ${
                  error ? 'border-l-red-600' : 'border-l-secondary-dark'
               } duration-common`}
            ></textarea>
         ) : (
            <input
               type="text"
               value={value}
               onChange={onChange}
               onBlur={onBlur}
               className={`bg-cart-dark rounded-tr rounded-br p-2.5 pl-4 shadow-none border-transparent !border-l-2 text-sm font-medium appearance-none text-sapo focus:border-transparent focus:outline-none focus:appearance-none outline-none ${
                  error ? 'border-l-red-600' : 'border-l-secondary-dark'
               } duration-common`}
            />
         )}
         {error && (
            <p className="text-xs text-red-600 pt-2">{error?.message as string}</p>
         )}
      </div>
   )
}
