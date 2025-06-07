'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Product } from '@/types/product'

interface RecentSalesProps {
  topProducts?: Product[];
}

export function RecentSales({ topProducts = [] }: RecentSalesProps) {
  if (!topProducts || topProducts.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No product data available</div>
  }

  return (
    <div className='space-y-8'>
      {topProducts.slice(0, 5).map((product, index) => (
        <div key={product._id || index} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={product.featuredImage} alt={product.name} />
            <AvatarFallback>{product.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{product.name}</p>
              <p className='text-muted-foreground text-sm'>
                {product.category?.name || 'No category'}
              </p>
            </div>
            <div className='font-medium'>${product.price?.toFixed(2) || product.originPrice.toFixed(2)}</div>
          </div>
        </div>
      ))}
      
      {topProducts.length > 5 && (
        <div className="text-center text-sm text-muted-foreground">
          +{topProducts.length - 5} more products
        </div>
      )}
    </div>
  )
}