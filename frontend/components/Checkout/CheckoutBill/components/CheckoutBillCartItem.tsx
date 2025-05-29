import { ICartItem, IColor, IProduct, ISize } from '@/models'
import { formatCurrency } from '@/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

export interface ICheckoutBillCartItemProps {
   cart: ICartItem
}

export function CheckoutBillCartItem({ cart }: ICheckoutBillCartItemProps) {
   const total = useMemo(() => {
      return ((cart.product as IProduct).price || 0) * cart.quantities
   }, [cart])

   return (
      <div className="grid grid-cols-[2.5fr_1fr] gap-2 py-4 first-of-type:pt-0 border-t border-gray-border first-of-type:border-none">
         <div className="flex gap-3">
            <div>
               <Image
                  src={(cart.product as IProduct).featuredImage as string}
                  alt={(cart.product as IProduct).name}
                  width={1000}
                  height={1000}
                  className="w-[100px] h-auto object-cover rounded"
               />
            </div>
            <div>
               <h3 className="text-sm font-medium text-gray-600 mb-2">
                  <Link
                     href={`/products/${(cart.product as IProduct).slug}`}
                     className="hover:text-secondary hover:underline"
                     scroll
                  >
                     {(cart.product as IProduct).name}
                  </Link>
               </h3>
               <p className="text-sm text-gray-400 mb-2 capitalize">
                  {(cart.color as IColor).name} | {(cart.size as ISize).name}
               </p>
               <p>
                  <span className="inline-block text-xs text-gray-500 font-medium">
                     x{cart.quantities}
                  </span>
               </p>
            </div>
         </div>
         <div className="justify-self-end">
            <span className="inline-block font-medium text-description">
               {formatCurrency(total)}
            </span>
         </div>
      </div>
   )
}
