'use client'

import { DatePickerField, InputField, SelectField } from '@/components/form-fields'
import { CloseIcon } from '@/components/icons'
import { IUser, IUserAccountForm } from '@/models'
import { Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '.'
import { Button } from '../buttons'
import { useToastify } from '@/hooks'
import { connect } from 'react-redux'
import { AppDispatch } from '@/store'
import { updateUser } from '@/store/user/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import { genderSelects } from '@/data'

export interface IModalAccountFormProps {
   isShow: boolean
   setShow: Dispatch<SetStateAction<boolean>>
   initValues: IUserAccountForm
   user: IUser
   pUpdateUser: (data: Partial<IUser>) => Promise<PayloadAction<unknown>>
}

function ModalAccountForm({
   isShow,
   setShow,
   initValues,
   user,
   pUpdateUser,
}: IModalAccountFormProps) {
   const { success, error } = useToastify()
   const {
      control,
      handleSubmit,
      formState: { isSubmitting },
   } = useForm<IUserAccountForm>({
      defaultValues: initValues,
   })

   const handleClose = () => {
      setShow(false)
   }

   const handleSaveUserAccount = async (values: IUserAccountForm) => {
      try {
         await pUpdateUser({
            ...values,
            _id: user.id,
            id: user.id,
            dateOfBirth: values.dateOfBirth.startDate,
         })
         handleClose()
         success('Cập nhật thông tin thành công')
      } catch (err) {
         error((err as Error).message as string)
      }
   }

   return (
      <Modal isShowModal={isShow}>
         <div className="max-w-[500px] w-full bg-white rounded ">
            <div className="px-8 py-3 flex justify-between items-center border-b border-gray-border">
               <h4 className="font-semibold text-sapo">Chỉnh sửa thông tin</h4>
               <div className="inline-block cursor-pointer" onClick={handleClose}>
                  <CloseIcon className="!w-5 !h-5" />
               </div>
            </div>
            <div className="px-8 pt-3 pb-8">
               <form onSubmit={handleSubmit(handleSaveUserAccount)}>
                  <div className="mb-6">
                     <InputField<IUserAccountForm>
                        control={control}
                        name="fullName"
                        label="Họ và tên"
                        required
                        placeholder="Nguyễn Văn An"
                        disabled={isSubmitting}
                     />
                     <InputField<IUserAccountForm>
                        control={control}
                        name="emailAddress"
                        label="Email"
                        required
                        placeholder={'nguyenvanan@gmail.com'}
                        disabled={true}
                     />
                     <InputField<IUserAccountForm>
                        control={control}
                        name="phoneNumber"
                        label="Số điện thoại"
                        required
                        placeholder={'(+84) 123-456-7890'}
                        disabled={isSubmitting}
                     />
                     <SelectField<IUserAccountForm>
                        control={control}
                        name="gender"
                        label={'Giới tính'}
                        required
                        options={genderSelects}
                        initValue
                        placeholder="--Chọn giới tính--"
                        disabled={isSubmitting}
                     />
                     <DatePickerField<IUserAccountForm>
                        control={control}
                        name="dateOfBirth"
                        label="Ngày sinh"
                        required
                        placeholder="Chọn ngày sinh"
                        disabled={isSubmitting}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <Button
                        type="button"
                        className="btn-cancel !py-3"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        title={'Hủy'}
                     />
                     <Button
                        type="submit"
                        className="uppercase font-semibold !py-3"
                        disabled={isSubmitting}
                        title={'Lưu'}
                        isLoading={isSubmitting}
                        disabledClassName="disabled-btn-submit"
                     />
                  </div>
               </form>
            </div>
         </div>
      </Modal>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pUpdateUser: (data: Partial<IUser>) => dispatch(updateUser(data)),
   }
}

export default connect(null, mapDispatchToProps)(ModalAccountForm)
