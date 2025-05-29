import Comments from '@/components/Comments'
import { ImageProduct } from '@/components/common'
import { SkeletonImages } from '@/components/common/Loading'
import { ProductDetailAccording } from '@/components/product-detail/ProductDetailLeft/components'
import { ingredient } from '@/data'
import { IProduct } from '@/models'

export interface IProductDetailLeftProps {
   product: IProduct
   images: string[]
}

export function ProductDetailLeft({ product, images }: IProductDetailLeftProps) {
   return (
      <div>
         <div>
            {images.length === 0 && <SkeletonImages className="!gap-5" />}
            {images.length > 0 && (
               <div className="grid grid-cols-[1fr_1fr] gap-5 pb-6 border-b border-gray-light-border">
                  {images.map((img, idx) => (
                     <ImageProduct key={`${img}${idx}`} link={img} />
                  ))}
               </div>
            )}
         </div>
         {/* Feature */}
         <ProductDetailAccording
            title="Đặc tính nổi bật"
            className="py-4 border-t border-gray-light-border"
            isShowDropDown
         >
            <p
               className="pt-4 list-description"
               dangerouslySetInnerHTML={{
                  __html: product.summary as string,
               }}
            />
         </ProductDetailAccording>
         {/* Description */}
         <ProductDetailAccording
            title="Chi tiết sản phẩm"
            className="py-4 border-t border-gray-light-border"
            isDropDown
            childrenClassName="list-none"
         >
            <p
               className="pt-4 text-sm list-content text-semibold text-sapo"
               dangerouslySetInnerHTML={{
                  __html: product.content as string,
               }}
            />
         </ProductDetailAccording>
         {/* Guide */}
         <ProductDetailAccording
            title="Hướng dẫn sử dụng"
            className="py-4 border-t border-gray-light-border"
            isDropDown
         >
            <p
               className="pt-4 list-description pl-3"
               dangerouslySetInnerHTML={{
                  __html: ingredient,
               }}
            />
         </ProductDetailAccording>
         <div id="review-comments">
            <Comments product={product} />
         </div>
      </div>
   )
}
