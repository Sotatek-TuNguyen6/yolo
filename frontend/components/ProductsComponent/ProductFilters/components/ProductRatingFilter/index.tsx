import { ProductRating } from '@/components/ProductsComponent/ProductFilters/components/ProductRatingFilter/components'
import { Accordion } from '@/components/common'
import { QUERY_KEYS } from '@/constants'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ProductRatingFilter() {
   const [ratingFilter, setRatingFilter] = useState<number[]>([])
   const pathname = usePathname()
   const router = useRouter()
   const searchParams = useSearchParams()

   useEffect(() => {
      const params = new URLSearchParams(searchParams.toString())
      const numbs = params.getAll(QUERY_KEYS.RATINGS) || [params.get(QUERY_KEYS.RATINGS)]
      if (numbs.length) {
         const newNumbs = numbs.map((x) => Number(x))
         setRatingFilter(newNumbs)
      }
   }, [searchParams])

   const handleRatingFilter = (nums: number) => {
      const params = new URLSearchParams(searchParams.toString())
      setRatingFilter((prev) => {
         if (prev.includes(Number(nums))) {
            const newPrev = [...prev]
            const idx = prev.indexOf(Number(nums))
            if (idx > -1) {
               newPrev.splice(idx, 1)
            }
            return newPrev
         }
         return [...prev, Number(nums)]
      })
      const rating = params.getAll(QUERY_KEYS.RATINGS)
      if (!ratingFilter.includes(Number(nums))) {
         params.append(QUERY_KEYS.RATINGS, nums.toString())
      } else {
         const ratingChecked = rating.filter((x) => x !== nums.toString())
         params.delete(QUERY_KEYS.RATINGS)
         ratingChecked.forEach((id: string) => {
            params.append(QUERY_KEYS.RATINGS, id)
         })
      }
      params.set(QUERY_KEYS.PAGE, '1')
      router.push(`${pathname}?${params.toString()}`)
   }

   return (
      <Accordion title="Đánh giá" className="mb-2">
         <div className="flex flex-col gap-2">
            <ProductRating
               numsStar={5}
               currentRating={ratingFilter}
               onRatingClick={handleRatingFilter}
            />
            <ProductRating
               numsStar={4}
               currentRating={ratingFilter}
               onRatingClick={handleRatingFilter}
            />
            <ProductRating
               numsStar={3}
               currentRating={ratingFilter}
               onRatingClick={handleRatingFilter}
            />
            <ProductRating
               numsStar={2}
               currentRating={ratingFilter}
               onRatingClick={handleRatingFilter}
            />
            <ProductRating
               numsStar={1}
               currentRating={ratingFilter}
               onRatingClick={handleRatingFilter}
            />
         </div>
      </Accordion>
   )
}
