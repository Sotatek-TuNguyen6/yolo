import { Comment } from '@/components/Comments/components'
import { IComment, IProduct } from '@/models'

export interface ICommentListProps {
   comments: IComment[]
   product: IProduct
}

export function CommentList({ comments, product }: ICommentListProps) {
   console.log('comments', comments)
   return (
      <div className="pt-8 pb-2">
         <div>
            {comments.map((comment) => (
               <Comment
                  key={comment.id}
                  comment={comment}
                  product={product}
                  className="mb-6"
               />
            ))}
         </div>
         <div>
            {comments.length === 0 && (
               <p className="d-flex text-sapo h-36">
                  Không có đánh giá nào phù hợp với bộ lọc!
               </p>
            )}
         </div>
      </div>
   )
}
