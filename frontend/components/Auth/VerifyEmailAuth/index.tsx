'use client'

import { authApi } from '@/api'
import { LoadingSpinner } from '@/components/common/Loading'
import { useToastify } from '@/hooks'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface IVerifyEmailAuthProps {}

export function VerifyEmailAuth(props: IVerifyEmailAuthProps) {
   const params = useParams()
   const [loading, setLoading] = useState<boolean>(true)
   const { error, success } = useToastify()

   useEffect(() => {
      const verifyAccount = async () => {
         console.log(params)
         try {
            if (params?.token) {
               setLoading(true)
               await authApi.verifyAccount(params.token[0] as string)
               success('Xác nhận tài khoản của bạn thành công')
            }
         } catch (err) {
            error('Xác nhận tài khoản của bạn không thành công')
         }

         setLoading(false)
      }
      verifyAccount()
   }, [])

   if (loading)
      return (
         <div>
            <LoadingSpinner message={'Đang xác nhận tài khoản của bạn...'} />
         </div>
      )

   return (
      <div className="w-auth bg-white rounded p-10 m-auto duration-common">
         <div className="w-full h-96 relative">
            <Image
               src={'/verify-account.svg'}
               alt="verify-account"
               fill
               className="w-full h-full object-cover"
            />
         </div>
      </div>
   )
}
