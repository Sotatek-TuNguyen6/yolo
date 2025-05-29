import { useToastify } from '@/hooks'
import { IComment, ITypeModalDelete } from '@/models'
import { AppDispatch } from '@/store'
import { IModalDelete, setModalDeleteInfo, showModalDelete } from '@/store/common'
import { Dispatch, SetStateAction, useState } from 'react'
import { BiSolidEditAlt } from 'react-icons/bi'
import { BsThreeDots } from 'react-icons/bs'
import { MdDelete } from 'react-icons/md'
import { connect } from 'react-redux'

export interface ICommentActionProps {
   comment: IComment
   typeComment: ITypeModalDelete
   setEdit: Dispatch<SetStateAction<boolean>>
   pShowModalDelete: () => void
   pSetModalDeleteInfo: (data: IModalDelete) => void
}

function CommentAction({
   comment,
   typeComment,
   setEdit,
   pShowModalDelete,
   pSetModalDeleteInfo,
}: ICommentActionProps) {
   const [isShowAction, setIsShowAction] = useState<boolean>(false)
   const { error } = useToastify()

   const handleCloseAction = () => {
      setIsShowAction(false)
   }

   const handleShowAction = () => {
      setIsShowAction((prev) => !prev)
   }

   const handleShowModalDelete = async () => {
      try {
         pShowModalDelete()
         const data: IModalDelete = {
            id: comment._id,
            rootId: comment.commentRoot,
            title: `Bạn có chắc muốn xóa bình luận này không?`,
            type: typeComment,
         }
         pSetModalDeleteInfo(data)
         handleCloseAction()
      } catch (err) {
         error((err as Error).message)
      }
   }

   const handleEditClick = () => {
      setEdit(true)
   }

   return (
      <div className="absolute inline-block right-4 top-4 cursor-pointer">
         <div className="inline-block" onClick={handleShowAction}>
            <BsThreeDots className="w-5 h-5 text-gray-dark" />
         </div>
         <div className="relative">
            <ul
               className={`absolute left-1/2 -translate-x-1/2 shadow-default rounded bg-white w-[135px] ${
                  isShowAction
                     ? 'top-0.5 opacity-100 pointer-events-auto'
                     : 'top-2 opacity-0 pointer-events-none'
               } duration-common`}
            >
               <li
                  className="d-flex !justify-start text-sm px-4 py-2.5 text-gray-darker border-b border-gray-light-border"
                  onClick={handleEditClick}
               >
                  <BiSolidEditAlt className="w-5 h-5 text-green-600 mr-2" />{' '}
                  <span className="font-semibold">Chỉnh sửa</span>
               </li>
               <li
                  className="d-flex !justify-start text-sm px-4 py-2.5 text-gray-darker"
                  onClick={handleShowModalDelete}
               >
                  <MdDelete className="w-5 h-5 text-red-600 mr-2" />{' '}
                  <span className="font-semibold">Xóa</span>
               </li>
            </ul>
         </div>
      </div>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pShowModalDelete: () => dispatch(showModalDelete(true)),
      pSetModalDeleteInfo: (data: IModalDelete) => dispatch(setModalDeleteInfo(data)),
   }
}

export default connect(null, mapDispatchToProps)(CommentAction)
