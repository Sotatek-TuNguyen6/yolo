import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { QUERY_KEYS } from '@/constants'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import ReactPaginate from 'react-paginate'

export interface IPaginationFilterProps {
   className?: string
   pageCount: number
}

export function PaginationFilter({ className = '', pageCount }: IPaginationFilterProps) {
   const router = useRouter()
   const searchParams = useSearchParams()
   const pathname = usePathname()
   const params = new URLSearchParams(searchParams.toString())

   const handlePageChange = (e: any) => {
      params.set(QUERY_KEYS.PAGE, `${Number(e.selected) + 1}`)
      router.push(`${pathname}?${params.toString()}`)
   }

   const pageNumber = useMemo(() => {
      return Number(params.get(QUERY_KEYS.PAGE)) - 1
   }, [searchParams])

   const countPage = useMemo(() => {
      const limit = params.get('limit') || '12'
      if (limit) {
         return Math.ceil(pageCount / +limit)
      }
      return 0
   }, [pageCount])

   return (
      <div className={`${className}`}>
         <nav>
            <ReactPaginate
               breakLabel={
                  <span className="relative rounded z-10 w-[41px] h-[44px] flex justify-center items-center bg-transparent font-medium text-gray-900 ring-1 ring-inset ring-gray-border cursor-pointer hover:bg-secondary hover:ring-secondary hover:text-white duration-common">
                     ...
                  </span>
               }
               pageRangeDisplayed={2}
               pageCount={countPage}
               nextLabel={
                  <span className="relative inline-flex w-[41px] h-[44px] justify-center items-center rounded text-gray-900 ring-1 ring-inset ring-gray-border hover:bg-gray-50">
                     <ChevronRightIcon className="!w-5 !h-5" />
                  </span>
               }
               previousLabel={
                  <span className="relative inline-flex w-[41px] h-[44px] justify-center items-center rounded text-gray-900 ring-1 ring-inset ring-gray-border hover:bg-gray-50">
                     <ChevronLeftIcon className="!w-5 !h-5" />
                  </span>
               }
               containerClassName={'inline-flex rounded gap-2'}
               onPageChange={handlePageChange}
               pageClassName={
                  'block rounded z-10 w-[41px] h-[44px] inline-flex items-center justify-center bg-transparent font-medium text-gray-900 ring-1 ring-inset ring-gray-border cursor-pointer hover:bg-secondary hover:ring-secondary hover:text-white duration-common'
               }
               activeClassName={'!bg-secondary text-white ring-secondary'}
               pageLinkClassName={'inline-flex items-center justify-center w-full h-full'}
               renderOnZeroPageCount={null}
               forcePage={pageNumber}
               disabledClassName={'opacity-40 cursor-not-allowed'}
            />
         </nav>
      </div>
   )
}
