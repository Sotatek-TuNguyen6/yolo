'use client'

import { ModalReportForm } from '@/components/modals/ModalReport/components'
import { Modal } from '..'
import { connect } from 'react-redux'
import { AppDispatch, AppState } from '@/store'
import { IModalReport, resetModalReport } from '@/store/common'
import { reportApi } from '@/api'
import { IReportForm, IUser } from '@/models'

export interface IModalReportProps {
   pUser: IUser | null
   pShowModalReport: boolean
   pCommentIdReport: string
   pResetModalReport: () => void
}

function ModalReport({
   pUser,
   pShowModalReport,
   pResetModalReport,
   pCommentIdReport,
}: IModalReportProps) {
   const handleClose = () => {
      pResetModalReport()
   }

   const handleSendReport = async (values: IReportForm) => {
      try {
         if (pUser?._id) {
            await reportApi.createReport({
               ...values,
               user: pUser._id,
               comment: pCommentIdReport,
            })
            handleClose()
         }
      } catch (error) {
         throw new Error(error as string)
      }
   }

   return (
      <Modal isShowModal={pShowModalReport}>
         <div className="bg-white w-[550px] px-10 pt-6 pb-8 rounded d-flex flex-col">
            <h1 className="mt-6 text-2xl text-gray-darker font-semibold">
               Báo cáo vi phạm
            </h1>
            <p className="text-center mt-2 text-sapo">
               Nội dung bình luận có khả năng mang tính chất vi phạm của website chúng tôi
            </p>
            <ModalReportForm onClose={handleClose} onSendReport={handleSendReport} />
         </div>
      </Modal>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
      pShowModalReport: state.common.isShowModalReport,
      pCommentIdReport: state.common.modalCommentIdReport,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pResetModalReport: () => dispatch(resetModalReport()),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalReport)
