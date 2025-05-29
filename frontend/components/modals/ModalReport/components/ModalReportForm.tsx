'use client'

import { reportApi } from '@/api'
import { Button } from '@/components/buttons'
import { InputField, RadioField } from '@/components/form-fields'
import { reports } from '@/data'
import { ReportType } from '@/enums'
import { useToastify } from '@/hooks'
import { IReportForm, IReportType } from '@/models'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

export interface IModalReportFormProps {
   className?: string
   onClose: () => void
   onSendReport: (values: IReportForm) => Promise<void>
}

const schema = yup.object().shape({
   type: yup
      .string()
      .oneOf(Object.values(ReportType))
      .required('Vui lòng chọn kiểu vi phạm của bình luận'),
   content: yup.string().required('Nội dung vi phạm đang trống'),
})

export function ModalReportForm({
   className = '',
   onClose,
   onSendReport,
}: IModalReportFormProps) {
   const { error, success } = useToastify()
   const {
      control,
      formState: { isSubmitting },
      handleSubmit,
   } = useForm<IReportForm>({
      defaultValues: {
         type: ReportType.OTHER,
         content: '',
      },
      resolver: yupResolver(schema),
   })

   const handleSendReport = async (values: IReportForm) => {
      try {
         await onSendReport(values)
         success('Báo cáo vi phạm bình luận thành công')
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <form className={`mt-4 ${className}`} onSubmit={handleSubmit(handleSendReport)}>
         <div>
            <RadioField<IReportForm>
               control={control}
               name="type"
               radios={reports}
               defaultValue={ReportType.OTHER}
               className="py-0.5"
            />
            <InputField<IReportForm>
               name="content"
               control={control}
               required
               label=""
               placeholder={'Nhập nội dung vi phạm'}
               className="py-0.5"
               multiline
               disabled={isSubmitting}
               rows={4}
               noResize
            />
         </div>
         <div className="grid grid-cols-2 gap-2 mt-5">
            <Button
               type="button"
               className="btn-cancel !py-3"
               onClick={onClose}
               disabled={isSubmitting}
               title={'Hủy'}
            />
            <Button
               type="submit"
               className="uppercase font-semibold !py-3"
               disabled={isSubmitting}
               title={'Gửi báo cáo'}
               isLoading={isSubmitting}
               disabledClassName="disabled-btn-submit"
            />
         </div>
      </form>
   )
}
