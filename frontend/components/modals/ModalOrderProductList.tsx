import { Dispatch, SetStateAction, useMemo } from 'react'
import { Modal } from '.'
import { CloseIcon } from '@/components/icons'
import { IColor, IOrder, IProduct, ISize } from '@/models'
import Image from 'next/image'
import { formatCurrency } from '@/utils'

export interface IModalOrderProductListProps {
   order: IOrder
   isShow: boolean
   setIsShow: Dispatch<SetStateAction<boolean>>
}

export function ModalOrderProductList({
   order,
   isShow,
   setIsShow,
}: IModalOrderProductListProps) {
   const products = useMemo(() => {
      return order.items.map((item) => ({
         id: item._id,
         product: item.product as IProduct,
         color: item.color as IColor,
         size: item.size as ISize,
         quantities: item.quantities,
         total: item.quantities * Number((item.product as IProduct).price),
      }))
   }, [order])

   const handleModalOrderClose = () => {
      setIsShow(false)
   }

   return (
      <Modal isShowModal={isShow}>
         <div className="w-9/12 bg-white rounded">
            <div className="flex justify-between items-center px-[30px] py-4">
               <h2 className="text-base font-semibold text-secondary-dark">
                  Đơn hàng <span className="underline">{order._id}</span>
               </h2>
               <div
                  className="inline-block cursor-pointer"
                  onClick={handleModalOrderClose}
               >
                  <CloseIcon className="text-sapo" />
               </div>
            </div>
            <hr />
            <div className="px-[30px] py-4">
               <table className="table-purchase w-full">
                  <thead className="border-b border-gray-border">
                     <tr>
                        <th>Sản phẩm</th>
                        <th className="!text-center">Màu sắc</th>
                        <th className="!text-center">Kích cỡ</th>
                        <th>Đơn giá</th>
                        <th className="!text-center">Số lượng</th>
                        <th>Tổng tiền</th>
                     </tr>
                  </thead>
                  <tbody className="table-purchase-body">
                     {products.map((product) => (
                        <tr
                           key={product.id}
                           className="border-b border-gray-border last:border-none"
                        >
                           <td className="purchase-td text-sm max-w-[500px]">
                              <div className="flex gap-4 w-full">
                                 <div className="relative w-24 h-32">
                                    <Image
                                       src={product.product.featuredImage}
                                       alt={product.product.name}
                                       fill
                                       sizes="100%"
                                       className="object-cover rounded-md"
                                    />
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-sapo mt-2 mb-1.5 text-base">
                                       {product.product.name}
                                    </h3>
                                    <p className="text-gray-light">
                                       {product.product.subContent}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="purchase-td text-sm">
                              <div
                                 className={`w-5 h-5 rounded-full m-auto border ${
                                    product.color.value === '#ffffff'
                                       ? 'border-gray-border'
                                       : 'border-transparent'
                                 }`}
                                 style={{
                                    background: product.color.value,
                                 }}
                              ></div>
                           </td>
                           <td className="purchase-td !text-center !font-semibold">
                              {product.size.name}
                           </td>
                           <td className="purchase-td !font-semibold text-red-600">
                              {formatCurrency(product.product.price as number)}
                           </td>
                           <td className="purchase-td !text-center !font-semibold">
                              {' '}
                              {product.quantities}
                           </td>
                           <td className="purchase-td !font-semibold text-red-600">
                              {formatCurrency(product.total as number)}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </Modal>
   )
}
