import { ArrowRightIcon, StarIcon } from '@/components/icons'
import { HOT_TAG, IMAGE_BLUR } from '@/constants'
import { IProduct } from '@/models'
import { formatCurrency, formatNumber } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface IProductItemProps {
   product: IProduct
   isHot?: boolean
   isShowRating?: boolean
}

export function ProductItem({
   product,
   isHot = false,
   isShowRating = true,
}: IProductItemProps) {
   const router = useRouter()

   const handleNavigate = (product: IProduct) => {
      router.push(`/products/${product.slug}`)
   }

   return (
      <div className="relative rounded overflow-hidden w-full group">
         <Link href={`/products/${product.slug}`} scroll>
            <div className="w-full overflow-hidden rounded max-h-80 h-[303px] relative">
               <Image
                  src={product.featuredImage}
                  alt={product.name}
                  fill
                  sizes="100%"
                  priority
                  quality={80}
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR}
                  className="w-full h-auto object-cover rounded group-hover:scale-110 ease-in-out duration-500"
               />
            </div>
         </Link>
         {product.discount !== 0 && !isHot && (
            <span className="absolute right-0 top-0 text-center w-[70px] bg-red-700 text-white rounded-bl text-xs font-semibold leading-6">
               -{product.discount}%
            </span>
         )}
         {isHot && (
            <span
               style={{
                  background: `url(${HOT_TAG})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
               }}
               className="absolute right-0 top-0 w-[30px] h-[30px]"
            ></span>
         )}
         {(product.ratingAverage as number) > 0 && isShowRating && (
            <span className="absolute left-0 top-0 flex rounded-br bg-black bg-opacity-60 text-xs text-white px-1 leading-6">
               <span className="inline-flex items-center gap-1 px-1">
                  <StarIcon className="!w-4 !h-4 text-secondary" fill="currentColor" />
                  <span className="font-semibold">{product.ratingAverage}</span>
                  {product.unitsSold > 0 && product.ratingAverage > 0 && (
                     <span className="inline-block w-[1px] h-[11px] bg-white"></span>
                  )}
               </span>

               {product.unitsSold > 0 && (
                  <span className="font-semibold flex items-center">
                     <span className="pr-1">
                        Đã bán <span>{formatNumber(product.unitsSold)}</span>
                     </span>
                  </span>
               )}
            </span>
         )}
         <div className="pt-4">
            <h3 className="text-black text-sm font-medium line-clamp-2 h-10">
               <Link
                  href={`/products/${product.slug}`}
                  className="hover:text-secondary hover:underline"
                  scroll
               >
                  {product.name}
               </Link>
            </h3>
            <div className="mt-1.5 text-description flex gap-4 items-center">
               <span
                  className={`${
                     product.price !== product.originPrice ? 'text-red-700' : ''
                  } font-bold`}
               >
                  {formatCurrency(product.price as number)}
               </span>
               {product.price !== product.originPrice && (
                  <span className="text-tag text-sm line-through">
                     {formatCurrency(product.originPrice as number)}
                  </span>
               )}
            </div>
            <div className="mt-3 flex justify-between">
               <button
                  className="btn group/btn text-center gap-2.5 w-full !bg-transparent border border-gray-border !text-sapo font-semibold text-sm hover:!bg-primary hover:border-primary hover:!text-white"
                  onClick={() => handleNavigate(product)}
               >
                  Xem chi tiết{' '}
                  <ArrowRightIcon className="!w-5 !h-5 group-hover/btn:translate-x-1 duration-common" />
               </button>
            </div>
         </div>
      </div>
   )
}
