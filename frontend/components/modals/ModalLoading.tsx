import { LoadingSpinner } from '@/components/common/Loading'
import { TypeMessageLoading } from '@/enums'
import { ITypeMessageLoading } from '@/models'
import { Modal } from '.'

export interface IModalLoadingProps {
   isLoading: boolean
   typeMessageLoading: ITypeMessageLoading
}

export function ModalLoading({ isLoading, typeMessageLoading }: IModalLoadingProps) {
   const getMessageLoading = () => {
      let message = 'Đang tải'
      switch (typeMessageLoading) {
         case TypeMessageLoading.UPDATE: {
            message = 'Đang cập nhật...'
            break
         }
         default: {
            message = 'Đang tải...'
         }
      }
      return message
   }

   return (
      <Modal isShowModal={isLoading}>
         <div className="w-72 rounded bg-white d-flex px-10 py-14">
            <LoadingSpinner message={getMessageLoading()} />
         </div>
      </Modal>
   )
}
