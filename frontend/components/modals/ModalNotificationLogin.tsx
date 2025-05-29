'use client'

import Image from 'next/image'
import { Modal } from '.'
import { useRouter } from 'next/navigation'
import { connect } from 'react-redux'
import { AppDispatch, AppState } from '@/store'
import { setShowModalNotificationLogin } from '@/store/common'

export interface IModalNotificationLoginProps {
   pIsShowModalNotificationLogin: boolean
   pCloseShowModalNotificationLogin: () => void
}

function ModalNotificationLogin({
   pIsShowModalNotificationLogin,
   pCloseShowModalNotificationLogin,
}: IModalNotificationLoginProps) {
   const router = useRouter()

   const handleLoginNav = () => {
      router.push('/login')
      pCloseShowModalNotificationLogin()
   }

   return (
      <Modal isShowModal={pIsShowModalNotificationLogin}>
         <div className="w-[550px] bg-white rounded px-10 py-8 d-flex flex-col">
            <div className="relative w-[180px] h-[180px]">
               <Image
                  src={'/authentication.png'}
                  fill
                  alt=""
                  sizes="100%"
                  className="object-cover"
               />
            </div>
            <h1 className="mt-6 text-2xl text-gray-darker font-semibold">
               Đăng nhập tài khoản
            </h1>
            <p className="text-center mt-2 text-sapo w-10/12">
               Bạn cần phải đăng nhập để tiếp tục thực hiện hành động này
            </p>
            <div className="d-flex w-full gap-2 mt-8">
               <button
                  className="btn-cancel !py-3 !flex-1"
                  onClick={pCloseShowModalNotificationLogin}
               >
                  Không phải bây giờ
               </button>
               <button
                  className="btn w-full border border-transparent flex-1 !py-3 font-semibold uppercase"
                  onClick={handleLoginNav}
               >
                  Đăng nhập ngay
               </button>
            </div>
         </div>
      </Modal>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pIsShowModalNotificationLogin: state.common.isShowModalNotificationLogin,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pCloseShowModalNotificationLogin: () =>
         dispatch(setShowModalNotificationLogin(false)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalNotificationLogin)
