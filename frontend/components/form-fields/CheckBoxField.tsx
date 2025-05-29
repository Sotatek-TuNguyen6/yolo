import { Control, FieldValues, Path, useController } from 'react-hook-form'

export type ICheckBoxFieldProps<TFormValues extends FieldValues = FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   label?: string
   className?: string
   required?: boolean
   disabled?: boolean
}

export function CheckBoxField<TFormValues extends FieldValues = FieldValues>({
   control,
   name,
   label = '',
   className = '',
   required = false,
   disabled = false,
}: ICheckBoxFieldProps<TFormValues>) {
   const {
      field: { onChange, value, onBlur, ref },
   } = useController({
      name,
      control,
      rules: { required },
   })

   return (
      <div className={`py-2 flex items-center ${className}`} ref={ref}>
         <input
            type="checkbox"
            id={label}
            onChange={onChange}
            onBlur={onBlur}
            checked={value}
            value={value}
            className="w-4 h-4 text-secondary cursor-pointer bg-gray-100 border-gray-300 rounded focus:ring-secondary"
            disabled={disabled}
         />
         <label
            htmlFor={label}
            className="ml-2 text-sm font-semibold text-sapo dark:text-gray-300 cursor-pointer"
         >
            {label}
         </label>
      </div>
   )
}
