'use client'

import { Avatar } from '@/components/common'
import { CameraIcon } from '@/components/icons'
import { ModalLoading } from '@/components/modals'
import { TypeMessageLoading } from '@/enums'
import { IUser } from '@/models'
import { AppDispatch } from '@/store'
import { updateUser } from '@/store/user/thunkApi'
import { uploadImage } from '@/utils'
import { PayloadAction } from '@reduxjs/toolkit'
import { ChangeEvent, useState } from 'react'
import { connect } from 'react-redux'

export interface IUserInfoHeaderProps {
   user: IUser
   pUpdateUser: (data: Partial<IUser>) => Promise<PayloadAction<unknown>>
}

function UserInfoHeader({ user, pUpdateUser }: IUserInfoHeaderProps) {
   const [imgAvatar, setImgAvatar] = useState<string>(user.avatar)
   const [loading, setLoading] = useState<boolean>(false)

   const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
         setLoading(true)
         const res = await uploadImage(e.target.files?.[0], 'avatar_folder')
         if (res) {
            await pUpdateUser({ _id: user._id, userName: user.userName, avatar: res.url })
            setImgAvatar(res.url)
            setLoading(false)
         }
      }
   }

   return (
      <div>
         <div className="w-20 h-20 relative border-4 border-gray-border rounded-full">
            <div className="absolute d-flex bottom-0 right-0 bg-sapo w-[26px] h-[26px] rounded-full z-10">
               <label
                  htmlFor={user.userName}
                  className="inline-block text-white cursor-pointer"
               >
                  <CameraIcon className="!w-4 !h-4" />
               </label>
               <input
                  type="file"
                  name=""
                  id={user.userName}
                  className="hidden"
                  onChange={handleAvatarChange}
                  accept=".png, .jpg, .jpeg"
               />
            </div>
            <Avatar img={imgAvatar} />
         </div>
         <ModalLoading
            isLoading={loading}
            typeMessageLoading={TypeMessageLoading.UPDATE}
         />
      </div>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pUpdateUser: (data: Partial<IUser>) => dispatch(updateUser(data)),
   }
}

export default connect(null, mapDispatchToProps)(UserInfoHeader)
