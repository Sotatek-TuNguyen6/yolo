import AxiosClient from '.'

const BASE_API = '/colors'

export const getAllColors = async () => {
   return AxiosClient.get(BASE_API, {
      params: {
         page: 1,
         limit: 100,
         sort: 'createdAt',
      },
   }).then((res) => res.data)
}
