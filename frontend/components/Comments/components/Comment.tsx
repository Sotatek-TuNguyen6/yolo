import {
   CommentAction,
   CommentForm,
   CommentReply,
} from '@/components/Comments/components'
import { VerifiedIcon, WarningIcon } from '@/components/icons'
import { TypeModalDelete } from '@/enums'
import { useToastify } from '@/hooks'
import { IComment, IProduct, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { ICommentParams, likeComment, unlikeComment } from '@/store/comment/thunkApi'
import { setShowModalNotificationLogin, showModalReport } from '@/store/common'
import { PayloadAction } from '@reduxjs/toolkit'
import { useEffect, useMemo, useState } from 'react'
import { AiFillStar } from 'react-icons/ai'
import { BiSolidLike } from 'react-icons/bi'
import { connect } from 'react-redux'

export interface ICommentProps {
   comment: IComment
   className?: string
   product: IProduct
   pUser: IUser | null
   pLikeComment: (id: string) => Promise<PayloadAction<unknown>>
   pUnLikeComment: (params: ICommentParams) => Promise<PayloadAction<unknown>>
   pShowModalNotificationLogin: () => void
   pShowModalReport: (commentId: string) => void
}

function Comment({
   comment,
   className = '',
   product,
   pUser,
   pLikeComment,
   pUnLikeComment,
   pShowModalNotificationLogin,
   pShowModalReport,
}: ICommentProps) {
   const [isLike, setIsLike] = useState<boolean>(false)
   const [isReply, setIsReply] = useState<boolean>(false)
   const [isEdit, setIsEdit] = useState<boolean>(false)
   const { error } = useToastify()

   console.log('comment', comment)
   const commentVals = useMemo(() => {
      return {
         ...comment,
         comment: '',
      }
   }, [comment])

   useEffect(() => {
      const ids = (comment?.likes as IUser[])?.map((l) => l._id)
      setIsLike(ids?.includes(pUser?._id || ''))
   }, [])

   const totalLikes = useMemo(() => {
      return comment?.likes?.length
   }, [comment])

   const isHandleAction = useMemo(() => {
      return (comment.user as IUser)?._id === pUser?._id && comment?.reply?.length === 0
   }, [comment])

   const isSold = useMemo(() => {
      return product.usersSold.includes(pUser?._id || '')
   }, [])

   const handleLike = async () => {
      if (!pUser) {
         pShowModalNotificationLogin()
         return
      }

      try {
         if (isLike) {
            setIsLike(false)
            await pUnLikeComment({
               id: comment._id,
               userId: pUser?._id || '',
            })
         } else {
            setIsLike(true)
            await pLikeComment(comment._id)
         }
      } catch (err: any) {
         console.log('err', err.message)
         error(err?.error?.message || 'Có lỗi xảy ra')
      }
   }

   const handleSetReply = () => {
      setIsReply((prev) => !prev)
   }

   const handleShowModalReport = () => {
      pShowModalReport(comment._id)
   }

   return (
      <div className={`${className}`}>
         {!isEdit && (
            <div className={`relative px-8 py-6  border border-gray-border rounded`}>
               <div className="flex items-center mb-2">
                  <div className="inline-block text-sm font-semibold text-primary mr-2">
                     {(comment.user as IUser)?.userName}
                  </div>
                  <div className="flex">
                     {Array.from(new Array(comment.rating)).map((rate, idx) => (
                        <span key={`${rate} ${idx}`}>
                           <AiFillStar className="text-secondary-dark" />
                        </span>
                     ))}
                  </div>
               </div>
               {isSold && (
                  <p className="text-xs flex gap-1 text-primary items-end font-medium mb-2">
                     <VerifiedIcon className="text-primary !w-[14px] !h-[14px]" /> Đã mua
                     hàng tại LUMEN - Mặc Mỗi Ngày, Thoải Mái Mỗi Ngày
                  </p>
               )}

               <div className="mb-2">
                  <p className="text-sm text-sapo font-medium leading-normal">
                     {comment.comment}
                  </p>
               </div>
               <div className="text-sm inline-flex items-center text-primary-light font-medium">
                  <div className="pr-2.5 cursor-pointer" onClick={handleSetReply}>
                     {isReply ? 'Đóng' : 'Gửi trả lời'}
                  </div>
                  <div
                     className="relative group flex items-center gap-1.5 pl-[15px] pr-2.5 cursor-pointer before:absolute before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-gray-dark before:top-1/2 before:left-0 before:-translate-y-1/2"
                     onClick={handleLike}
                  >
                     <BiSolidLike
                        className={`w-4 h-4 group-hover:text-blue-700 ${
                           isLike ? 'text-primary' : 'text-gray-dark'
                        }`}
                     />
                     <span
                        className={`group-hover:text-blue-700 ${
                           isLike ? 'text-primary' : 'text-primary'
                        }`}
                     >
                        {totalLikes === 0 ? '' : totalLikes} Hữu ích
                     </span>
                  </div>
                  <div
                     className="relative group flex items-center gap-1.5 px-[15px] cursor-pointer before:absolute before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-gray-dark before:top-1/2 before:left-0 before:-translate-y-1/2"
                     onClick={handleShowModalReport}
                  >
                     <WarningIcon className="!w-4 !h-4 text-gray-dark group-hover:text-red-700 duration-common" />
                     <span className="group-hover:text-red-700 duration-common">
                        Báo cáo sai phạm
                     </span>
                  </div>
               </div>
               {isHandleAction && (
                  <CommentAction
                     comment={comment}
                     setEdit={setIsEdit}
                     typeComment={TypeModalDelete.DELETE_COMMENT}
                  />
               )}
            </div>
         )}
         {(isReply || isEdit) && (
            <CommentForm
               className={`${isReply ? 'pl-8 my-4' : ''}`}
               comment={isEdit ? comment : commentVals}
               productId={product._id as string}
               setIsReply={setIsReply}
               setIsEdit={setIsEdit}
            />
         )}
         {comment?.reply?.length > 0 && (
            <div className="pl-8 mt-6 flex flex-col gap-4">
               {comment.reply.map((c) => (
                  <CommentReply key={c._id} comment={c} />
               ))}
            </div>
         )}
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pLikeComment: (id: string) => dispatch(likeComment(id)),
      pUnLikeComment: (params: ICommentParams) => dispatch(unlikeComment(params)),
      pShowModalNotificationLogin: () => dispatch(setShowModalNotificationLogin(true)),
      pShowModalReport: (commentId: string) => dispatch(showModalReport(commentId)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comment)
