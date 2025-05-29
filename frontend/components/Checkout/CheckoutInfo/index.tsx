'use client'

import { CheckoutForm } from '@/components/Checkout/CheckoutInfo/components'
import { InputField, RadioField, SelectField } from '@/components/form-fields'
import { checkoutDefaultVals, radioPayments, radioShipping } from '@/data'
import { ICommonObject, IOrderForm } from '@/models'
import { AppState } from '@/store'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Control, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form'
import { connect } from 'react-redux'

export type ICheckoutInfoProps = {
   control: Control<any>
   watch: UseFormWatch<any>
   setValue: UseFormSetValue<any>
   isSubmitting: boolean
   trigger: UseFormTrigger<any>
   className?: string
   pProvinces: ICommonObject[]
   pDistricts: ICommonObject[]
   pWards: ICommonObject[]
}

function CheckoutInfo({
   control,
   watch,
   setValue,
   isSubmitting,
   trigger,
   pProvinces,
   pDistricts,
   pWards,
   className = '',
}: ICheckoutInfoProps) {
   const [districts, setDistricts] = useState<ICommonObject[]>([])
   const [wards, setWards] = useState<ICommonObject[]>([])

   const province = watch('address.province')
   const district = watch('address.district')

   useEffect(() => {
      const getNewDistricts = async () => {
         try {
            if (province) {
               const code = JSON.parse(province as string).code
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
      <div className={`${className}`}>
         <CheckoutForm title={'Thông tin giao hàng'} className="bg-white">
            <div>
               <InputField<IOrderForm>
                  control={control}
                  name="fullName"
                  label={'Họ và tên'}
                  required
                  placeholder={'Nguyễn Văn An'}
                  disabled
               />
               <InputField<IOrderForm>
                  control={control}
                  name="emailAddress"
                  label={'Email'}
                  required
                  placeholder={'nguyenvanan@gmail.com'}
                  disabled
               />
               <InputField<IOrderForm>
                  control={control}
                  name="phoneNumber"
                  label={'Số điện thoại'}
                  required
                  placeholder={'********00'}
                  disabled
               />
               <div className="flex flex-col">
                  <SelectField<IOrderForm>
                     control={control}
                     name="address.province"
                     label="Tỉnh/Thành phố"
                     placeholder="--Chọn tỉnh/thành phố--"
                     options={pProvinces}
                     disabled={isSubmitting}
                     initValue
                     required
                  />
                  <SelectField<IOrderForm>
                     control={control}
                     name="address.district"
                     label="Quận/Huyện"
                     placeholder="--Chọn quận/huyện--"
                     options={districts}
                     disabled={isSubmitting || !province}
                     initValue
                     required
                  />
                  <SelectField<IOrderForm>
                     control={control}
                     name="address.ward"
                     label="Xã/Phường"
                     placeholder="--Chọn xã/phường--"
                     options={wards}
                     disabled={isSubmitting || !district}
                     initValue
                     required
                  />
                  <InputField<IOrderForm>
                     control={control}
                     name="address.street"
                     label="Số đường"
                     placeholder="448 Lê Văn Việt"
                     disabled={isSubmitting}
                  />
               </div>
               <InputField<IOrderForm>
                  control={control}
                  name="noteAddress"
                  label="Địa chỉ cụ thể"
                  placeholder="Ghi chú (tùy chọn)"
                  multiline
                  disabled={isSubmitting}
                  rows={6}
                  noResize
               />
            </div>
         </CheckoutForm>
         <CheckoutForm title={'Hình thức thanh toán'} className="my-4 bg-white">
            <RadioField
               control={control}
               name="paymentMethod"
               radios={radioPayments}
               defaultValue={checkoutDefaultVals.paymentMethod}
               trigger={trigger}
            />
         </CheckoutForm>
         <CheckoutForm title={'Hình thức giao hàng'} className="my-4 bg-white">
            <RadioField
               control={control}
               name="shippingMethod"
               radios={radioShipping}
               defaultValue={checkoutDefaultVals.shippingMethod}
               trigger={trigger}
            />
         </CheckoutForm>
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

export default connect(mapStateToProps, null)(CheckoutInfo)
