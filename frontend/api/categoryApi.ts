import AxiosClient from '.'

const BASE_API = '/categories'

export const getAllCategories = async () => {
   return AxiosClient.get(BASE_API, {
      params: {
         page: 1,
         limit: 100,
         sort: 'createdAt',
      },
   }).then((res) => res.data)
}
