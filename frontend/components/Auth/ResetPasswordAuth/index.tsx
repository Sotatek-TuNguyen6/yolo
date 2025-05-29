'use client'

import { authApi } from '@/api'
import { Button } from '@/components/buttons'
import { PasswordField } from '@/components/form-fields'
import { useToastify } from '@/hooks'
import { IResetPasswordForm } from '@/models'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const schema = yup.object().shape({
   newPassword: yup
      .string()
      .required('Vui lòng nhập mật khẩu mới')
      .min(8, 'Mật khẩu mới phải ít nhất 8 ký tự'),
   confirmPassword: yup
      .string()
      .required('Vui lòng xác nhận lại mật khẩu mới')
      .oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
})

export function ResetPasswordAuth() {
   const { error, success } = useToastify()
   const router = useRouter()
   const {
      control,
      handleSubmit,
      reset,
      formState: { isSubmitting, isDirty, isValid },
   } = useForm<IResetPasswordForm>({
      defaultValues: {
         newPassword: '',
         confirmPassword: '',
      },
      resolver: yupResolver(schema),
   })

   const handleResetPassword = async (values: IResetPasswordForm) => {
      try {
         await authApi.resetPassword(values.newPassword)

         reset()
         success('Đặt lại mật khẩu thành công. Tiến hành đăng nhập nào!')
         router.push('/login')
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <div className="w-auth bg-white m-auto px-[107px] py-10 rounded">
         <h3 className="heading-4 uppercase !text-secondary">Đặt lại mật khẩu</h3>
         <form onSubmit={handleSubmit(handleResetPassword)} className="mt-4 m-auto">
            <div className="pb-4">
               <PasswordField<IResetPasswordForm>
                  control={control}
                  name="newPassword"
                  label="Mật khẩu mới"
                  required
               />
               <PasswordField<IResetPasswordForm>
                  control={control}
                  name="confirmPassword"
                  label="Xác nhận lại mật khẩu"
                  required
               />
            </div>
            <Button
               type="submit"
               className="text-lg w-full font-semibold"
               disabled={isSubmitting || !isDirty || !isValid}
               disabledClassName="disabled-btn-submit"
               title={'Đặt lại mật khẩu'}
            ></Button>
         </form>
      </div>
   )
}
