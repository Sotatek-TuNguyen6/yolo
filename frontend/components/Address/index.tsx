'use client'

import { IAddress, IAddressValue } from '@/models'
import { formatAddress } from '@/utils'
import { CheckCircleIcon } from '@/components/icons'
import { connect } from 'react-redux'
import { AppDispatch } from '@/store'
import { IModalDelete, setModalDeleteInfo, showModalDelete } from '@/store/common'
import { TypeModalDelete } from '@/enums'

export interface IAddressProps {
   address: IAddress
   className?: string
   onEdit: () => void
   pShowModalDelete: () => void
   pSetModalInfo: (data: IModalDelete) => void
}

interface IAddressInfoItem {
   title: string
   value: string
   isDefault?: boolean
   className?: string
}

function AddressInfoItem({
   title,
   value,
   isDefault = false,
   className = '',
}: IAddressInfoItem) {
   return (
      <p className={`mb-2 ${className}`}>
         <strong className="w-[109px] text-tag font-medium text-sm inline-block">
            {title}
         </strong>
         <span className="text-sm text-sapo font-medium inline-flex gap-4 items-center">
            {value}{' '}
            {isDefault && (
               <span className="text-green-500 text-xs font-normal inline-flex gap-0.5 items-center">
                  <CheckCircleIcon className="!w-3.5 !h-3.5" width={1.5} />{' '}
                  <span>Địa chỉ mặc định</span>
               </span>
            )}
         </span>
      </p>
   )
}

function Address({
   address,
   className = '',
   onEdit,
   pSetModalInfo,
   pShowModalDelete,
}: IAddressProps) {
   const handleShowModal = (id: string) => {
      pShowModalDelete()
      pSetModalInfo({
         id,
         title: 'Bạn có chắc chắn muốn xóa địa chỉ này không?',
         type: TypeModalDelete.DELETE_ADDRESS,
      })
   }

   return (
      <div
         className={`flex gap-4 border-b border-gray-border py-4 justify-between ${className}`}
      >
         <div>
            <AddressInfoItem
               title={'Họ và tên:'}
               value={address.fullName}
               isDefault={address.isDefault}
            />
            <AddressInfoItem title={'Địa chỉ:'} value={formatAddress(address)} />
            <AddressInfoItem
               title={'Số điện thoại:'}
               value={address.phoneNumber}
               className="mb-0"
            />
         </div>
         <div className="flex flex-col gap-2">
            <div
               className="bg-green-100 text-green-500 px-3 py-1 rounded cursor-pointer text-sm font-medium"
               onClick={onEdit}
            >
               Sửa
            </div>
            {!address.isDefault && (
               <div
                  className="bg-red-100 text-red-500 px-3 py-1 rounded cursor-pointer text-sm font-medium"
                  onClick={() => handleShowModal(address.id)}
               >
                  Xóa
               </div>
            )}
         </div>
      </div>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pShowModalDelete: () => dispatch(showModalDelete(true)),
      pSetModalInfo: (data: IModalDelete) => dispatch(setModalDeleteInfo(data)),
   }
}

export default connect(null, mapDispatchToProps)(Address)
