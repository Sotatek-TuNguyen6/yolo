'use client'

import { productApi } from '@/api'
import {
   ProductDetailLeft,
   ProductDetailRecommends,
   ProductDetailRelation,
   ProductDetailRight,
   ProductDetailWatched,
} from '@/components/product-detail'
import { Breadcrumb, Container } from '@/components/common'
import { ICategory, IProduct, ISubCategory, IUser } from '@/models'
import { AppDispatch, AppState } from '@/store'
import { addRecentlyProduct } from '@/store/user'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import { useProductDetail } from '@/hooks'
import { IMAGE_BLUR } from '@/constants'

export interface IProductDetailProps {
   params: {
      slug: string
   }
   pAddRecentlyProduct: (product: IProduct) => void
   pUser: IUser | null
}

function ProductDetail({ params, pUser, pAddRecentlyProduct }: IProductDetailProps) {
   const [images, setImages] = useState<string[]>([])

   console.log('params', params)
   const { data, isLoading, error } = useProductDetail({ params: params.slug as string })
   const product = data.data.product

   useEffect(() => {
      if (product) {
         pAddRecentlyProduct(product)
         setImages(product.imageUrls[0].images)
      }
   }, [product])

   if (isLoading) {
      return <></>
   }

   if (error || !product) {
      return (
         <div className="flex items-center pt-10 flex-col">
            <div className="relative w-96 h-72 m-auto mb-4">
               <Image
                  src={'/product-empty.png'}
                  alt="Không có sản phẩm này"
                  fill
                  className="rounded"
               />
            </div>
            <p className="text-center text-gray-dark text-sm">
               Không có sản phẩm này trong cửa hàng{' '}
               <span className="text-primary font-bold">YO</span>
               <span className="text-secondary-dark font-bold">DY</span>
            </p>
         </div>
      )
   }

   const handleImagesChange = (val: string) => {
      if (product) {
         const colorImage = product.imageUrls.find((i: any) => i.color === val)
         if (colorImage) {
            setImages(colorImage.images)
         }
      }
   }

   return (
      <Container>
         <div>
            <div>
               <Breadcrumb className="!m-2">
                  <Link href={'/'} className="hover:text-secondary-dark">
                     Trang chủ
                  </Link>
                  <Link
                     href={`/products?page=1&categories=${
                        (product.category as ICategory)._id
                     }`}
                     className="capitalize hover:text-secondary-dark"
                  >
                     {(product.category as ICategory).name}
                  </Link>
                  <Link
                     href={`/products?page=1&categories=${
                        (data.data.product.category as ICategory)._id
                     }&subCategories=${(product.subCategory as ISubCategory)._id}`}
                     className="capitalize font-semibold hover:text-secondary-dark"
                  >
                     {(product.subCategory as ISubCategory).name}
                  </Link>
               </Breadcrumb>
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-4">
               <div className="px-2">
                  <ProductDetailLeft product={product} images={images} />
               </div>
               <div className="px-2">
                  <ProductDetailRight
                     product={product}
                     onColorChange={handleImagesChange}
                  />
               </div>
            </div>
         </div>
         {pUser && (
            <div className="border-t border-gray-light-border py-10">
               <ProductDetailRecommends id={product._id} />
            </div>
         )}
         <div className="border-t border-gray-light-border py-10">
            <ProductDetailRelation id={product._id} />
         </div>
         <div className="border-t border-gray-light-border pt-10 pb-8">
            <ProductDetailWatched />
         </div>
      </Container>
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pUser: state.user.user,
   }
}

const mapDispatchToProps = (dispatch: AppDispatch) => {
   return {
      pAddRecentlyProduct: (product: IProduct) => dispatch(addRecentlyProduct(product)),
   }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetail)
