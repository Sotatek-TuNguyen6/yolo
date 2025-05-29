import AxiosClient from '.'

const BASE_URL = '/sub-categories'

export const getAllSubCategories = () => {
   return AxiosClient.get(BASE_URL, {
      params: {
         limit: 100,
         page: 1,
      },
   }).then((res) => res.data)
}
