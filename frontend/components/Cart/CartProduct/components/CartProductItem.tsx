import { QuantityField } from '@/components/form-fields'
import { formatCurrency } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { CartProductLayout } from '..'
import { ICartItem, IColor, IProduct, ISize } from '@/models'
import { connect } from 'react-redux'
import { AppDispatch } from '@/store'
import { IModalDelete, setModalDeleteInfo, showModalDelete } from '@/store/common'
import { TypeModalDelete } from '@/enums'
import { IItemCart } from '@/store/cart/reducers'
import { updateItemQuantities } from '@/store/cart'
import { useEffect } from 'react'

export interface ICartProductItemProps {
   cart: ICartItem
   pShowModalDelete: () => void
   pSetModalDeleteInfo: (data: IModalDelete) => void
   pUpdateItemQuantities: (data: IItemCart) => void
   idCart: string
}

const schema = yup.object().shape({
   quantities: yup
      .number()
      .min(1, 'Vui lòng chọn số lượng tối thiểu là 1')
      .max(10, 'Vui lòng chọn số lượng tối đa là 10'),
})

function CartProductItem({
   cart,
   pShowModalDelete,
   pSetModalDeleteInfo,
   pUpdateItemQuantities,
   idCart,
}: ICartProductItemProps) {
   const { control, setValue, trigger, watch } = useForm({
      defaultValues: {
         quantities: cart.quantities,
      },
      resolver: yupResolver(schema),
   })

   const handleRemoveCart = () => {
      const data: IModalDelete = {
         title: 'Bạn có chắc chắn muốn xóa sản phẩm này ra khỏi giỏ hàng của bạn không?',
         id: cart._id as string,
         type: TypeModalDelete.DELETE_PRODUCT,
         idCart: idCart,
      }
      pSetModalDeleteInfo(data)
      pShowModalDelete()
   }

   useEffect(() => {
      pUpdateItemQuantities({
         id: cart._id as string,
         quantities: watch('quantities') || 0,
      })
   }, [watch('quantities')])

   return (
      <CartProductLayout
         className="p-5 border-t border-gray-100 first-of-type:border-none"
         isRemove
         onRemoveCart={handleRemoveCart}
         firstCell={
            <div className="flex gap-4 h-full">
               <div className="w-[90px]">
                  <Link
                     href={`/products/${
                        (cart.product as IProduct as IProduct).slug as string
                     }`}
                     scroll
                  >
                     <Image
                        src={(cart.product as IProduct as IProduct).featuredImage}
                        alt={(cart.product as IProduct as IProduct).name}
                        width={1000}
                        height={1000}
                        className="w-full h-auto object-cover rounded"
                     />
                  </Link>
               </div>
               <div className="relative mb-2">
                  <h3 className="mb-2">
                     <Link
                        href={`/products/${(cart.product as IProduct).slug as string}`}
                        className="text-sm text-sapo hover:text-secondary font-semibold"
                        scroll
                     >
                        {(cart.product as IProduct).name}
                     </Link>
                  </h3>
                  <span className="absolute bottom-1 left-0 text-sm inline-block capitalize">
                     {(cart.color as IColor).name}{' '}
                     <span className="text-gray-500">/</span> {(cart.size as ISize).name}
                  </span>
               </div>
            </div>
         }
         secondCell={
            <div className="grid grid-cols-[1fr_2fr_1fr]">
               <div className="block text-sm text-center">
                  <span
                     className={`${
                        (cart.product as IProduct).price !==
                        (cart.product as IProduct).originPrice
                           ? 'text-red-700'
                           : ''
                     } font-bold inline-block mb-1`}
                  >
                     {formatCurrency((cart.product as IProduct).price as number)}
                  </span>
                  {(cart.product as IProduct).price !==
                     (cart.product as IProduct).originPrice && (
                     <span className="text-origin-price line-through font-normal">
                        {formatCurrency((cart.product as IProduct).originPrice as number)}
                     </span>
                  )}
               </div>
               <div className="block text-sm font-medium text-center w-full">
                  <div className="flex justify-center">
                     <QuantityField
                        control={control}
                        name="quantities"
                        setValue={setValue}
                        trigger={trigger}
                     />
                  </div>
               </div>
               <div className="block text-sm  text-sapo text-right font-semibold">
                  {formatCurrency(
                     ((cart.product as IProduct).price as number) * cart.quantities
                  )}
               </div>
            </div>
         }
      />
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pShowModalDelete: () => dispatch(showModalDelete(true)),
      pSetModalDeleteInfo: (data: IModalDelete) => dispatch(setModalDeleteInfo(data)),
      pUpdateItemQuantities: (data: IItemCart) => dispatch(updateItemQuantities(data)),
   }
}

export default connect(null, mapDispatchToProps)(CartProductItem)
