import { Modal } from '@/components/modals'
import { InputField, RatingField } from '@/components/form-fields'
import { CloseIcon, SendIcon } from '@/components/icons'
import { commentDefaultVals } from '@/data'
import { ICommentData, ICommentForm, IProduct, IUser } from '@/models'
import { yupResolver } from '@hookform/resolvers/yup'
import { Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { connect } from 'react-redux'
import { AppState } from '@/store'
import { Button } from '@/components/buttons'

export interface ICommentFormModalProps {
   isShowModal?: boolean
   setIsShowModal?: Dispatch<SetStateAction<boolean>>
   product: IProduct
   pUser: IUser | null
   fnAddComment: (data: ICommentData) => Promise<void>
}

const schema = yup.object().shape({
   fullName: yup.string().required('Vui lòng nhập tên của bạn'),
   emailAddress: yup.string().required('Vui lòng nhập email của bạn'),
   phoneNumber: yup.string(),
   comment: yup.string().required('Vui lòng nhập nội dụng đánh giá của bạn'),
})

function CommentFormModal({
   isShowModal = false,
   setIsShowModal,
   product,
   fnAddComment,
   pUser,
}: ICommentFormModalProps) {
   const {
      control,
      handleSubmit,
      formState: { isSubmitting, isDirty, isValid },
      reset,
   } = useForm<ICommentForm>({
      defaultValues: {
         ...commentDefaultVals,
         fullName: pUser?.fullName || '',
         emailAddress: pUser?.email || '',
         phoneNumber: pUser?.phoneNumber || '',
      },
      resolver: yupResolver(schema) as any,
   })

   const handleSendComment = async (values: ICommentForm) => {
      try {
         if (pUser) {
            const newValues: ICommentData = {
               user: pUser._id as string,
               product: product._id,
               fullName: values.fullName,
               emailAddress: values.emailAddress,
               phoneNumber: values.phoneNumber,
               comment: values.comment,
               rating: values.rating,
               reply: [],
               commentRoot: null,
               likes: [],
            }
            await fnAddComment(newValues)
            handleCloseModal()
            reset()
         }
      } catch (error) {
         throw new Error(error as string)
      }
   }

   const handleCloseModal = () => {
      setIsShowModal?.(false)
   }

   return (
      <Modal isShowModal={isShowModal}>
         <div className="relative max-w-[700px] w-[700px] bg-white rounded px-8 pt-6 pb-7">
            <div
               className="inline-block absolute right-3 top-2 cursor-pointer"
               onClick={handleCloseModal}
            >
               <CloseIcon className="!w-8 !h-8 text-sapo" />
            </div>
            <div>
               <h3 className="text-center text-lg text-sapo">Đánh giá sản phẩm</h3>
               {/* add title */}
               <p className="text-center text-sapo font-semibold text-lg pt-1">
                  {product.name}
               </p>
            </div>
            <form className="mt-4" onSubmit={handleSubmit(handleSendComment)}>
               <div>
                  <div className="inline-flex items-end">
                     <span className="text-sapo inline-block mr-4">
                        Đánh giá của bạn về sản phẩm:
                     </span>{' '}
                     <RatingField<ICommentForm>
                        control={control}
                        name="rating"
                        className="inline-flex"
                     />
                  </div>
                  <div>
                     <InputField<ICommentForm>
                        control={control}
                        name="fullName"
                        label="Họ và tên"
                        placeholder="Nhập tên của bạn"
                        disabled
                        required
                     />
                     <div className="flex gap-4">
                        <InputField<ICommentForm>
                           control={control}
                           name="emailAddress"
                           label="Email"
                           placeholder="Địa chỉ email"
                           className="flex-1"
                           disabled
                           required
                        />
                        <InputField<ICommentForm>
                           control={control}
                           name="phoneNumber"
                           label="Số điện thoại"
                           placeholder="Số điện thoại (nếu có)"
                           className="flex-1"
                           disabled
                           required
                        />
                     </div>
                     <InputField<ICommentForm>
                        control={control}
                        name="comment"
                        label="Nội dung đánh giá"
                        placeholder="Nhập nội dung đánh giá của bạn về sản phẩm này"
                        multiline
                        rows={6}
                        required
                        noResize
                     />
                  </div>
                  <div className="d-flex mt-4">
                     <Button
                        type="submit"
                        className="btn !inline-flex gap-2 !bg-primary-light text-sm font-medium hover:!bg-primary"
                        title={''}
                        // disabled={isSubmitting || !isDirty || !isValid}
                        // isLoading={isSubmitting}
                        loadingClassName="!w-5 !h-5"
                        disabledClassName="disabled-btn-primary-submit"
                     >
                        <span>Gửi đánh giá</span> <SendIcon className="!w-4 !h-4" />
                     </Button>
                  </div>
               </div>
            </form>
         </div>
      </Modal>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

export default connect(mapStateToProps, null)(CommentFormModal)
