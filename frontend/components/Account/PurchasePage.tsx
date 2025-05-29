'use client'

import { NavUserHeader } from '@/components/common/NavUserInfo/components'
import { ModalOrderProductList } from '@/components/modals'
import { IOrder, IUser } from '@/models'
import { AppState } from '@/store'
import {
   formatAddress,
   formatCurrency,
   formatDate,
   formatStatusPayment,
   formatStatusShipping,
} from '@/utils'
import { useMemo, useState } from 'react'
import { connect } from 'react-redux'

export interface IPurchaseProps {
   pUser: IUser | null
}

function Purchase({ pUser }: IPurchaseProps) {
   const [isShowModal, setIsShowModal] = useState<boolean>(false)
   const [order, setOrder] = useState<IOrder | null>(null)

   const orderProductList = useMemo(() => {
      return pUser?.orders && pUser?.orders?.length > 0 ? pUser.orders : []
   }, [pUser])

   const handleShowModal = (order: IOrder) => {
      setIsShowModal(true)
      setOrder(order)
   }

   return (
      <div>
         <NavUserHeader
            title="Đơn hàng của tôi"
            className="flex justify-between items-center"
         >
            <div>
               <span className="text-tag font-medium">
                  {orderProductList.length} đơn hàng
               </span>
            </div>
         </NavUserHeader>
         <div className="w-full">
            <table className="table-purchase w-full">
               <thead className="bg-cart border-b border-gray-border">
                  <tr>
                     <th className="!pl-[30px] text-left">Mã đơn hàng</th>
                     <th className="text-left">Ngày mua</th>
                     <th>Địa chỉ</th>
                     <th className="!text-right">
                        Giá trị <br />
                        đơn hàng
                     </th>
                     <th>Trạng thái thanh toán</th>
                     <th className="!pr-[15px]">Trạng thái vận chuyển</th>
                  </tr>
               </thead>
               <tbody className="table-purchase-body">
                  {orderProductList.map((order) => (
                     <tr
                        key={order._id}
                        className="border-b border-gray-border last:border-none"
                     >
                        <td className="purchase-td !pl-[30px]">
                           <span
                              className="hover:text-secondary-dark hover:underline cursor-pointer"
                              onClick={() => handleShowModal(order)}
                           >
                              <span className="text-secondary-dark">#</span>
                              {order._id.slice(0, 9)}...
                           </span>
                        </td>
                        <td className="purchase-td text-sm text-left w-[110px]">
                           <time>{formatDate(order.createdAt)}</time>
                        </td>
                        <td className="purchase-td max-w-[200px]">
                           {formatAddress(order.address)}
                        </td>
                        <td className="purchase-td !font-semibold !text-right text-red-600">
                           {formatCurrency(order.total)}
                        </td>
                        <td
                           className="purchase-td !text-center"
                           dangerouslySetInnerHTML={{
                              __html: formatStatusPayment(order.isPayment),
                           }}
                        ></td>
                        <td
                           className="purchase-td !text-center"
                           dangerouslySetInnerHTML={{
                              __html: formatStatusShipping(order.status),
                           }}
                        ></td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {orderProductList.length === 0 && (
               <p className="p-2.5 pl-[30px] text-sapo block text-sm">
                  Không có đơn hàng nào.
               </p>
            )}
            {order && (
               <ModalOrderProductList
                  isShow={isShowModal}
                  setIsShow={setIsShowModal}
                  order={order}
               />
            )}
         </div>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

export default connect(mapStateToProps, null)(Purchase)
