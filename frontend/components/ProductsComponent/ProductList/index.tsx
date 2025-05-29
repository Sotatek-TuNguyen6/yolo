import { ProductItem } from '@/components/common'
import { SkeletonProducts } from '@/components/common/Loading'
import { PaginationFilter } from '@/components/filters'
import { IProduct } from '@/models'

export interface IProductListProps {
   productList: IProduct[]
   total: number
   isLoading?: boolean
}

export function ProductList({
   productList,
   total,
   isLoading = false,
}: IProductListProps) {
   if (isLoading) {
      return <SkeletonProducts length={12} className="!gap-5" />
   }

   if (productList.length === 0) {
      return (
         <div>
            <p className="text-brown-soil font-medium text-sm px-4 py-3.5 rounded bg-brown-soil-light">
               Không tìm thấy sản phẩm nào
            </p>
         </div>
      )
   }

   return (
      <div>
         <div>
            <div className="grid grid-cols-4 gap-5">
               {productList.map((product) => (
                  <ProductItem key={product.id} product={product} />
               ))}
            </div>
         </div>
         <div className="flex justify-center my-4 py-2">
            <PaginationFilter pageCount={total} />
         </div>
      </div>
   )
}
