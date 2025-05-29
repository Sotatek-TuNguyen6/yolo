import { TypeMessageLoading } from '@/enums'
import { IAddressStoreRes, ITypeMessageLoading } from '@/models'
import { PayloadAction } from '@reduxjs/toolkit'
import { ICommonStore, IModalDelete } from '.'

export const reducers = {
   showModalLogout(state: ICommonStore, action: PayloadAction<boolean>) {
      state.isShowModalLogout = action.payload
   },
   showModalDelete(state: ICommonStore, action: PayloadAction<boolean>) {
      state.isShowModalDelete = action.payload
   },
   setShowModalNotificationLogin(state: ICommonStore, action: PayloadAction<boolean>) {
      state.isShowModalNotificationLogin = action.payload
   },
   setModalDeleteInfo(state: ICommonStore, action: PayloadAction<IModalDelete>) {
      state.modalDeleteInfo = action.payload
   },
   resetModalLoading(state: ICommonStore) {
      state.modalLoading.isShowModal = false
      state.modalLoading.typeMessage = TypeMessageLoading.LOADING
   },
   showModalLoading(state: ICommonStore, action: PayloadAction<ITypeMessageLoading>) {
      state.modalLoading.isShowModal = true
      state.modalLoading.typeMessage = action.payload
   },
   showModalReport(state: ICommonStore, action: PayloadAction<string>) {
      state.isShowModalReport = true
      state.modalCommentIdReport = action.payload
   },
   resetModalReport(state: ICommonStore) {
      state.isShowModalReport = false
      state.modalCommentIdReport = null
   },
   setAddress(state: ICommonStore, action: PayloadAction<IAddressStoreRes>) {
      state.provinces = action.payload.provinces
      state.districts = action.payload.districts
      state.wards = action.payload.wards
   },
}
