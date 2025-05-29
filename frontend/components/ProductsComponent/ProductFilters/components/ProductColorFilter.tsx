import { Accordion } from '@/components/common'
import { ChoseIcon } from '@/components/icons'
import { QUERY_KEYS } from '@/constants'
import { IColor } from '@/models'
import { AppState } from '@/store'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'

export interface IProductColorFilterProps {
   pColors: IColor[]
}

function ProductColorFilter({ pColors }: IProductColorFilterProps) {
   const [colorFilter, setColorFilter] = useState<string[]>([])
   const pathname = usePathname()
   const router = useRouter()
   const searchParams = useSearchParams()

   useEffect(() => {
      const params = new URLSearchParams(searchParams as any)
      const colors = params.getAll(QUERY_KEYS.COLORS) || [params.get(QUERY_KEYS.COLORS)]
      setColorFilter(colors)
   }, [searchParams])

   const handleColorFilter = (id: string) => {
      setColorFilter((prev) => {
         if (colorFilter.includes(id)) {
            const newPrev = [...prev]
            const idx = newPrev.indexOf(id)
            if (idx > -1) {
               newPrev.splice(idx, 1)
               return newPrev
            }
         }
         return [...prev, id]
      })
      const params = new URLSearchParams(searchParams as any)
      const colors = params.getAll(QUERY_KEYS.COLORS)
      if (!colorFilter.includes(id)) {
         params.append(QUERY_KEYS.COLORS, id)
      } else {
         const colorsChecked = colors.filter((x) => x !== id)
         params.delete(QUERY_KEYS.COLORS)
         colorsChecked.forEach((id: string) => {
            params.append(QUERY_KEYS.COLORS, id)
         })
      }
      params.set(QUERY_KEYS.PAGE, '1')
      router.push(`${pathname}?${params.toString()}`)
   }

   const checked = useCallback(
      (id: string) => {
         return colorFilter.includes(id)
      },
      [colorFilter]
   )

   return (
      <Accordion title="Màu sắc" className="mb-2">
         <ul className="flex gap-2 flex-wrap items-center">
            {pColors.map((color) => (
               <li key={`${color._id} color`} className="w-auto h-auto">
                  <div
                     className={`relative cursor-pointer group/item rounded inline-block border hover:border-secondary hover:bg-white ${
                        checked(color._id)
                           ? 'border-secondary bg-white'
                           : 'border-transparent bg-gray-light-border'
                     }`}
                     onClick={() => handleColorFilter(color._id)}
                  >
                     {checked(color._id) && (
                        <div className="absolute top-0 right-0 cursor-pointer">
                           <ChoseIcon />
                        </div>
                     )}
                     <span
                        className={`inline-flex gap-1.5 capitalize items-center leading-normal px-3 py-2 text-sm group-hover/item:text-secondary ${
                           checked(color._id) ? 'text-secondary' : 'text-tag'
                        }`}
                     >
                        <div
                           className={`w-5 h-5 rounded-full border ${
                              color.value === '#ffffff'
                                 ? 'border-gray-border'
                                 : 'border-transparent'
                           }`}
                           style={{
                              background: `${color.value}`,
                           }}
                        ></div>
                        {color.name}
                     </span>
                  </div>
               </li>
            ))}
         </ul>
      </Accordion>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pColors: state.color.colors,
   }
}

export default connect(mapStateToProps, null)(ProductColorFilter)
