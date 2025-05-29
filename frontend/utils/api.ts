import { productApi } from '@/api'

export const handleGetTopProducts = async () => {
   const res = await productApi.getTopProducts()
   return res.data.products
}

export const handleGetNewProducts = async () => {
   const res = await productApi.getNewProducts()
   return res.data.products
}

export const handleRecommendUser = async () => {
   const res = await productApi.recommendForUser()
   return res.data.products
}
