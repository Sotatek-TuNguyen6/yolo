'use client'

import Address from '@/components/Address'
import { NavUserHeader } from '@/components/common/NavUserInfo/components'
import { PlusIcon } from '@/components/icons'
import { ModalAddressForm } from '@/components/modals'
import { addressVals } from '@/data'
import { IAddress, IAddressData, IUser } from '@/models'
import { AppState } from '@/store'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { connect } from 'react-redux'

export interface IAddressesProps {
   pUser: IUser | null
}

export function Addresses({ pUser }: IAddressesProps) {
   const router = useRouter()
   const [showModalAddress, setShowModalAddress] = useState<boolean>(false)
   const [initValues, setInitValues] = useState<IAddressData>({
      ...addressVals,
      user: pUser?.id || '',
   })

   const handleResetInitVals = () =>
      setInitValues({
         ...addressVals,
         user: pUser?.id || '',
      })

   const handleShowAddressModal = () => {
      handleResetInitVals()
      setShowModalAddress(true)
   }

   if (!pUser) {
      router.push('/login')
      return
   }

   const handleSetEditVals = (data: IAddress) => {
      setInitValues(data)
      setShowModalAddress(true)
   }

   return (
      <div className="flex flex-col h-full">
         <NavUserHeader
            title="Địa chỉ của bạn"
            className="flex justify-between items-center"
         >
            <button
               className="btn gap-1 !bg-secondary-dark hover:!bg-secondary-darker font-semibold text-sm !py-3"
               onClick={handleShowAddressModal}
            >
               <PlusIcon className="!w-4 !h-4" />
               <span>Thêm địa chỉ mới</span>
            </button>
         </NavUserHeader>
         <div className="my-2 flex-1">
            {pUser?.addresses?.length === 0 && (
               <div className="d-flex flex-col h-full">
                  <div className="w-[250px] h-[120px] relative">
                     <Image
                        src={'/address-empty.png'}
                        alt="Địa chỉ trống"
                        fill
                        className="object-cover"
                     />
                  </div>
                  <p className="text-sm text-tag font-medium">
                     Địa chỉ của bạn đang trống. Vui lòng tạo{' '}
                     <span
                        className="text-secondary cursor-pointer hover:underline hover:text-secondary-dark"
                        onClick={handleShowAddressModal}
                     >
                        địa chỉ mới
                     </span>
                  </p>
               </div>
            )}
            {pUser?.addresses?.length > 0 && (
               <div className="w-full px-6">
                  {pUser?.addresses.map((address) => (
                     <Address
                        key={address.id}
                        address={address}
                        className="last-of-type:border-none"
                        onEdit={() => handleSetEditVals(address)}
                     />
                  ))}
               </div>
            )}
         </div>
         <ModalAddressForm
            isShow={showModalAddress}
            setShow={setShowModalAddress}
            userId={pUser?.id}
            initVals={initValues}
            resetInitVals={handleResetInitVals}
         />
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

export default connect(mapStateToProps, null)(Addresses)
