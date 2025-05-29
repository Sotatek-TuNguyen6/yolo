import { EMPTY_OPTION } from '@/constants'
import { ICommonObject } from '@/models'
import { CheckIcon, ChevronDownIcon } from '@/components/icons'
import { useEffect, useState } from 'react'

export interface ISelectFilterProps {
   options: ICommonObject[]
   defaultName?: string
   defaultValue?: string
   label?: string
   onSelect?: (value: string) => void
}

export function SelectFilter({
   options,
   defaultName = EMPTY_OPTION,
   defaultValue = EMPTY_OPTION,
   label,
   onSelect,
}: ISelectFilterProps) {
   const [showSelect, setShowSelect] = useState<boolean>(false)
   const [valSelect, setValSelect] = useState<ICommonObject>({
      name: defaultName,
      val: defaultValue,
   })

   useEffect(() => {
      setValSelect({
         name: defaultName,
         val: defaultValue,
      })
   }, [defaultName, defaultValue])

   const handleShowSelect = () => {
      setShowSelect((prev) => !prev)
   }

   const handleSetVal = (option: ICommonObject) => {
      if (onSelect) {
         onSelect(option.val as string)
      }
      setValSelect(option)
      setShowSelect(false)
   }

   return (
      <div className="relative">
         {label && <label htmlFor={label}>{label}</label>}
         <div
            className="border border-gray-border text-sapo font-medium rounded block w-48 px-3 py-2.5 cursor-pointer"
            onClick={handleShowSelect}
         >
            <div className="grid grid-cols-[2fr_1fr] items-center">
               <span>
                  {defaultValue === valSelect.val
                     ? defaultName
                     : (valSelect.name as string)}
               </span>
               <span className="justify-self-end">
                  <ChevronDownIcon className="!w-5 !h-5" />
               </span>
            </div>
         </div>
         <div
            className={`absolute top-[44px] left-0 z-40 bg-white w-full border border-gray-border rounded rounded-t-none ${
               showSelect
                  ? 'pointer-events-auto translate-y-0 opacity-1'
                  : 'pointer-events-none translate-y-2 opacity-0'
            } duration-300 ease-in-out`}
         >
            <ul className="py-1.5 w-full">
               {options.map((option) => (
                  <li
                     key={option.val as string}
                     className="w-full px-3 py-1.5 group cursor-pointer"
                     onClick={() => handleSetVal(option)}
                  >
                     <p className="grid grid-cols-[2fr_1fr] items-center">
                        <span
                           className={`inline-block text-sm font-medium group-hover:text-secondary ${
                              option.val === valSelect.val
                                 ? 'text-secondary'
                                 : 'text-sapo'
                           }`}
                        >
                           {option.name as string}
                        </span>
                        <span
                           className={`justify-self-end group-hover:inline-block ${
                              option.val === valSelect.val ? 'inline-block' : 'hidden'
                           }`}
                        >
                           <CheckIcon className="!w-4 !h-4" />
                        </span>
                     </p>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}
