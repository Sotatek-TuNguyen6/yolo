'use client'

import { Modal } from '.'
import { CloseIcon } from '@/components/icons'
import { CheckBoxField, InputField, SelectField } from '@/components/form-fields'
import { useForm } from 'react-hook-form'
import { addressVals } from '@/data'
import { ICommonObject, IAddress, IAddressData, IAddressForm } from '@/models'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import axios from 'axios'
import { useToastify } from '@/hooks'
import { addressApi } from '@/api'
import { Button } from '@/components/buttons'
import { addAddress, updateAddress } from '@/store/user'
import { connect } from 'react-redux'
import { AppDispatch, AppState } from '@/store'

export interface IModalAddressFormProps {
   initVals: IAddressData
   isShow: boolean
   setShow: Dispatch<SetStateAction<boolean>>
   userId: string
   resetInitVals: () => void
   pAddAddress: (addresses: IAddress[]) => void
   pUpdateAddresses: (address: IAddress[]) => void
   pProvinces: ICommonObject[]
   pDistricts: ICommonObject[]
   pWards: ICommonObject[]
}

function ModalAddressForm({
   isShow,
   setShow,
   initVals,
   userId,
   resetInitVals,
   pAddAddress,
   pUpdateAddresses,
   pProvinces,
   pDistricts,
   pWards,
}: IModalAddressFormProps) {
   const [provinces, setProvinces] = useState<ICommonObject[]>([])
   const [districts, setDistricts] = useState<ICommonObject[]>([])
   const [wards, setWards] = useState<ICommonObject[]>([])
   const { success, error } = useToastify()

   const {
      control,
      setValue,
      watch,
      handleSubmit,
      reset,
      getValues,
      formState: { isSubmitting },
   } = useForm<IAddressForm>({
      defaultValues: addressVals,
   })

   useEffect(() => {
      reset()
      setValue('fullName', initVals?.fullName || '')
      setValue('phoneNumber', initVals?.phoneNumber || '')
      setValue('isDefault', initVals?.isDefault || false)
      setValue('street', initVals?.street || '')
      setValue('ward', initVals?.ward ? JSON.stringify(initVals?.ward) : '')
      setValue('district', initVals?.district ? JSON.stringify(initVals?.district) : '')
      setValue('province', initVals?.province ? JSON.stringify(initVals?.province) : '')
   }, [initVals, setValue, reset])

   const province = watch('province')
   const district = watch('district')
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
   }, [district, initVals])

   const handleClose = () => {
      setShow(false)
      resetInitVals()
   }

   const handleCreateAddress = async (values: IAddressData) => {
      // khong cho load trang khi submit

      try {
         const res = await addressApi.createAddress(values)
         console.log('res', res)
         pAddAddress(res.data.addresses)
         success(res.data.message)
      } catch (error) {
         console.log('error', error)
         throw new Error(error as string)
      }
   }

   const handleUpdateAddress = async (values: IAddressData) => {
      try {
         const res = await addressApi.updateAddressForUser(values.user, values)
         pUpdateAddresses(res.data.addresses)
         success(res.data.message)
      } catch (error) {
         throw new Error(error as string)
      }
   }

   const handleAddressSubmit = async (values: IAddressForm) => {
      try {
         const newValues: IAddressData = {
            ...values,
            user: userId,
            ward: JSON.parse(values.ward as string),
            district: JSON.parse(values.district as string),
            province: JSON.parse(values.province as string),
         }

         if (initVals?.id) {
            await handleUpdateAddress({ ...newValues, id: initVals.id, _id: initVals.id })
         } else {
            await handleCreateAddress(newValues)
         }
         reset()
         handleClose()
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <Modal isShowModal={isShow}>
         <div className="max-w-[710px] w-full bg-white rounded">
            <div className="px-8 py-3 flex justify-between items-center border-b border-gray-border">
               <h4 className="font-semibold text-sapo">Thêm địa chỉ mới</h4>
               <div className="inline-block cursor-pointer" onClick={handleClose}>
                  <CloseIcon className="!w-5 !h-5" />
               </div>
            </div>
            <div className="px-8 pt-3 pb-8">
               <form onSubmit={handleSubmit(handleAddressSubmit)}>
                  <div className="mb-6">
                     <div className="grid grid-cols-2 gap-4 items-center">
                        <InputField<IAddressForm>
                           control={control}
                           name="fullName"
                           label="Họ và tên"
                           required
                           placeholder="Nguyễn Văn An"
                           disabled={isSubmitting}
                        />
                        <InputField<IAddressForm>
                           control={control}
                           name="phoneNumber"
                           label="Số điện thoại"
                           required
                           placeholder={'(+84) 123-456-7890'}
                           disabled={isSubmitting}
                        />
                     </div>
                     <InputField<IAddressForm>
                        control={control}
                        name="street"
                        label="Tên đường"
                        placeholder="423 Lê Văn Việt"
                        disabled={isSubmitting}
                     />
                     <div className="grid grid-cols-3 gap-4 mb-3">
                        <SelectField<IAddressForm>
                           control={control}
                           name="province"
                           label="Tỉnh/Thành phố"
                           placeholder="--Chọn tỉnh/thành phố--"
                           options={pProvinces}
                           initValue
                           required
                           disabled={isSubmitting}
                        />
                        <SelectField<IAddressForm>
                           control={control}
                           name="district"
                           label="Quận/Huyện"
                           placeholder="--Chọn quận/huyện--"
                           options={districts}
                           initValue
                           required
                           disabled={isSubmitting || !getValues('province')}
                        />
                        <SelectField<IAddressForm>
                           control={control}
                           name="ward"
                           label="Xã/Phường"
                           placeholder="--Chọn xã/phường--"
                           options={wards}
                           initValue
                           required
                           disabled={isSubmitting || !getValues('district')}
                        />
                     </div>
                     <CheckBoxField<IAddressForm>
                        control={control}
                        name="isDefault"
                        label="Đặt làm địa chỉ mặc định?"
                        disabled={isSubmitting}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <Button
                        type="button"
                        className="uppercase font-semibold btn-cancel !py-3"
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

const mapStateToProps = (state: AppState) => {
   return {
      pProvinces: state.common.provinces,
      pDistricts: state.common.districts,
      pWards: state.common.wards,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pAddAddress: (addresses: IAddress[]) => dispatch(addAddress(addresses)),
      pUpdateAddresses: (addresses: IAddress[]) => dispatch(updateAddress(addresses)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalAddressForm)
