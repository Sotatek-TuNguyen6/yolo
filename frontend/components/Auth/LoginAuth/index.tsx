'use client'

import { authApi } from '@/api'
import { Button } from '@/components/buttons'
import { CheckBoxField, InputField, PasswordField } from '@/components/form-fields'
import { useToastify } from '@/hooks'
import { ILogin, ILoginForm, ILoginGoogle, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { loginGoogleUser, loginUser } from '@/store/user/thunkApi'
import { generateUsername, getLs, setLs, signJwt, verifyJwt } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { PayloadAction } from '@reduxjs/toolkit'
import { getCookie, setCookie } from 'cookies-next'
import { Session } from 'next-auth'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FcGoogle } from 'react-icons/fc'
import { connect } from 'react-redux'
import * as yup from 'yup'

const schema = yup.object().shape({
   email: yup
      .string()
      .required('Vui lòng nhập email')
      .email('Email của bạn không hợp lệ'),
   password: yup
      .string()
      .required('Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu phải ít nhất 8 kí tự'),
   rememberMe: yup.boolean().required(''),
})

export interface ILoginAuthProps {
   pLoginUser: (data: ILogin) => Promise<PayloadAction<unknown>>
   pLoginGoogleUser: (data: ILoginGoogle) => Promise<PayloadAction<unknown>>
}

function LoginAuth({ pLoginUser, pLoginGoogleUser }: ILoginAuthProps) {
   const { data: session } = useSession()
   const { success, error } = useToastify()
   const router = useRouter()

   const {
      control,
      handleSubmit,
      setValue,
      formState: { isSubmitting, errors, isValid },
      trigger,
   } = useForm<ILoginForm>({
      defaultValues: {
         email: '',
         password: '',
         rememberMe: false,
      },
      resolver: yupResolver(schema),
   })
   const err = !!Object.keys(errors).length

   useEffect(() => {
      const handleRememberMe = async () => {
         const isRemember = getLs(process.env.NEXT_PUBLIC_REMEMBER_COOKIE_KEY as string)
         if (isRemember) setValue('rememberMe', isRemember)

         const token = getCookie(process.env.NEXT_PUBLIC_REMEMBER_COOKIE_KEY as string)
         if (token && isRemember) {
            try {
               const values = await verifyJwt(token as string)
               if (values && values.email) {
                  setValue('email', values.email as string)
                  setValue('password', values.password as string)
               }
            } catch (err) {
               console.error('Error verifying JWT:', err)
            }
         }
      }

      handleRememberMe()
   }, [setValue])

   useEffect(() => {
      if (session?.user) {
         ;(async () => {
            try {
               await pLoginGoogleUser({
                  email: session.user?.email as string,
                  fullName: session.user?.name as string,
                  username: generateUsername(session.user?.name as string),
                  avatar: session.user?.image as string,
               })

               router.push('/account')
               success('Đăng nhập tài khoản thành công')
            } catch (err) {
               console.error('Error logging in with Google:', err)
               error('Đăng nhập thất bại')
            }
         })()
      }
   }, [session])

   const handleLogin = async (values: ILoginForm) => {
      try {
         const { email, password, rememberMe } = values
         setLs(process.env.NEXT_PUBLIC_REMEMBER_COOKIE_KEY as string, rememberMe)

         if (values.rememberMe) {
            const token = await signJwt({
               email,
               password,
            })
            setCookie(process.env.NEXT_PUBLIC_REMEMBER_COOKIE_KEY as string, token, {
               expires: new Date(
                  Date.now() + Number(process.env.NEXT_PUBLIC_ONE_MONTH_NUM)
               ),
            })
         }
         await pLoginUser({
            email,
            password,
         })
         router.push('/account')
         success('Đăng nhập tài khoản thành công')
      } catch (err) {
         error((err as Error).message as string)
      }
   }

   const signInGoogle = () => {
      signIn('google')
   }

   return (
      <div className="w-auth bg-white m-auto px-[107px] py-10 rounded">
         <h3 className="heading-4 uppercase !font-semibold">
            <span className="text-primary">Đăng</span>{' '}
            <span className="text-secondary">nhập</span>
         </h3>
         <div className="mt-6">
            <button
               className="btn w-full border border-gray-200 gap-2 !bg-transparent hover:!bg-gray-50"
               onClick={signInGoogle}
            >
               <FcGoogle className="w-6 h-6" />{' '}
               <span className="text-sm font-medium text-sapo">Đăng nhập với Google</span>
            </button>
         </div>
         <div className="relative mt-6 mb-4 before:content-[''] before:absolute before:w-full before:h-[1px] before:bg-gray-border before:top-1/2 w-full flex justify-center pt-4 pb-4">
            <span className="inline-block text-sapo p-2 bg-white text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
               Hoặc đăng ký bằng email
            </span>
         </div>
         <form onSubmit={handleSubmit(handleLogin)}>
            <div className="pb-4">
               <InputField<ILoginForm>
                  control={control}
                  name="email"
                  label="Email"
                  required
                  placeholder="nguyenvana@gmail.com"
               />
               <PasswordField<ILoginForm>
                  control={control}
                  name="password"
                  label="Mật khẩu"
                  required
                  isTrigger
                  trigger={trigger}
               />
               <p className="flex justify-end">
                  <Link
                     href={'/forgot-password'}
                     className="text-sm text-secondary font-medium hover:underline hover:text-secondary-dark"
                     scroll
                  >
                     Quên mật khẩu?
                  </Link>
               </p>
               <CheckBoxField<ILoginForm>
                  control={control}
                  name={'rememberMe'}
                  label={'Nhớ tôi'}
               />
            </div>
            <Button
               type="submit"
               className="text-lg w-full font-semibold !bg-secondary hover:!bg-secondary-dark"
               disabled={isSubmitting || (!isValid && err)}
               disabledClassName={'disabled-btn-submit'}
               title={'Đăng nhập'}
               loadingClassName="!w-7 !h-7"
               isLoading={isSubmitting}
            />
            <p className="pt-4 text-center text-gray-light">
               Bạn chưa có tài khoản?{' '}
               <Link
                  href={'/signup'}
                  className={`text-secondary hover:underline hover:text-secondary-dark font-medium ${
                     isSubmitting ? 'pointer-events-none' : ''
                  }`}
                  scroll
               >
                  Đăng ký
               </Link>
            </p>
         </form>
      </div>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pLoginUser: (data: ILogin) => dispatch(loginUser(data)),
      pLoginGoogleUser: (data: ILoginGoogle) => dispatch(loginGoogleUser(data)),
   }
}

export default connect(null, mapDispatchToProps)(LoginAuth)
