import { ReactNode } from 'react'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

export type IProductDetailRightFieldProps<TFormValues extends FieldValues> = {
   control: Control<TFormValues>
   name: Path<TFormValues>
   children: ReactNode
   label?: string
   val?: any
   className?: string
}

export function ProductDetailRightField<TFormValues extends FieldValues>({
   control,
   name,
   children,
   label,
   val,
   className = '',
}: IProductDetailRightFieldProps<TFormValues>) {
   const {
      field: { ref },
      formState: { errors },
   } = useController({
      name,
      control,
   })

   const error = errors[name]

   return (
      <div
         className={`mt-4 -mx-1 ${className} rounded border-4 border-dashed ${
            error ? 'border-red-600 pt-4 pb-2 px-4' : 'border-transparent pt-0 pb-0 px-0'
         }`}
         ref={ref}
      >
         <h2 className="mb-2 text-sm text-sapo">
            {label}:{' '}
            {val && <span className="font-semibold text-sapo capitalize">{val}</span>}
         </h2>
         <div className="flex flex-wrap">{children}</div>
      </div>
   )
}
