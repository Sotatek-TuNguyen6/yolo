'use client'

import { Button } from '@/components/buttons'
import { TypeModalDelete } from '@/enums'
import { useToastify } from '@/hooks'
import { IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { IItemParams, deleteItemCart } from '@/store/cart/thunkApi'
import { IModalDelete, showModalDelete } from '@/store/common'
import { deleteAddressUser } from '@/store/user/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import Image from 'next/image'
import { useState } from 'react'
import { connect } from 'react-redux'
import { Modal } from '.'
import { IReply, deleteComment, deleteCommentReply } from '@/store/comment/thunkApi'

export interface IModalDeleteProps {
   pIsShowModal: boolean
   pUser: IUser | null
   pModalDeleteInfo: IModalDelete
   pCloseModalDelete: () => void
   pDeleteAddress: (ids: {
      userId: string
      addressId: string
   }) => Promise<PayloadAction<unknown>>
   pDeleteItemCart: (data: IItemParams) => Promise<PayloadAction<unknown>>
   pDeleteComment: (id: string) => Promise<PayloadAction<unknown>>
   pDeleteReplyComment: (params: IReply) => Promise<PayloadAction<unknown>>
}

function ModalDelete({
   pIsShowModal,
   pUser,
   pModalDeleteInfo,
   pCloseModalDelete,
   pDeleteAddress,
   pDeleteItemCart,
   pDeleteComment,
   pDeleteReplyComment,
}: IModalDeleteProps) {
   const { error, success } = useToastify()
   const [isLoading, setIsLoading] = useState<boolean>(false)

   const handleDelete = async () => {
      try {
         setIsLoading(true)
         switch (pModalDeleteInfo.type) {
            case TypeModalDelete.DELETE_ADDRESS: {
               if (pUser) {
                  await pDeleteAddress({
                     userId: pUser._id,
                     addressId: pModalDeleteInfo.id,
                  })
                  setIsLoading(false)
                  success('Xóa địa chỉ thành công')
               }
               break
            }

            case TypeModalDelete.DELETE_PRODUCT: {
               if (pUser) {
                  await pDeleteItemCart({
                     id: pModalDeleteInfo.idCart as string,
                     itemId: pModalDeleteInfo.id,
                  })
                  setIsLoading(false)
                  success('Xóa sản phẩm thành công')
               }
               break
            }

            case TypeModalDelete.DELETE_COMMENT: {
               if (pUser) {
                  await pDeleteComment(pModalDeleteInfo.id)
                  setIsLoading(false)
                  success('Xóa bình luận thành công')
               }
               break
            }

            case TypeModalDelete.DELETE_REPLY_COMMENT: {
               if (pUser) {
                  await pDeleteReplyComment({
                     id: pModalDeleteInfo.id,
                     commentRootId: pModalDeleteInfo.rootId as string,
                  })
                  setIsLoading(false)
                  success('Xóa phản hồi bình luận thành công')
               }
               break
            }
         }
         pCloseModalDelete()
      } catch (err: any) {
         setIsLoading(false)
         pCloseModalDelete()
         console.error('Delete error:', err)
         error(err?.error?.message || 'Có lỗi xảy ra khi xóa')
      }
   }

   return (
      <Modal isShowModal={pIsShowModal}>
         <div className="bg-white max-w-[550px] w-full px-10 py-8 rounded d-flex flex-col">
            <div className="w-[150px] h-[150px] relative">
               <Image
                  src={'/deleted.png'}
                  alt=""
                  sizes="100%"
                  fill
                  className="object-cover"
               />
            </div>
            <h1 className="mt-6 text-2xl text-gray-darker font-semibold">Xóa</h1>
            <p className="text-center mt-2 text-sapo">
               {pModalDeleteInfo?.title || 'Bạn có chắc chắn muốn xóa dữ liệu này?'}
            </p>
            <div className="d-flex w-full gap-4 mt-6">
               <Button
                  className="btn-cancel !py-3"
                  title={'Hủy'}
                  onClick={pCloseModalDelete}
                  disabled={isLoading}
               />
               <Button
                  className="w-full border border-transparent flex-1 font-semibold uppercase !py-3 !bg-red-600 hover:!bg-red-700"
                  title={'Xóa'}
                  onClick={handleDelete}
                  isLoading={isLoading}
                  disabled={isLoading}
                  disabledClassName="disabled-btn-submit disabled:!bg-red-600"
               />
            </div>
         </div>
      </Modal>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pIsShowModal: state.common.isShowModalDelete,
      pModalDeleteInfo: state.common.modalDeleteInfo,
      pUser: state.user.user,
   }
}
const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pCloseModalDelete: () => dispatch(showModalDelete(false)),
      pDeleteAddress: (ids: { userId: string; addressId: string }) =>
         dispatch(deleteAddressUser(ids)),
      pDeleteItemCart: (data: IItemParams) => dispatch(deleteItemCart(data)),
      pDeleteComment: (id: string) => dispatch(deleteComment(id)),
      pDeleteReplyComment: (params: IReply) => dispatch(deleteCommentReply(params)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalDelete)
