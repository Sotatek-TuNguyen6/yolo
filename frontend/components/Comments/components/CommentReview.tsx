import { CommentFormModal } from '@/components/Comments/components'
import { ALL } from '@/constants'
import { ratings } from '@/data'
import { useToastify } from '@/hooks'
import { IComment, ICommentData, ICommonObject, IFilterRating, IProduct } from '@/models'
import { AppDispatch } from '@/store'
import { createComment } from '@/store/comment/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import { useMemo, useState } from 'react'
import { AiFillStar } from 'react-icons/ai'
import { connect } from 'react-redux'

export interface ICommentReviewProps {
   product: IProduct
   comments: IComment[]
   onCommentsChange: (rating: IFilterRating) => void
   pCreateComment: (data: ICommentData) => Promise<PayloadAction<unknown>>
}

export interface ICommentFiltersProps {
   ratingList: ICommonObject[]
   filterRating: IFilterRating
   onRatingChange: (rating: IFilterRating) => void
}
export function CommentFilters({
   filterRating,
   ratingList,
   onRatingChange,
}: ICommentFiltersProps) {
   return (
      <ul className="flex gap-2.5 flex-wrap">
         {ratingList.map((rating) => (
            <li
               key={rating.value as string}
               className={`rounded w-[90px] d-flex p-2.5 border text-sm bg-white font-medium cursor-pointer ${
                  rating.value === filterRating
                     ? 'text-primary border-primary'
                     : 'text-description border-gray-secondary-border'
               }`}
               onClick={() => onRatingChange(rating.value as IFilterRating)}
            >
               <span>{rating.name as string}</span>
            </li>
         ))}
      </ul>
   )
}

function CommentReview({
   product,
   comments,
   onCommentsChange,
   pCreateComment,
}: ICommentReviewProps) {
   const [isShowModal, setIsShowModal] = useState<boolean>(false)
   const { error, success } = useToastify()
   const [filterRating, setFilterRating] = useState<IFilterRating>(ALL)

   const filterRatingList = useMemo(() => {
      return ratings.map((rating) => {
         if (rating.value === ALL) {
            return {
               ...rating,
               name: `${rating.name} (${comments.length})`,
            }
         }
         const sumRatingValue = comments.filter((x) => x.rating === rating.value).length
         return {
            ...rating,
            name: `${rating.name} (${sumRatingValue})`,
         }
      })
   }, [ratings, comments])

   const averageRatingComments = useMemo(() => {
      if (comments.length === 0) return 0
      const sumRatings = comments.reduce((sum: number, comment: IComment) => {
         return sum + comment.rating
      }, 0)
      return Math.floor(sumRatings / comments.length)
   }, [comments])

   const handleFilterRatingChange = (rating: IFilterRating) => {
      onCommentsChange(rating)
      setFilterRating(rating)
   }

   const handleShowModal = () => {
      setIsShowModal(true)
   }

   const handleAddComment = async (values: ICommentData) => {
      try {
         await pCreateComment(values)
         success('Bình luận thành công')
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <div className="bg-gray-light-border rounded py-7 px-2.5 border-2 border-gray-secondary-border">
         <div className="grid grid-cols-[1fr_2fr]">
            <div className="flex flex-col justify-center px-2.5">
               <h5 className="text-xl font-semibold text-center text-primary-light">
                  {averageRatingComments}/5
               </h5>
               <ul className="flex justify-center mt-2">
                  {Array.from(new Array(averageRatingComments || 5)).map((item, idx) => (
                     <li key={`${item}-${idx}`}>
                        <AiFillStar className="w-10 h-10 text-secondary" />
                     </li>
                  ))}
               </ul>
               <div className="text-center text-sm text-sapo font-medium mt-3">
                  ({comments.length} đánh giá)
               </div>
               <div className="flex justify-center mt-2">
                  <button
                     className="btn !bg-primary-light text-white !text-semibold hover:!bg-primary text-sm"
                     onClick={handleShowModal}
                  >
                     Gửi đánh giá của bạn
                  </button>
               </div>
            </div>
            <div className="px-2.5">
               <CommentFilters
                  filterRating={filterRating}
                  onRatingChange={handleFilterRatingChange}
                  ratingList={filterRatingList}
               />
            </div>
         </div>
         <CommentFormModal
            isShowModal={isShowModal}
            setIsShowModal={setIsShowModal}
            product={product}
            fnAddComment={handleAddComment}
         />
      </div>
   )
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pCreateComment: (data: ICommentData) => dispatch(createComment(data)),
   }
}

export default connect(null, mapDispatchToProps)(CommentReview)
