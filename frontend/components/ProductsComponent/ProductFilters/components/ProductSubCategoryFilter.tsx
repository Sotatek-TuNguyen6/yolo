import { Accordion } from '@/components/common'
import { ChoseIcon } from '@/components/icons'
import { QUERY_KEYS } from '@/constants'
import { ISubCategory } from '@/models'
import { AppState } from '@/store'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'

export interface IProductSubCategoryFilterProps {
   pSubCategories: ISubCategory[]
}

function ProductSubCategoryFilter({ pSubCategories }: IProductSubCategoryFilterProps) {
   const [categoryFilter, setCategoryFilter] = useState<string[]>([])
   const searchParams = useSearchParams()
   const pathname = usePathname()
   const router = useRouter()

   useEffect(() => {
      const params = new URLSearchParams(searchParams as any)
      const categories = params.getAll(QUERY_KEYS.SUB_CATEGORIES) || [
         params.get(QUERY_KEYS.SUB_CATEGORIES),
      ]
      setCategoryFilter(categories)
   }, [searchParams])

   const handleCategoryFilter = (id: string) => {
      setCategoryFilter((prev) => {
         if (categoryFilter.includes(id)) {
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
      const categories = params.getAll(QUERY_KEYS.SUB_CATEGORIES) || [
         params.get(QUERY_KEYS.SUB_CATEGORIES),
      ]

      if (!categoryFilter.includes(id)) {
         params.append(QUERY_KEYS.SUB_CATEGORIES, id)
      } else {
         const categoriesChecked = categories.filter((x) => x !== id)
         params.delete(QUERY_KEYS.SUB_CATEGORIES)
         categoriesChecked.forEach((id: string) => {
            params.append(QUERY_KEYS.SUB_CATEGORIES, id)
         })
      }
      params.set(QUERY_KEYS.PAGE, '1')
      router.push(`${pathname}?${params.toString()}`)
   }

   const checked = useCallback(
      (id: string) => {
         return categoryFilter.includes(id)
      },
      [categoryFilter]
   )

   return (
      <Accordion title="Loại sản phẩm phụ" className="mb-2">
         <ul className="flex gap-2 flex-wrap items-center">
            {pSubCategories.map((subCategory) => (
               <li key={subCategory._id} className="relative w-auto h-auto inline-block">
                  <div
                     className={`relative cursor-pointer group/item rounded inline-block border hover:border-secondary hover:bg-white ${
                        checked(subCategory._id)
                           ? 'border-secondary bg-white'
                           : 'border-transparent bg-gray-light-border'
                     }`}
                     onClick={() => handleCategoryFilter(subCategory._id)}
                  >
                     {checked(subCategory._id) && (
                        <div className="absolute top-0 right-0 cursor-pointer">
                           <ChoseIcon />
                        </div>
                     )}
                     <span
                        className={`inline-block leading-normal px-3 py-2 text-sm group-hover/item:text-secondary capitalize ${
                           checked(subCategory._id) ? 'text-secondary' : 'text-tag'
                        }`}
                     >
                        {subCategory.name}
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
      pSubCategories: state.subCategory.subCategories,
   }
}

export default connect(mapStateToProps, null)(ProductSubCategoryFilter)
