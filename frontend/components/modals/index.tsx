import { ReactNode } from 'react'

export { default as ModalAddressForm } from '@/components/modals/ModalAddressForm'
export { default as ModalLogout } from '@/components/modals/ModalLogout'
export { default as ModalAccountForm } from '@/components/modals/ModalAccountForm'
export { default as ModalDelete } from '@/components/modals/ModalDelete'
export { default as ModalPayment } from '@/components/modals/ModalPayment'
export * from '@/components/modals/ModalOrderProductList'
export * from '@/components/modals/ModalLoading'
export { default as ModalReport } from '@/components/modals/ModalReport'
export { default as ModalNotificationLogin } from '@/components/modals/ModalNotificationLogin'

export interface IModalProps {
   isShowModal?: boolean
   children: ReactNode
}
export function Modal({ isShowModal = false, children }: IModalProps) {
   return (
      <div
         className={`fixed min-w-screen w-full min-h-screen h-full top-0 left-0 bg-black bg-opacity-60 d-flex ${
            isShowModal
               ? 'opacity-100 pointer-events-auto'
               : 'opacity-0 pointer-events-none'
         } z-50 duration-500 ease-in-out`}
      >
         {children}
      </div>
   )
}
