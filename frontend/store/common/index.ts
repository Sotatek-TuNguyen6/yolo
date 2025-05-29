import { createSlice } from '@reduxjs/toolkit'
import { reducers } from '@/store/common/reducers'
import { ICommonObject, ITypeMessageLoading, ITypeModalDelete } from '@/models'
import { TypeMessageLoading } from '@/enums'

export interface IModalDelete {
   id: string
   rootId?: string | null
   title: string
   type?: ITypeModalDelete
   idCart?: string
}

export interface IModalLoading {
   isShowModal: boolean
   typeMessage: ITypeMessageLoading
}

export interface IModalReport {
   commentId: string | null
   isShowModal: boolean
}

export interface ICommonStore {
   isShowModalLogout: boolean
   isShowModalDelete: boolean
   isShowModalNotificationLogin: boolean
   isShowModalReport: boolean
   modalDeleteInfo: IModalDelete
   modalLoading: IModalLoading
   modalCommentIdReport: string | null
   provinces: ICommonObject[]
   districts: ICommonObject[]
   wards: ICommonObject[]
}

const initialState: ICommonStore = {
   isShowModalLogout: false,
   isShowModalDelete: false,
   isShowModalNotificationLogin: false,
   isShowModalReport: false,
   modalCommentIdReport: null,
   modalDeleteInfo: {
      id: '',
      title: '',
   },
   modalLoading: {
      isShowModal: false,
      typeMessage: TypeMessageLoading.LOADING,
   },
   provinces: [],
   districts: [],
   wards: [],
}

const commonSlice = createSlice({
   name: 'common',
   initialState,
   reducers,
})

export const {
   showModalLogout,
   showModalDelete,
   setModalDeleteInfo,
   setShowModalNotificationLogin,
   resetModalLoading,
   showModalLoading,
   showModalReport,
   resetModalReport,
   setAddress,
} = commonSlice.actions
export default commonSlice.reducer
