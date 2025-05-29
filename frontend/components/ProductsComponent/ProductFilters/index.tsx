import {
   ProductCategoryFilter,
   ProductChoseFilter,
   ProductColorFilter,
   ProductPriceFilter,
   ProductRatingFilter,
   ProductSizeFilter,
   ProductSubCategoryFilter,
} from '@/components/ProductsComponent/ProductFilters/components'

export function ProductFilters() {
   return (
      <div>
         {/* Filters Chose */}
         <ProductChoseFilter />

         {/* Category */}
         <ProductCategoryFilter />

         {/* Category */}
         <ProductSubCategoryFilter />

         {/* Sizes */}
         <ProductSizeFilter />

         {/* Colors */}
         <ProductColorFilter />

         {/* Prices */}
         <ProductPriceFilter />

         {/* Rating */}
         <ProductRatingFilter />
      </div>
   )
}
