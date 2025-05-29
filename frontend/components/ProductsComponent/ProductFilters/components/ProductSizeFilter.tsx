import { Accordion } from '@/components/common'
import { ChoseIcon } from '@/components/icons'
import { QUERY_KEYS } from '@/constants'
import { ISize } from '@/models'
import { AppState } from '@/store'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'

export interface IProductSizeFilterProps {
   pSizes: ISize[]
}

function ProductSizeFilter({ pSizes }: IProductSizeFilterProps) {
   const [sizeFilter, setSizeFilter] = useState<string[]>([])
   const pathname = usePathname()
   const router = useRouter()
   const searchParams = useSearchParams()

   useEffect(() => {
      const params = new URLSearchParams(searchParams as any)
      const sizes = params.getAll(QUERY_KEYS.SIZES) || [params.get(QUERY_KEYS.SIZES)]
      setSizeFilter(sizes)
   }, [searchParams])

   const handleSizeFilter = (id: string) => {
      setSizeFilter((prev) => {
         if (sizeFilter.includes(id)) {
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
      const sizes = params.getAll(QUERY_KEYS.SIZES)
      if (!sizeFilter.includes(id)) {
         params.append(QUERY_KEYS.SIZES, id)
      } else {
         const sizesChecked = sizes.filter((x) => x !== id)
         params.delete(QUERY_KEYS.SIZES)
         sizesChecked.forEach((id: string) => {
            params.append(QUERY_KEYS.SIZES, id)
         })
      }
      params.set(QUERY_KEYS.PAGE, '1')
      router.push(`${pathname}?${params.toString()}`)
   }

   const checked = useCallback(
      (id: string) => {
         return sizeFilter.includes(id)
      },
      [sizeFilter]
   )

   return (
      <Accordion title="Kích thước" className="mb-2">
         <ul className="flex gap-2 flex-wrap items-center">
            {pSizes.map((size, idx) => (
               <li key={`${size.id} ${idx}`} className="w-auto h-auto">
                  <div
                     className={`relative cursor-pointer group/item rounded inline-block border hover:border-secondary hover:bg-white ${
                        checked(size.id)
                           ? 'border-secondary bg-white'
                           : 'border-transparent bg-gray-light-border'
                     }`}
                     onClick={() => handleSizeFilter(size.id)}
                  >
                     {checked(size.id) && (
                        <div className="absolute top-0 right-0 cursor-pointer">
                           <ChoseIcon />
                        </div>
                     )}
                     <span
                        className={`inline-block leading-normal px-3 py-2 text-sm group-hover/item:text-secondary ${
                           checked(size.id) ? 'text-secondary' : 'text-tag'
                        }`}
                     >
                        {size.name}
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
      pSizes: state.size.sizes,
   }
}

export default connect(mapStateToProps, null)(ProductSizeFilter)
