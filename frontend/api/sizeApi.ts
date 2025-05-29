import AxiosClient from '.'

const BASE_URL = '/sizes'

export const getAllSizes = async () => {
   return AxiosClient.get(`${BASE_URL}`, {
      params: {
         page: 1,
         limit: 100,
         sort: 'createdAt',
      },
   }).then((res) => res.data)
}
