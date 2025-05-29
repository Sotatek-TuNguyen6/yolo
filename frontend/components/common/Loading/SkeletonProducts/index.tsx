import { SkeletonProductItem } from '@/components/common/Loading/SkeletonProducts/components'

export interface ISkeletonProductsProps {
   length?: number
   className?: string
}

export function SkeletonProducts({ length = 4, className = '' }: ISkeletonProductsProps) {
   return (
      <div className={`grid grid-cols-4 gap-[30px] ${className}`}>
         {Array.from({ length }).map((item, idx) => (
            <SkeletonProductItem key={`${item}${idx}`} />
         ))}
      </div>
   )
}
