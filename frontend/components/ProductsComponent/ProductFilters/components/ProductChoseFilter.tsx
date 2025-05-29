import { CloseIcon } from '@/components/icons'
import { QUERY_KEYS } from '@/constants'
import { prices } from '@/data'
import { ICategory, IColor, ICommonObject, ISize, ISubCategory } from '@/models'
import { AppState } from '@/store'
import { getListEachFilter } from '@/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

export interface IProductChoseFilterProps {
   className?: string
   pCategories: ICategory[]
   pSubCategories: ISubCategory[]
   pColors: IColor[]
   pSizes: ISize[]
}

function ProductChoseFilter({
   className = '',
   pCategories,
   pSubCategories,
   pColors,
   pSizes,
}: IProductChoseFilterProps) {
   const [filterChoses, setFilterChoses] = useState<ICommonObject[]>([])
   const router = useRouter()
   const searchParams = useSearchParams()
   const pathname = usePathname()

   const handleClearAllQuery = () => {
      router.push('/products?page=1')
   }

   useEffect(() => {
      const params = new URLSearchParams(searchParams.toString())
      const newCategories = getListEachFilter<ICategory[]>(
         QUERY_KEYS.CATEGORIES,
         params,
         pCategories
      )
      const newSubCategories = getListEachFilter<ICategory[]>(
         QUERY_KEYS.SUB_CATEGORIES,
         params,
         pSubCategories
      )
      const newSizes = getListEachFilter<ISize[]>(QUERY_KEYS.SIZES, params, pSizes)
      const newColors = getListEachFilter<IColor[]>(QUERY_KEYS.COLORS, params, pColors)
      const newPrices = getListEachFilter(QUERY_KEYS.PRICES, params, prices)
      setFilterChoses([
         ...newCategories,
         ...newColors,
         ...newSizes,
         ...newPrices,
         ...newSubCategories,
      ])
   }, [searchParams])

   const handleRemoveQuery = (type: string, id: string) => {
      const params = new URLSearchParams(searchParams as any)
      const list: any[] = params.getAll(type) || [params.get(type)]
      const newList = list.filter((x: any) =>
         type === QUERY_KEYS.PRICES ? x !== JSON.stringify(id) : x !== id
      )
      params.delete(type)
      if (newList.length > 0) {
         for (const item of newList) {
            params.append(type, item)
         }
      }
      params.set(QUERY_KEYS.PAGE, '1')
      router.push(`${pathname}?${params.toString()}`)
   }

   return (
      filterChoses.length > 0 && (
         <div className={`mb-2 ${className}`}>
            <div className="flex justify-between items-center pt-1 mb-2">
               <h2 className="cursor-pointer flex justify-between font-medium text-sapo">
                  Bạn chọn
               </h2>
               <span
                  className="text-sm text-sapo cursor-pointer inline-block hover:text-secondary-dark duration-common"
                  onClick={handleClearAllQuery}
               >
                  Bỏ hết
               </span>
            </div>
            <div className="flex flex-wrap gap-2 py-2">
               {filterChoses.map((chip, idx) => (
                  <div
                     key={`${chip} ${idx}`}
                     className="inline-flex items-center gap-1 text-sm text-center rounded py-0.5 pl-1 pr-2 text-white bg-secondary cursor-pointer"
                     onClick={() =>
                        handleRemoveQuery(
                           chip.type as string,
                           (chip.type === QUERY_KEYS.PRICES
                              ? chip.val
                              : chip.id) as string
                        )
                     }
                  >
                     <span>
                        <CloseIcon className="!w-4 !h-4" />
                     </span>{' '}
                     <span className="mt-px inline-block font-medium capitalize">
                        {chip.name as string}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      )
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pCategories: state.category.categories,
      pSubCategories: state.subCategory.subCategories,
      pSizes: state.size.sizes,
      pColors: state.color.colors,
   }
}

export default connect(mapStateToProps, null)(ProductChoseFilter)
