'use client'

import { authApi } from '@/api'
import { Button } from '@/components/buttons'
import {
   DatePickerField,
   InputField,
   PasswordField,
   SelectField,
} from '@/components/form-fields'
import { SIXTEEN_AGE } from '@/constants'
import { genderSelects, signUpVals } from '@/data'
import { Gender } from '@/enums'
import { useToastify } from '@/hooks'
import { ICommonObject, IGender, ISignUp, ISignUpForm } from '@/models'
import { AppState } from '@/store'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { connect } from 'react-redux'
import * as yup from 'yup'

const schema = yup.object().shape({
   email: yup
      .string()
      .required('Vui lòng nhập email')
      .email('Email của bạn không hợp lệ'),
   fullName: yup
      .string()
      .required('Vui lòng nhập họ và tên')
      .test('two-words', 'Họ và tên ít nhất 2 từ trở lên', (val) => {
         return val.split(' ').filter((x) => !!x && x.length > 1).length > 1
      }),
   userName: yup
      .string()
      .required('Vui lòng nhập tên tài khoản')
      .test('three-characters', 'Tên tài khoản ít nhất 3 ký tự trở lên', (val) => {
         return val.length > 2
      }),
   gender: yup
      .mixed<IGender>()
      .required('Vui lòng chọn giới tính')
      .oneOf(
         Object.values(Gender),
         'Giới tính bạn chọn không đúng. Giới tính bao gồm: nam, nữ, khác'
      ),
   dateOfBirth: yup
      .mixed<{
         startDate: Date | string
         endDate: Date | string
      }>()
      .test('required-date', 'Vui lòng chọn ngày sinh', (val: any) => {
         return val?.startDate || val?.endDate
      })
      .test('greater-than-16', 'Bạn chưa đủ 16 tuổi để đăng ký tài khoản', (val: any) => {
         return Date.now() - new Date(val.startDate).getTime() >= SIXTEEN_AGE
      }),
   phoneNumber: yup
      .string()
      .required('Vui lòng nhập số điện thoại')
      .matches(
         /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
         'Số điện thoại không đúng'
      )
      .min(10, 'Số điện thoại phải ít nhất 10 số hoặc tối đa 10 số')
      .max(10, 'Số điện thoại phải ít nhất 10 số hoặc tối đa 10 số'),
   address: yup.object().shape({
      street: yup.string(),
      ward: yup.string().required('Vui lòng chọn tên xã / phường'),
      district: yup.string().required('Vui lòng chọn tên huyện / quận'),
      province: yup.string().required('Vui lòng chọn tên tỉnh / thành phố'),
   }),
   password: yup
      .string()
      .required('Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu phải ít nhất 8 kí tự'),
   confirmPassword: yup
      .string()
      .required('Vui lòng xác nhận mật khẩu')
      .oneOf([yup.ref<string>('password')], 'Mật khẩu không khớp'),
})

export interface ISignUpAuthProps {
   pProvinces: ICommonObject[]
   pDistricts: ICommonObject[]
   pWards: ICommonObject[]
}

function SignUpAuth({ pProvinces, pDistricts, pWards }: ISignUpAuthProps) {
   const [districts, setDistricts] = useState<ICommonObject[]>([])
   const [wards, setWards] = useState<ICommonObject[]>([])
   const { success, error } = useToastify()

   const {
      control,
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { isSubmitting, isDirty, isValid },
      getValues,
   } = useForm<ISignUpForm>({
      defaultValues: signUpVals,
      resolver: yupResolver(schema) as any,
   })

   const handleSignUp = async (values: ISignUpForm) => {
      try {
         const newUserVal: ISignUp = {
            ...values,
            dateOfBirth: values.dateOfBirth.endDate as Date,
            address: {
               ...values.address,
               ward: JSON.parse(values.address.ward as string),
               district: JSON.parse(values.address.district as string),
               province: JSON.parse(values.address.province as string),
            },
         }

         await authApi.signUp(newUserVal)
         reset()
         success('Đăng ký tài khoản thành công. Vui lòng kiểm tra email của bạn')
      } catch (err) {
         error('Đăng ký tài khoản thất bại. Vui lòng kiểm tra lại thông tin')
      }
   }

   const province = watch('address.province')
   const district = watch('address.district')

   useEffect(() => {
      const getNewDistricts = async () => {
         try {
            if (province) {
               const code = JSON.parse(province as string).code
               setValue('address.ward', '')
               const newDistricts = await axios
                  .get(`${process.env.NEXT_PUBLIC_PROVINCE_API}/p/${code}?depth=2`)
                  .then((data) => data.data)
               setDistricts(newDistricts.districts)
            } else {
               setDistricts(pDistricts)
            }
         } catch (error) {
            throw new Error(error as string)
         }
      }

      getNewDistricts()
   }, [province, setValue])

   useEffect(() => {
      const getNewWards = async () => {
         try {
            if (district) {
               const code = JSON.parse(district as string).code
               const newWards = await axios
                  .get(`${process.env.NEXT_PUBLIC_PROVINCE_API}/d/${code}?depth=2`)
                  .then((data) => data.data)
               setWards(newWards.wards)
            } else {
               setWards(pWards)
            }
         } catch (error) {
            throw new Error(error as string)
         }
      }

      getNewWards()
   }, [district])

   return (
      <div className="w-auth m-auto bg-white px-[107px] py-10 rounded">
         <h3 className="heading-4 uppercase mb-2">
            <span className="text-primary">Đăng</span>{' '}
            <span className="text-secondary">ký</span>
         </h3>
         <form onSubmit={handleSubmit(handleSignUp)} className="mt-4">
            <div className="pb-4">
               <InputField<ISignUpForm>
                  control={control}
                  name="userName"
                  label="Tên tài khoản"
                  required
                  placeholder="annguyen01"
                  disabled={isSubmitting}
               />
               <InputField<ISignUpForm>
                  control={control}
                  name="fullName"
                  label="Họ và tên"
                  required
                  placeholder="Nguyễn Văn An"
                  disabled={isSubmitting}
               />
               <InputField<ISignUpForm>
                  control={control}
                  name="email"
                  label="Email"
                  required
                  placeholder="nguyenvanan@gmail.com"
                  disabled={isSubmitting}
               />
               <InputField<ISignUpForm>
                  control={control}
                  name="phoneNumber"
                  label="Số điện thoại"
                  required
                  placeholder="(+84) 123-456-7890"
                  disabled={isSubmitting}
               />
               <DatePickerField<ISignUpForm>
                  control={control}
                  name="dateOfBirth"
                  label="Ngày sinh"
                  required
                  placeholder="Chọn ngày sinh"
                  disabled={isSubmitting}
               />
               <div className="flex flex-col">
                  <SelectField<ISignUpForm>
                     control={control}
                     name="address.province"
                     label="Tỉnh/Thành phố"
                     placeholder="--Chọn tỉnh/thành phố--"
                     options={pProvinces}
                     initValue
                     required
                     disabled={isSubmitting}
                  />
                  <SelectField<ISignUpForm>
                     control={control}
                     name="address.district"
                     label="Quận/Huyện"
                     placeholder="--Chọn quận/huyện--"
                     options={districts}
                     initValue
                     required
                     disabled={isSubmitting || !getValues('address.province')}
                  />
                  <SelectField<ISignUpForm>
                     control={control}
                     name="address.ward"
                     label="Xã/Phường"
                     placeholder="--Chọn xã/phường--"
                     options={wards}
                     initValue
                     required
                     disabled={isSubmitting || !getValues('address.district')}
                  />
                  <InputField<ISignUpForm>
                     control={control}
                     name="address.street"
                     label="Số đường"
                     placeholder="448 Lê Văn Việt"
                     disabled={isSubmitting}
                  />
               </div>
               <SelectField<ISignUpForm>
                  control={control}
                  name="gender"
                  label={'Giới tính'}
                  required
                  options={genderSelects}
                  initValue
                  placeholder="--Chọn giới tính--"
                  disabled={isSubmitting}
               />
               <PasswordField<ISignUpForm>
                  control={control}
                  name="password"
                  label="Mật khẩu"
                  required
                  disabled={isSubmitting}
               />
               <PasswordField<ISignUpForm>
                  control={control}
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  required
                  disabled={isSubmitting}
               />
            </div>
            <Button
               type="submit"
               className="w-full font-semibold !bg-secondary hover:!bg-secondary-dark text-lg"
               // disabled={isSubmitting  || !isValid}
               title={'Đăng ký'}
               disabledClassName="disabled-btn-submit"
               isLoading={isSubmitting}
            />
            <p className="pt-4 text-center">
               Đã có tài khoản?{' '}
               <Link
                  href={'/login'}
                  className={`text-secondary hover:underline hover:text-secondary-dark font-medium ${
                     isSubmitting ? 'pointer-events-none' : ''
                  }`}
                  scroll
               >
                  Đăng nhập ngay!
               </Link>
            </p>
         </form>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pProvinces: state.common.provinces,
      pDistricts: state.common.districts,
      pWards: state.common.wards,
   }
}

export default connect(mapStateToProps, null)(SignUpAuth)
