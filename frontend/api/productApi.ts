import { IProduct, IProductResponse, IQueryProduct, IResponse } from '@/models'
import AxiosClient from '.'

const BASE_API = '/products'

export const searchProduct = async (search: string) => {
   return AxiosClient.post(`${BASE_API}/search`, { search }).then((res) => res.data)
}

export const getAllProducts = async (
   params: IQueryProduct
): Promise<IResponse<IProductResponse>> => {
   return AxiosClient.get(BASE_API, {
      params,
   }).then((res) => res.data)
}

export const getProduct = async (id: string) => {
   return AxiosClient.get(`${BASE_API}/${id}`).then((res) => res.data)
}

export const likeProduct = async (id: string) => {
   return AxiosClient.get(`${BASE_API}/like/${id}`).then((res) => res.data)
}

export const unlikeProduct = async (id: string) => {
   return AxiosClient.get(`${BASE_API}/unlike/${id}`).then((res) => res.data)
}

export const calculatorRatings = async (id: string) => {
   return AxiosClient.get(`${BASE_API}/calculator-rating/${id}`).then((res) => res.data)
}

export const recommendProducts = async (
   id: string
): Promise<IResponse<IProductResponse>> => {
   return AxiosClient.get(`${BASE_API}/recommender/${id}`).then((res) => res.data)
}

export const relatedProducts = async (
   id: string
): Promise<IResponse<IProductResponse>> => {
   return AxiosClient.get(`${BASE_API}/related/${id}`).then((res) => res.data)
}

export const getTopProducts = async (): Promise<IResponse<IProductResponse>> => {
   return AxiosClient.get(`${BASE_API}/top`).then((res) => res.data)
}

export const getNewProducts = async (): Promise<IResponse<IProductResponse>> => {
   return AxiosClient.get(`${BASE_API}/new`).then((res) => res.data)
}

export const recommendForUser = async (): Promise<IResponse<IProductResponse>> => {
   return AxiosClient.get(`${BASE_API}/recommend-user`).then((res) => res.data)
}
