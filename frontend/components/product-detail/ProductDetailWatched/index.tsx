'use client'

import { IProduct } from '@/models'
import { AppState } from '@/store'
import { connect } from 'react-redux'
import { ProductDetailCommonList } from '..'

export interface IProductDetailWatchedProps {
   className?: string
   pRecentViews: IProduct[]
}

function ProductDetailWatched({
   className = '',
   pRecentViews,
}: IProductDetailWatchedProps) {
   return (
      <ProductDetailCommonList
         className={className}
         productList={pRecentViews}
         title={'Các sản phẩm đã xem'}
         isCenterTitle
      />
   )
}

const mapStateToProps = (state: AppState) => {
   return {
      pRecentViews: state.user.recentlyViewed,
   }
}

export default connect(mapStateToProps, null)(ProductDetailWatched)
