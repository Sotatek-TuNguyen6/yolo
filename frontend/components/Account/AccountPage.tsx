'use client'

import { NavUserHeader } from '@/components/common/NavUserInfo/components'
import { EditIcon } from '@/components/icons'
import { ModalAccountForm } from '@/components/modals'
import { Gender } from '@/enums'
import { IUser, IUserAccountForm } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { getProfile } from '@/store/user/thunkApi'
import { formatAddress, formatDate, formatGender } from '@/utils'
import { PayloadAction } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'

export interface IAccountProps {
   pUser: IUser | null
   pGetProfile: () => Promise<PayloadAction<unknown>>
}

function Account({ pUser, pGetProfile }: IAccountProps) {
   const [isShowModal, setIsShowModal] = useState<boolean>(false)
   const initValues: IUserAccountForm = {
      fullName: pUser?.fullName || '',
      emailAddress: pUser?.email || '',
      phoneNumber: pUser?.phoneNumber || '',
      gender: pUser?.gender || Gender.OTHER,
      dateOfBirth: {
         startDate: pUser?.dateOfBirth || new Date(),
         endDate: pUser?.dateOfBirth || new Date(),
      },
   }

   useEffect(() => {
      pGetProfile()
   }, [])

   const handleShowModalAccount = () => {
      setIsShowModal(true)
   }

   return (
      pUser && (
         <div className="w-full">
            <NavUserHeader
               title={'Thông tin cá nhân'}
               className="flex justify-between items-center"
            >
               <button
                  className="btn gap-2 !bg-secondary hover:!bg-secondary-dark text-white text-sm font-semibold !py-3"
                  onClick={handleShowModalAccount}
               >
                  <EditIcon className="!w-5 !h-5" /> Sửa thông tin
               </button>
            </NavUserHeader>
            <div className="grid grid-cols-2 items-center px-[30px] py-6 text-sm font-medium text-sapo">
               <div>
                  <div className="flex gap-1 py-2">
                     <span className="inline-block">
                        Họ và tên: <span>{pUser.fullName}</span>
                     </span>
                  </div>
                  <div className="flex gap-1 py-2">
                     <span className="inline-block">
                        Số điện thoại: <span>{pUser.phoneNumber}</span>
                     </span>
                  </div>
               </div>
               <div>
                  <div className="flex gap-1 py-2">
                     <span className="inline-block">
                        Địa chỉ email: <span>{pUser.email}</span>
                     </span>
                  </div>
                  <div className="py-2">
                     <span className="inline-block">
                        Địa chỉ:{' '}
                        <span>
                           {pUser.addresses.length > 0
                              ? formatAddress(pUser.addresses[0])
                              : 'Không có địa chỉ'}
                        </span>
                     </span>
                  </div>
               </div>
               <div>
                  <div className="flex gap-1 py-2">
                     <span className="inline-block capitalize">
                        Giới tính: <span>{formatGender(pUser.gender)}</span>
                     </span>
                  </div>
               </div>
               <div>
                  <div className="py-2">
                     <span className="inline-block">
                        Ngày sinh: <span>{formatDate(pUser.dateOfBirth)}</span>
                     </span>
                  </div>
               </div>
            </div>
            <ModalAccountForm
               isShow={isShowModal}
               initValues={initValues}
               setShow={setIsShowModal}
               user={pUser}
            />
         </div>
      )
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pGetProfile: () => dispatch(getProfile()),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(Account)
