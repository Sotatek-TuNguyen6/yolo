import { Button } from '@/components/buttons'
import { InputField } from '@/components/form-fields'
import { commentDefaultVals } from '@/data'
import { useToastify } from '@/hooks'
import { IComment, ICommentForm, ICommentReplyData, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import {
   ICommentReply,
   replyComment,
   updateComment,
   updateCommentReply,
} from '@/store/comment/thunkApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { PayloadAction } from '@reduxjs/toolkit'
import { Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { connect } from 'react-redux'
import * as yup from 'yup'

export interface ICommentFormProps {
   className?: string
   comment: Partial<IComment>
   setIsReply?: Dispatch<SetStateAction<boolean>>
   setIsEdit?: Dispatch<SetStateAction<boolean>>
   productId: string
   pUser: IUser | null
   pReplyComment: (data: ICommentReply) => Promise<PayloadAction<unknown>>
   pUpdateComment: (data: Partial<IComment>) => Promise<PayloadAction<unknown>>
   pUpdateCommentReply: (data: Partial<IComment>) => Promise<PayloadAction<unknown>>
}

const schema = yup.object().shape({
   fullName: yup.string().required('Vui lòng nhập tên của bạn'),
   email: yup.string().required('Vui lòng nhập email của bạn'),
   phoneNumber: yup.string(),
   comment: yup.string().required('Vui lòng nhập nội dung đánh giá của bạn'),
})

function CommentForm({
   className = '',
   productId,
   comment,
   setIsReply,
   setIsEdit,
   pUser,
   pReplyComment,
   pUpdateComment,
   pUpdateCommentReply,
}: ICommentFormProps) {
   const { error } = useToastify()
   const {
      control,
      handleSubmit,
      formState: { isSubmitting },
      reset,
   } = useForm<ICommentForm>({
      defaultValues: {
         ...commentDefaultVals,
         fullName: pUser?.fullName || '',
         email: pUser?.email || '',
         phoneNumber: pUser?.phoneNumber || '',
         comment: comment?.comment || '',
      },
      resolver: yupResolver(schema) as any,
   })

   const handleCancel = () => {
      if (setIsEdit) {
         setIsEdit(false)
      }
      if (setIsReply) {
         setIsReply(false)
      }
   }

   const handleReplyComment = async (values: ICommentForm) => {
      try {
         const newValues: ICommentReplyData = {
            fullName: values.fullName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            comment: values.comment,
            product: productId,
            user: pUser?._id as string,
            commentRoot: comment._id,
            likes: [],
         }
         await pReplyComment({
            id: comment._id as string,
            comment: newValues,
         })
         reset()
         if (setIsReply) {
            setIsReply(false)
         }
      } catch (err) {
         throw new Error(err as string)
      }
   }

   const handleUpdateComment = async (values: Partial<IComment>) => {
      try {
         await pUpdateComment(values)
      } catch (err) {
         throw new Error(err as string)
      }
   }

   const handleUpdateCommentReply = async (values: Partial<IComment>) => {
      try {
         await pUpdateCommentReply(values)
      } catch (err) {
         throw new Error(err as string)
      }
   }

   const handleUpdate = async (values: ICommentForm) => {
      try {
         const newValues: Partial<IComment> = {
            ...values,
            _id: comment._id,
            product: productId,
            id: comment._id,
            commentRoot: comment.commentRoot,
         }
         if (!comment.commentRoot) {
            await handleUpdateComment(newValues)
         } else {
            await handleUpdateCommentReply(newValues)
         }
         reset()
         if (setIsEdit) {
            setIsEdit(false)
         }
      } catch (err) {
         throw new Error(err as string)
      }
   }

   const handleSubmitComment = async (values: ICommentForm) => {
      try {
         console.log('values', values)
         console.log('comment', comment)
         if (comment.comment) {
            await handleUpdate(values)
         } else {
            await handleReplyComment(values)
         }
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <form className={`block ${className}`} onSubmit={handleSubmit(handleSubmitComment)}>
         <div className="flex gap-6 items-end">
            <div className="flex flex-col flex-1">
               <div className="flex gap-4">
                  <InputField<ICommentForm>
                     control={control}
                     name={'fullName'}
                     label={''}
                     placeholder="Nhập tên của bạn"
                     disabled
                     className="flex-1 pb-0"
                  />
                  <InputField<ICommentForm>
                     control={control}
                     name={'email'}
                     label={''}
                     placeholder="Nhập email của bạn"
                     disabled
                     className="flex-1 pb-0"
                  />
                  <InputField<ICommentForm>
                     control={control}
                     name={'phoneNumber'}
                     label={''}
                     placeholder="Số điện thoại (nếu có)"
                     disabled
                     className="flex-1 pb-0"
                  />
               </div>
               <InputField<ICommentForm>
                  control={control}
                  name="comment"
                  label=""
                  placeholder="Nhập trả lời của bạn"
                  multiline
                  rows={4}
                  className="pb-0"
                  noResize
               />
            </div>
            <div className="flex flex-col gap-2">
               <Button
                  type="button"
                  title={'Hủy'}
                  className={'btn-cancel !capitalize !text-sm'}
                  disabled={isSubmitting}
                  onClick={handleCancel}
               />
               <Button
                  type="submit"
                  title={'Trả lời'}
                  className={'!bg-primary !text-sm !py-3 font-medium'}
                  // disabled={isSubmitting}
                  disabledClassName="!bg-primary"
                  isLoading={isSubmitting}
                  loadingClassName="!w-5 !h-5"
               />
            </div>
         </div>
      </form>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pReplyComment: (data: ICommentReply) => dispatch(replyComment(data)),
      pUpdateComment: (data: Partial<IComment>) => dispatch(updateComment(data)),
      pUpdateCommentReply: (data: Partial<IComment>) =>
         dispatch(updateCommentReply(data)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentForm)
