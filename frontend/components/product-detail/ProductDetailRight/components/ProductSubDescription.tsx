import { ICategory, IProduct, ISubCategory } from '@/models'
import { formatNumber } from '@/utils'
import * as React from 'react'
import { ProductComment, ProductLike } from '.'

export interface IProductSubDescriptionProps {
   product: IProduct
}

export function ProductSubDescription({ product }: IProductSubDescriptionProps) {
   return (
      <div className="flex justify-between items-center mt-2">
         <div className="flex items-center flex-wrap">
            <span className="text-sm text-sapo uppercase font-medium">
               {(product.category as ICategory).name}
            </span>
            <span className="bg-gray-light mx-2.5 inline-block w-[0.5px] h-3.5"></span>
            <span className="text-sm text-sapo uppercase font-medium">
               {(product.subCategory as ISubCategory)?.name || ''}
            </span>
            {product.unitsSold > 0 && (
               <>
                  <span className="bg-gray-light mx-2.5 inline-block w-[0.5px] h-3.5"></span>
                  <span className="text-sm text-sapo font-medium">
                     Đã bán {formatNumber(product.unitsSold)}
                  </span>
               </>
            )}
            <span className="bg-gray-light mx-2.5 inline-block w-[0.5px] h-3.5"></span>
            <ProductComment />
         </div>
         <ProductLike product={product} />
      </div>
   )
}
