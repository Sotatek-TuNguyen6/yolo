'use client'

import { Button } from '@/components/buttons'
import { AppDispatch, AppState } from '@/store'
import { showModalLogout } from '@/store/common'
import { resetUser } from '@/store/user'
import { removeLs } from '@/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { connect } from 'react-redux'
import { Modal } from '.'
import { IUser } from '@/models'
import { TypeAuth } from '@/enums'
import { signOut } from 'next-auth/react'

export interface IModalLogoutProps {
   pIsShowModalLogout: boolean
   pUser: IUser
   pSetShowModalLogout: (isShow: boolean) => void
   pResetUser: () => void
}

function ModalLogout({
   pIsShowModalLogout,
   pUser,
   pSetShowModalLogout,
   pResetUser,
}: IModalLogoutProps) {
   const router = useRouter()

   const handleCancel = () => {
      pSetShowModalLogout(false)
   }

   const handleLogout = async () => {
      router.push('/')
      removeLs(process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY as string)
      removeLs(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY as string)
      handleCancel()
      pResetUser()
      if (pUser && pUser.type !== TypeAuth.EMAIL) {
         await signOut({ redirect: false })
      }
   }

   return (
      <Modal isShowModal={pIsShowModalLogout}>
         <div className="max-w-[550px] w-full bg-white rounded px-10 py-6 d-flex flex-col">
            <div className="w-[150px] h-[150px] relative">
               <Image
                  src={'/logout.png'}
                  alt=""
                  sizes="100%"
                  fill
                  className="object-cover"
               />
            </div>
            <h1 className="mt-6 text-2xl text-gray-darker font-semibold">Đăng xuất</h1>
            <p className="text-center mt-2 text-sapo">
               Bạn có chắc chắn muốn đăng xuất tài khoản không?
            </p>
            <div className="d-flex w-full gap-2 mt-8">
               <Button
                  className="btn-cancel !py-3"
                  title={'Hủy'}
                  onClick={handleCancel}
               />
               <Button
                  className="w-full border border-transparent flex-1 !py-3 font-semibold !bg-red-600 hover:!bg-red-700 uppercase"
                  title={'Đăng xuất'}
                  onClick={handleLogout}
               />
            </div>
         </div>
      </Modal>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pIsShowModalLogout: state.common.isShowModalLogout,
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pSetShowModalLogout: (isShow: boolean) => dispatch(showModalLogout(isShow)),
      pResetUser: () => dispatch(resetUser()),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalLogout)
