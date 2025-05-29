'use client'

import { CommentList, CommentReview } from '@/components/Comments/components'
import { IComment, IFilterRating, IProduct, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { getAllCommentsForProduct } from '@/store/comment/thunkApi'
import { PayloadAction } from '@reduxjs/toolkit'
import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { ALL } from '@/constants'
import Link from 'next/link'

export interface ICommentsProps {
   className?: string
   product: IProduct
   pGetAllComments: (productId: string) => Promise<PayloadAction<unknown>>
   pComments: IComment[]
   pUser: IUser | null
}

function Comments({
   className = '',
   product,
   pGetAllComments,
   pComments,
   pUser,
}: ICommentsProps) {
   const [comments, setComments] = useState<IComment[]>(pComments)

   useEffect(() => {
      setComments(pComments)
   }, [pComments])

   useEffect(() => {
      ;(async () => {
         try {
            await pGetAllComments(product._id)
         } catch (error) {
            throw new Error(error as string)
         }
      })()
   }, [])

   const setCommentsByFilters = useCallback(
      (rating: IFilterRating) => {
         const newComments = pComments.filter((comment) => {
            if (rating === ALL) return true
            return comment.rating === rating
         })
         setComments(newComments)
      },
      [pComments]
   )

   return (
      <div className={`border-t border-gray-light-border mb-4 ${className}`}>
         <div className="px-3 py-4">
            <h4 className="text-lg text-description font-medium">Đánh giá</h4>
         </div>
         {pUser && (
            <CommentReview
               product={product}
               onCommentsChange={setCommentsByFilters}
               comments={pComments}
            />
         )}
         {!pUser && (
            <div className="bg-gray-light-border border border-gray-border rounded">
               <div className="d-flex flex-col py-8">
                  <p className="text-sapo text-sm font-medium mb-4">
                     Vui lòng đăng nhập để bình luận về sản phẩm này
                  </p>
                  <Link
                     href={'/login'}
                     className="inline-block px-4 py-2 rounded text-white bg-primary-light text-sm font-medium hover:bg-primary"
                  >
                     Đăng nhập
                  </Link>
               </div>
            </div>
         )}
         <CommentList comments={comments} product={product} />
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pComments: state.comment.comments,
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pGetAllComments: (productId: string) =>
         dispatch(getAllCommentsForProduct(productId)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments)
