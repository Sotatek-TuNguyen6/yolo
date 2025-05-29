import { SelectFilter } from '@/components/filters'
import { EMPTY_OPTION, QUERY_KEYS } from '@/constants'
import { sortProduct } from '@/data'
import { AppState } from '@/store'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { connect } from 'react-redux'

export interface IProductSortFilterProps {
   total: number
}

export function ProductSortFilter({ total }: IProductSortFilterProps) {
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const router = useRouter()

   const sortDefaultVal = useMemo(() => {
      const params = new URLSearchParams(searchParams as any)
      const value = params.get(QUERY_KEYS.SORT)
      const sort = sortProduct.find((x) => x.val === value) as any
      if (value && sort) {
         return { name: sort.name, value }
      }
      return
   }, [searchParams])

   const handleSortChange = (value: string) => {
      const params = new URLSearchParams(searchParams as any)
      if (value) {
         params.set(QUERY_KEYS.SORT, value)
      } else {
         params.delete(QUERY_KEYS.SORT)
      }
      params.set(QUERY_KEYS.PAGE, '1')
      router.push(`${pathname}?${params.toString()}`)
   }

   return (
      <div className="flex justify-between items-end mb-2.5">
         <span className="inline-block text-tag font-medium font-sm tracking-tight">
            {total} sản phẩm
         </span>
         <div className="flex gap-3 justify-end items-center min-w-[400px] max-w-xs">
            <label htmlFor="sort" className="inline-block text-sapo font-medium">
               Sắp xếp theo
            </label>
            <SelectFilter
               options={sortProduct}
               defaultName={!sortDefaultVal ? 'Mặc định' : sortDefaultVal.name}
               defaultValue={!sortDefaultVal ? EMPTY_OPTION : sortDefaultVal.value}
               onSelect={handleSortChange}
            />
         </div>
      </div>
   )
}
