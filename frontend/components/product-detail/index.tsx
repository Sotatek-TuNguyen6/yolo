import { ProductList } from '@/components/common'
import { IProduct } from '@/models'
export * from '@/components/product-detail/ProductDetailLeft'
export * from '@/components/product-detail/ProductDetailRecommends'
export { default as ProductDetailRight } from '@/components/product-detail/ProductDetailRight'
export { default as ProductDetailWatched } from '@/components/product-detail/ProductDetailWatched'
export * from '@/components/product-detail/ProductRelation'

export interface IProductDetailCommonListProps {
   productList: IProduct[]
   title: string
   className?: string
   isCenterTitle?: boolean
}

export function ProductDetailCommonList({
   title,
   productList,
   className = '',
   isCenterTitle = false,
}: IProductDetailCommonListProps) {
   console.log('productList', productList)
   return (
      <div className={className}>
         <h2
            className={`uppercase font-semibold text-xl text-primary pb-8 ${
               isCenterTitle ? 'text-center' : ''
            }`}
         >
            {title}
         </h2>
         <ProductList products={productList} className="grid-cols-5" />
      </div>
   )
}
