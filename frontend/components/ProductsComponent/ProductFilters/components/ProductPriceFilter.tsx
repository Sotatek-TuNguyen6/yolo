import { Accordion } from '@/components/common'
import { ChoseIcon } from '@/components/icons'
import { QUERY_KEYS } from '@/constants'
import { prices } from '@/data'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export interface IProductPriceFilterProps {}

export function ProductPriceFilter(props: IProductPriceFilterProps) {
   const [priceFilter, setPriceFilter] = useState<string[]>([])
   const pathname = usePathname()
   const router = useRouter()
   const searchParams = useSearchParams()

   useEffect(() => {
      const params = new URLSearchParams(searchParams as any)
      const prices = params.getAll(QUERY_KEYS.PRICES) || [params.get(QUERY_KEYS.PRICES)]
      setPriceFilter(prices)
   }, [searchParams])

   const handlePriceFilter = (value: any) => {
      setPriceFilter((prev) => {
         if (priceFilter.includes(JSON.stringify(value))) {
            const newPrev = [...prev]
            const idx = newPrev.indexOf(JSON.stringify(value))
            if (idx > -1) {
               newPrev.splice(idx, 1)
               return newPrev
            }
         }
         return [...prev, JSON.stringify(value)]
      })

      const params = new URLSearchParams(searchParams as any)
      const prices = params.getAll(QUERY_KEYS.PRICES) || [params.get(QUERY_KEYS.PRICES)]

      if (!priceFilter.includes(JSON.stringify(value))) {
         params.append(QUERY_KEYS.PRICES, JSON.stringify(value))
      } else {
         const convertStrPrices = prices.filter((x) => x !== JSON.stringify(value))
         params.delete(QUERY_KEYS.PRICES)
         convertStrPrices.forEach((id: string) => {
            params.append(QUERY_KEYS.PRICES, id)
         })
      }
      params.set(QUERY_KEYS.PAGE, '1')
      router.push(`${pathname}?${params.toString()}`)
   }

   const checked = useCallback(
      (valPrice: string) => {
         return priceFilter.includes(valPrice)
      },
      [priceFilter]
   )

   return (
      <Accordion title="Khoảng giá (VNĐ)" className="mb-2">
         <ul className="flex gap-2 flex-wrap items-center">
            {prices.map((price) => (
               <li key={price.id} className="w-auto h-auto">
                  <div
                     className={`relative cursor-pointer group/item rounded inline-block border hover:border-secondary hover:bg-white ${
                        checked(JSON.stringify(price.val))
                           ? 'border-secondary bg-white'
                           : 'border-transparent bg-gray-light-border'
                     }`}
                     onClick={() => handlePriceFilter(price.val)}
                  >
                     {checked(JSON.stringify(price.val)) && (
                        <div className="absolute top-0 right-0 cursor-pointer">
                           <ChoseIcon />
                        </div>
                     )}
                     <span
                        className={`inline-flex gap-1.5 items-center leading-normal px-3 py-2 text-sm group-hover/item:text-secondary ${
                           checked(JSON.stringify(price.val))
                              ? 'text-secondary'
                              : 'text-tag'
                        }`}
                     >
                        {price.name}
                     </span>
                  </div>
               </li>
            ))}
         </ul>
      </Accordion>
   )
}
