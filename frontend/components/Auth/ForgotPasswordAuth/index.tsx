'use client'

import { authApi } from '@/api'
import { Button } from '@/components/buttons'
import { InputField } from '@/components/form-fields'
import { useToastify } from '@/hooks'
import { IVerifyEmailForm } from '@/models'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const schema = yup.object().shape({
   emailAddress: yup
      .string()
      .required('Vui lòng nhập email')
      .email('Email của bạn không đúng'),
})

export function ForgotPasswordAuth() {
   const { error, success } = useToastify()
   const {
      control,
      handleSubmit,
      reset,
      formState: { isSubmitting, isDirty, isValid },
   } = useForm<IVerifyEmailForm>({
      defaultValues: {
         emailAddress: '',
      },
      resolver: yupResolver(schema),
   })

   const handleSendVerifyEmail = async (values: IVerifyEmailForm) => {
      try {
         await authApi.verifyEmail(values.emailAddress)
         reset()
         success('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu')
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <div className="w-auth bg-white m-auto px-[107px] py-10 rounded">
         <h3 className="heading-4 uppercase !text-secondary">Quên mật khẩu</h3>

         <form onSubmit={handleSubmit(handleSendVerifyEmail)} className="mt-4 m-auto">
            <p className="text-sm text-sapo text-center font-medium mb-2">
               Nếu bạn quên mật khẩu, vui lòng nhập địa chỉ email đã đăng ký của bạn.
               Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
            </p>
            <div className="mb-4">
               <InputField<IVerifyEmailForm>
                  control={control}
                  name="emailAddress"
                  label="Email"
                  required
                  placeholder="nguyenvana@gmail.com"
               />
            </div>
            <Button
               type="submit"
               className="text-lg w-full font-semibold"
               disabled={isSubmitting || !isDirty || !isValid}
               disabledClassName="disabled-btn-submit"
               title={'Gửi'}
            ></Button>
            <p className="pt-3 text-sm text-center">
               <Link
                  href={'/login'}
                  className={`text-secondary hover:underline hover:text-secondary-dark font-medium ${
                     isSubmitting ? 'pointer-events-none' : ''
                  }`}
                  scroll
               >
                  Trở lại đăng nhập
               </Link>
            </p>
         </form>
      </div>
   )
}
