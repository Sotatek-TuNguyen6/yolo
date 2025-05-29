import { RulerIcon } from '@/components/icons'
import { ProductChooseSizeRange } from '@/components/product-detail/ProductDetailRight/components/ProductChooseSize/components'
import { Size, TypeMeasurement } from '@/enums'
import { ITypeMeasurement } from '@/models'
import { checkRangeValue } from '@/utils'
import { useMemo, useState } from 'react'

export interface IProductChooseSizeProps {
   onSetSize: (val: string) => void
   sizes: string[]
}

export function ProductChooseSize({ onSetSize, sizes }: IProductChooseSizeProps) {
   const [show, setShow] = useState<boolean>(false)
   const [height, setHeight] = useState<number>(153)
   const [weight, setWeight] = useState<number>(43)
   const [isFirstChange, setIsFirstChange] = useState<boolean>(true)

   const recommendSize = useMemo(() => {
      if (isFirstChange) {
         setIsFirstChange(false)
         return
      }
      let size = ''
      if (checkRangeValue(153, 155, height) && checkRangeValue(43, 46, weight)) {
         size = Size.S
         onSetSize(size)
         return size
      }
      if (checkRangeValue(153, 158, height) && checkRangeValue(46, 53, weight)) {
         size = Size.M
         onSetSize(size)
         return size
      }
      if (checkRangeValue(155, 162, height) && checkRangeValue(53, 57, weight)) {
         size = Size.L
         onSetSize(size)
         return size
      }
      if (checkRangeValue(155, 170, height) && checkRangeValue(57, 63, weight)) {
         size = Size.XL
         onSetSize(size)
         return size
      }
      if (checkRangeValue(155, 175, height) && checkRangeValue(63, 65, weight)) {
         size = Size['2XL']
         onSetSize(size)
         return size
      }
      return size
   }, [height, weight])

   const renderTextByRecommendSize = useMemo(() => {
      if (sizes?.includes(recommendSize as string)) {
         return `Kích thước <span class="text-primary font-semibold">YO</span><span class="text-secondary font-semibold">DY</span> chọn giúp bạn là: ${recommendSize}`
      }
      return `<span class="text-red-600">
               Không có size ${recommendSize} trong sản phẩm này
            </span>`
   }, [recommendSize])

   const handleCalcSize = (value: number, type: ITypeMeasurement) => {
      if (type === TypeMeasurement.HEIGHT) {
         setHeight(value)
      } else {
         setWeight(value)
      }
   }

   const handleToggleMeasurements = () => {
      setShow((prev) => !prev)
   }

   return (
      <div className="mb-4">
         <h5
            className="inline-flex gap-2 text-sm text-primary-lighter font-medium cursor-pointer hover:text-primary duration-common"
            onClick={handleToggleMeasurements}
         >
            <RulerIcon /> Giúp bạn chọn size
         </h5>
         <div
            className={`flex flex-col px-3 gap-6 border-2 border-dashed border-secondary rounded-md ${
               show
                  ? 'h-auto pt-4 pb-4 mt-3 opacity-100 pointer-events-auto'
                  : 'h-0 overflow-hidden py-0 mt-0 opacity-0 pointer-events-none'
            } duration-common`}
         >
            <ProductChooseSizeRange
               title="Chiều cao"
               type={TypeMeasurement.HEIGHT}
               min={153}
               max={175}
               currency={'cm'}
               onMeasurementChange={handleCalcSize}
            />
            <ProductChooseSizeRange
               title="Cân nặng"
               type={TypeMeasurement.WEIGHT}
               min={43}
               max={65}
               currency={'kg'}
               onMeasurementChange={handleCalcSize}
            />
            {recommendSize && (
               <p
                  className="text-center text-sm text-sapo font-medium"
                  dangerouslySetInnerHTML={{ __html: renderTextByRecommendSize }}
               ></p>
            )}
         </div>
      </div>
   )
}
