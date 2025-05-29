import { MinusIcon, PlusIcon } from '@/components/icons'
import { TypeQuantity } from '@/enums'
import { useMemo } from 'react'
import {
   Control,
   FieldValues,
   Path,
   PathValue,
   UseFormSetValue,
   UseFormTrigger,
   useController,
} from 'react-hook-form'

export type IQuantityFieldProps<TFormValues extends FieldValues> = {
   size?: string
   control: Control<TFormValues>
   name: Path<TFormValues>
   className?: string
   setValue: UseFormSetValue<TFormValues>
   trigger: UseFormTrigger<TFormValues>
}

export function QuantityField<TFormValues extends FieldValues = FieldValues>({
   size = 'normal',
   control,
   name,
   className = '',
   setValue,
   trigger,
}: IQuantityFieldProps<TFormValues>) {
   const {
      field: { value, ref },
      formState: { errors },
   } = useController({
      name,
      control,
   })

   const formatWidth = useMemo(() => {
      switch (size) {
         case 'normal':
            return 'w-[35px] h-[35px]'
         case 'lg':
            return 'w-10 h-10'
      }
   }, [size])

   const formatFontSize = useMemo(() => {
      switch (size) {
         case 'normal':
            return 'text-normal'
         case 'lg':
            return 'text-lg'
      }
   }, [size])

   const formatWidthIcon = useMemo(() => {
      switch (size) {
         case 'normal':
            return '!w-4 !h-4'
         case 'lg':
            return '!w-5 !h-5'
      }
   }, [size])

   const error = errors[name]

   const handleBtnClick = (type: string) => {
      switch (type) {
         case TypeQuantity.DECREASE: {
            const newVal = value <= 1 ? 1 : value - 1
            setValue(name, newVal as PathValue<TFormValues, Path<TFormValues>>)
            return
         }

         case TypeQuantity.INCREASE: {
            const newVal = value >= 10 ? 10 : value + 1
            setValue(name, newVal as PathValue<TFormValues, Path<TFormValues>>)
            return
         }
      }
      trigger(name)
   }

   const btnQuantity = 'd-flex group border-gray-border text-gray-dark'

   return (
      <div className={`${className}`} ref={ref}>
         <div className="flex border border-gray-border rounded">
            <button
               type="button"
               className={`border-r ${btnQuantity} ${formatWidth} ${
                  value <= 1 ? 'disabled:cursor-default' : ''
               }`}
               disabled={value <= 1}
               onClick={() => handleBtnClick(TypeQuantity.DECREASE)}
            >
               <MinusIcon className={`${formatWidthIcon} group-disabled:opacity-40`} />
            </button>
            <input
               type="text"
               value={value}
               className={`border-none ${formatWidth} ${formatFontSize} outline-none text-center inline-block focus:border-none focus:shadow-none ring-transparent ring-offset-0 font-medium text-gray-dark px-0`}
               readOnly
            />
            <button
               type="button"
               className={`border-l ${btnQuantity} ${formatWidth} ${
                  value >= 10 ? 'disabled:cursor-default' : ''
               }`}
               disabled={value >= 10}
               onClick={() => handleBtnClick(TypeQuantity.INCREASE)}
            >
               <PlusIcon className={`${formatWidthIcon} group-disabled:opacity-40`} />
            </button>
         </div>
         {error && (
            <p className="mt-2 text-xs pl-2 text-red-600 font-medium">
               {error?.message as string}
            </p>
         )}
      </div>
   )
}
