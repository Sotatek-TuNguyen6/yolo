'use client'

import {
   ProductChooseSize,
   ProductDetailRightField,
   ProductSubDescription,
} from '@/components/product-detail/ProductDetailRight/components'
import { Button } from '@/components/buttons'
import { QuantityField } from '@/components/form-fields'
import { productDetailVals, notionProduct } from '@/data'
import { useToastify } from '@/hooks'
import { ICartForm, IColor, IProductDetailForm, IProduct, ISize, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { createCart } from '@/store/cart/thunkApi'
import { setShowModalNotificationLogin } from '@/store/common'
import { formatCurrency } from '@/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { PayloadAction } from '@reduxjs/toolkit'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { BiCartAlt } from 'react-icons/bi'
import { connect } from 'react-redux'
import * as yup from 'yup'

export interface IProductDetailRightProps {
   product: IProduct
   onColorChange: (val: string) => void
   pUser: IUser | null
   pCreateCart: (data: ICartForm) => Promise<PayloadAction<unknown>>
   pShowModalNotificationLogin: () => void
}

const schema = yup.object().shape({
   color: yup.mixed().required('Vui lòng chọn màu cho sản phẩm'),
   size: yup.string().required('Vui lòng chọn kích thước cho sản phẩm'),
   quantities: yup.number().min(0, 'Vui lòng chọn số lượng sản phẩm'),
})

function ProductDetailRight({
   product,
   onColorChange,
   pUser,
   pCreateCart,
   pShowModalNotificationLogin,
}: IProductDetailRightProps) {
   const router = useRouter()
   const { error, success } = useToastify()
   const [color, setColor] = useState<string | null>((product.colors as IColor[])[0].name)
   const [size, setSize] = useState<string | null>(null)
   const [clickedButton, setClickedButton] = useState<string | null>(null)

   const sizes = useMemo(() => {
      return (product.sizes as ISize[]).map((x) => x.name)
   }, [product])

   const {
      control,
      setValue,
      handleSubmit,
      trigger,
      formState: { isSubmitting },
   } = useForm<IProductDetailForm>({
      defaultValues: productDetailVals((product.colors as IColor[])[0]._id as string),
      resolver: yupResolver(schema) as any,
   })

   const handleSizeChange = useCallback((val: string) => {
      if (product) {
         setSize(val)
         const size = (product.sizes as ISize[]).find((s) => s.name === val)
         if (size) {
            setValue('size', size?._id)
            trigger('size')
         }
      }
   }, [])

   const handleSizeClick = (size: string, id: string) => {
      setValue('size', id)
      trigger('size')
      setSize(size)
   }
   const handleColorClick = (name: string, id: string) => {
      setValue('color', id)
      onColorChange(id)
      setColor(name)
   }

   const handleAddToCart = async (values: IProductDetailForm) => {
      try {
         if (pUser) {
            const cart: ICartForm = {
               user: pUser._id,
               item: {
                  product: product._id,
                  quantities: values.quantities,
                  color: values.color as string,
                  size: values.size,
               },
            }
            await pCreateCart(cart)
            if (clickedButton === 'buy-now') {
               router.push('/cart')
            }
            success('Thêm sản phẩm vào giỏ hàng thành công')
         } else {
            pShowModalNotificationLogin()
         }
      } catch (err) {
         error((err as Error).message)
      }
   }

   return (
      <div>
         <form onSubmit={handleSubmit(handleAddToCart)}>
            <div>
               <h1 className="heading-5 leading-tight !font-semibold !text-left !text-sapo capitalize">
                  {product.name}
               </h1>
               <ProductSubDescription product={product} />
               <div className="flex gap-4 items-center mt-1">
                  <span
                     className={`inline-block text-xl font-semibold ${
                        product.price !== product.originPrice
                           ? 'text-red-700'
                           : 'text-sapo'
                     }`}
                  >
                     {formatCurrency(product.price as number)}
                  </span>
                  {product.price !== product.originPrice && (
                     <>
                        <span className="text-origin-price-light text-xl font-normal line-through">
                           {formatCurrency(product.originPrice as number)}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded text-red-600 text-xl font-semibold">
                           - {product.discount}%
                        </span>
                     </>
                  )}
               </div>
            </div>

            {/* Colors */}
            <ProductDetailRightField<IProductDetailForm>
               control={control}
               name="color"
               label="Màu sắc"
               val={color}
            >
               {(product.colors as IColor[])?.map((item) => (
                  <div
                     key={item.id as string}
                     className={`d-flex !inline-flex w-12 h-12 mr-4 mb-2 rounded cursor-pointer border-2 border-gray-light-border hover:border-secondary p-0.5 d-flex duration-common ${
                        color === item.name ? '!border-transparent' : ''
                     }`}
                     onClick={() => handleColorClick(item.name as string, item._id)}
                  >
                     <div
                        className={`d-flex !inline-flex w-full h-full ${
                           color === item.name ? 'border-2 border-secondary p-0.5' : ''
                        } rounded duration-common`}
                     >
                        <div
                           className="w-full h-full rounded duration-common"
                           style={{
                              background: item.value as string,
                           }}
                        ></div>
                     </div>
                  </div>
               ))}
            </ProductDetailRightField>

            {/* Sizes */}
            <ProductDetailRightField
               className="mb-4 !mt-1"
               control={control}
               name="size"
               label={'Kích thước'}
               val={size}
            >
               {(product.sizes as ISize[])?.map((s) => (
                  <div
                     key={s._id}
                     className={`px-3 py-2 bg-tag-light mr-4 mb-2 min-w-[56px] d-flex text-gray-dark rounded cursor-pointer font-semibold hover:bg-secondary-light hover:text-secondary duration-common ${
                        s.name === size
                           ? '!bg-secondary text-white hover:!text-white'
                           : ''
                     }`}
                     onClick={() => handleSizeClick(s.name, s._id)}
                  >
                     {s.name}
                  </div>
               ))}
            </ProductDetailRightField>

            {/* Choose size */}
            <ProductChooseSize onSetSize={handleSizeChange} sizes={sizes} />

            {/* Quantity */}
            <div className="inline-block mb-2">
               <QuantityField<IProductDetailForm>
                  control={control}
                  name="quantities"
                  setValue={setValue}
                  size="lg"
                  trigger={trigger}
               />
            </div>
            <div className="my-4">
               <div className="flex gap-4">
                  <Button
                     type="submit"
                     className="btn gap-2 border-2 !bg-transparent border-title flex-1 font-semibold text-sm !text-title hover:!bg-gray-light-border"
                     disabled={isSubmitting}
                     isLoading={isSubmitting}
                     loadingClassName="!w-5 !h-5"
                     title={''}
                     id="add-to-cart"
                  >
                     <BiCartAlt className="w-5 h-5 text-title" /> Thêm vào giỏ
                  </Button>
                  <Button
                     type="submit"
                     className="btn border-2 border-transparent !bg-secondary text-white flex-1 font-semibold text-sm hover:!bg-secondary-dark"
                     title={'Mua ngay'}
                     disabled={isSubmitting}
                     isLoading={isSubmitting}
                     loadingClassName="!w-5 !h-5"
                     disabledClassName="disabled-btn-submit"
                     id="buy-now"
                     onClick={() => setClickedButton('buy-now')}
                  ></Button>
               </div>
            </div>
         </form>
         <div className="grid grid-cols-2 gap-x-10 gap-y-4 justify-between mt-10">
            {notionProduct.map((note) => {
               const Icon = note.icon
               return (
                  <div key={note.title} className="flex flex-col gap-2 items-center">
                     <div className="d-flex">
                        <Icon />
                     </div>
                     <p className="text-xs text-description text-center">{note.title}</p>
                  </div>
               )
            })}
         </div>
      </div>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pCreateCart: (data: ICartForm) => dispatch(createCart(data)),
      pShowModalNotificationLogin: () => dispatch(setShowModalNotificationLogin(true)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailRight)
