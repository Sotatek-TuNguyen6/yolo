'use client'

import { authApi } from '@/api'
import { Button } from '@/components/buttons'
import { NavUserHeader } from '@/components/common/NavUserInfo/components'
import { PasswordField } from '@/components/form-fields'
import { changePasswordVals } from '@/data'
import { useToastify } from '@/hooks'
import { IChangePassword, IChangePasswordForm } from '@/models'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
export interface IChangePasswordProps {}

const schema = yup.object().shape({
   currentPassword: yup
      .string()
      .required('Vui lòng nhập mật khẩu hiện tại')
      .min(8, 'Mật khẩu ít nhất 8 ký tự'),
   newPassword: yup
      .string()
      .required('Vui lòng nhập mật khẩu mới')
      .min(8, 'Mật khẩu ít nhất 8 ký tự'),
   confirmPassword: yup
      .string()
      .required('Vui lòng xác nhận mật khẩu mới')
      .min(8, 'Mật khẩu ít nhất 8 ký tự')
      .oneOf([yup.ref('newPassword')], 'Mật khẩu không khớp với mật khẩu mới'),
})

export default function ChangePassword() {
   const { success, error } = useToastify()
   const router = useRouter()
   const {
      handleSubmit,
      control,
      reset,
      formState: { isSubmitting },
   } = useForm<IChangePasswordForm>({
      defaultValues: changePasswordVals,
      resolver: yupResolver(schema),
   })

   const handleChangePassword = async (values: IChangePasswordForm) => {
      try {
         const newValues: IChangePassword = {
            newPassword: values.newPassword,
            password: values.currentPassword,
         }
         await authApi.changePassword(newValues)
         reset()
         success('Thay đổi mật khẩu thành công')
      } catch (err) {
         error((err as Error).message)
      }
   }

   const handleCancel = () => {
      router.push('/account')
   }

   return (
      <div>
         <NavUserHeader
            title={
               <span className="text-tag text-sm font-medium">
                  <span className="text-secondary-dark mr-2 inline-block font-semibold text-base">
                     Đổi mật khẩu
                  </span>{' '}
                  (Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác)
               </span>
            }
         />
         <div className="px-10 py-6">
            <form onSubmit={handleSubmit(handleChangePassword)}>
               <div className="grid grid-cols-2 gap-6 items-center">
                  <div>
                     <PasswordField<IChangePasswordForm>
                        control={control}
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        required
                        disabled={isSubmitting}
                     />
                     <PasswordField<IChangePasswordForm>
                        control={control}
                        name="newPassword"
                        label="Mật khẩu mới"
                        required
                        disabled={isSubmitting}
                     />
                     <PasswordField<IChangePasswordForm>
                        control={control}
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        required
                        disabled={isSubmitting}
                     />
                  </div>
                  <div>
                     <Link
                        href="/forgot-password"
                        className="font-semibold text-gray-dark hover:underline hover:text-sapo"
                        scroll
                     >
                        Quên mật khẩu?
                     </Link>
                  </div>
               </div>
               <div className="absolute bottom-6 left-0 w-full flex gap-2 font-semibold mt-10 px-10">
                  <button
                     type="button"
                     className="btn-cancel !py-3"
                     onClick={handleCancel}
                     disabled={isSubmitting}
                  >
                     Hủy
                  </button>
                  <Button
                     type="submit"
                     className="flex-1 !py-3 uppercase"
                     disabledClassName={'disabled-btn-submit'}
                     disabled={isSubmitting}
                     isLoading={isSubmitting}
                     title={'Lưu'}
                  />
               </div>
            </form>
         </div>
      </div>
   )
}
