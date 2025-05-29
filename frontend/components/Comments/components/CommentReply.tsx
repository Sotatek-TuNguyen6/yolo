import { WarningIcon } from '@/components/icons'
import { useToastify } from '@/hooks'
import { IComment, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { IReply, likeReplyComment, unlikeReplyComment } from '@/store/comment/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import { useEffect, useMemo, useState } from 'react'
import { BiSolidLike } from 'react-icons/bi'
import { connect } from 'react-redux'
import { CommentAction, CommentForm } from '@/components/Comments/components'
import { TypeModalDelete } from '@/enums'
import { setShowModalNotificationLogin } from '@/store/common'

export interface ICommentReplyProps {
   comment: IComment
   pUser: IUser | null
   pLikeReplyComment: (params: IReply) => Promise<PayloadAction<unknown>>
   pUnLikeReplyComment: (params: IReply) => Promise<PayloadAction<unknown>>
   pShowModalNotificationLogin: () => void
}

function CommentReply({
   comment,
   pUser,
   pLikeReplyComment,
   pUnLikeReplyComment,
   pShowModalNotificationLogin,
}: ICommentReplyProps) {
   const [isLike, setIsLike] = useState<boolean>(false)
   const [isEdit, setEdit] = useState<boolean>(false)
   const { error, success } = useToastify()

   useEffect(() => {
      const ids = comment.likes as string[]
      setIsLike(ids.includes(pUser?._id || ''))
   }, [])

   const handleLike = async () => {
      if (!pUser) {
         pShowModalNotificationLogin()
         return
      }

      try {
         const params = {
            id: comment._id,
            commentRootId: comment.commentRoot as string,
         }
         console.log('isLike', isLike)
         if (isLike) {
            setIsLike(false)
            await pUnLikeReplyComment(params)
            success('Bỏ thích thành công')
         } else {
            setIsLike(true)
            await pLikeReplyComment(params)
            success('Đã thích thành công')
         }
      } catch (err) {
         error((err as Error).message)
      }
   }

   const totalLikes = useMemo(() => {
      return comment.likes.length
   }, [comment])

   return (
      <div className="">
         {isEdit && (
            <CommentForm
               comment={comment}
               productId={comment.product as string}
               setIsEdit={setEdit}
            />
         )}
         {!isEdit && (
            <div className="relative border-l-[3px] border-secondary py-2.5 pl-3 bg-cart rounded-ee">
               <div className="inline-block text-sm font-semibold text-primary mr-2 mb-1">
                  {(comment.user as IUser).userName}
               </div>
               <div className="mb-3">
                  <p className="text-sm text-description leading-normal">
                     {comment.comment}
                  </p>
               </div>
               <div className="flex items-center text-sm font-medium">
                  <button
                     className="relative group flex items-center gap-1.5 pr-2.5 cursor-pointer"
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
                  </button>
                  <div className="relative group flex items-center gap-1.5 px-[15px] cursor-pointer before:absolute before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:bg-gray-dark before:top-1/2 before:left-0 before:-translate-y-1/2">
                     <WarningIcon className="!w-4 !h-4 text-gray-dark group-hover:text-red-700 duration-common" />
                     <span className="group-hover:text-red-700 duration-common text-primary">
                        Báo cáo sai phạm
                     </span>
                  </div>
               </div>
               {pUser?._id === (comment.user as IUser)._id && (
                  <CommentAction
                     comment={comment}
                     typeComment={TypeModalDelete.DELETE_REPLY_COMMENT}
                     setEdit={setEdit}
                  />
               )}
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
      pLikeReplyComment: (params: IReply) => dispatch(likeReplyComment(params)),
      pUnLikeReplyComment: (params: IReply) => dispatch(unlikeReplyComment(params)),
      pShowModalNotificationLogin: () => dispatch(setShowModalNotificationLogin(true)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentReply)
