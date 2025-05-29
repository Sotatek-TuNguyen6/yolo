import { IProduct } from '@/models'
import { ProductItem } from '@/components/common/ProductList/components'

export interface IProductListProps {
   products: IProduct[]
   className?: string
}

export function ProductList({ products, className = '' }: IProductListProps) {
   return (
      <div className={`grid grid-cols-4 gap-5 ${className}`}>
         {products.map((product) => (
            <ProductItem key={product.id} product={product} />
         ))}
      </div>
   )
}
