'use client'

import { StarIcon } from '@/components/icons'
import { IComment } from '@/models'
import { AppState } from '@/store'
import { useMemo } from 'react'
import { connect } from 'react-redux'

export interface IProductCommentProps {
   pComments: IComment[]
}

export function ProductComment({ pComments }: IProductCommentProps) {
   const handleScrollRating = () => {
      const element = document.getElementById('review-comments')
      element?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
   }

   const averageRatings = useMemo(() => {
      if (pComments.length === 0) return 0
      const sum = pComments.reduce((total: number, c: IComment) => {
         return total + (c.rating || 0)
      }, 0)
      return Math.trunc(sum / pComments.length)
   }, [pComments])

   const checkCommentsLength = useMemo(() => {
      return pComments.length > 0 ? true : false
   }, [pComments])

   return (
      <div>
         <div className="flex items-center gap-2">
            <div
               className="flex items-center gap-[1px] cursor-pointer"
               onClick={handleScrollRating}
            >
               {checkCommentsLength &&
                  Array.from(new Array(averageRatings)).map((item, idx) => (
                     <span key={`${item}${idx}`}>
                        <StarIcon
                           className="!w-4 !h-4 text-secondary-dark"
                           fill="currentColor"
                        />
                     </span>
                  ))}
               {!checkCommentsLength &&
                  Array.from(new Array(5)).map((item, idx) => (
                     <span key={`${item}${idx}`}>
                        <StarIcon
                           className="!w-4 !h-4 text-gray-text"
                           fill="currentColor"
                        />
                     </span>
                  ))}
            </div>
            {checkCommentsLength && <span>({pComments.length})</span>}
         </div>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pComments: state.comment.comments,
   }
}

export default connect(mapStateToProps, null)(ProductComment)
