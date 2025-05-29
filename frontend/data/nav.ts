import {
   AccountIcon,
   BillIcon,
   LockIcon,
   AddressIcon,
   BoxProductIcon,
   HeartIcon,
} from '@/components/icons'
import { ALL } from '@/constants'

export const navUserLinks = [
   {
      id: '011',
      name: 'Tài khoản của tôi',
      link: '/account',
      icon: AccountIcon,
   },
   {
      id: '012',
      name: 'Đơn hàng của tôi',
      link: '/account/purchase',
      icon: BillIcon,
   },
   {
      id: '013',
      name: 'Đổi mật khẩu',
      link: '/account/change-password',
      icon: LockIcon,
   },
   {
      id: '014',
      name: 'Địa chỉ',
      link: '/account/addresses',
      icon: AddressIcon,
   },
   {
      id: '015',
      name: 'Đã xem gần đây',
      link: '/account/recently-viewed',
      icon: BoxProductIcon,
   },
   {
      id: '016',
      name: 'Các sản phẩm yêu thích',
      link: '/account/favorites-products',
      icon: HeartIcon,
   },
]

export const ratings = [
   {
      name: 'Tất cả',
      value: ALL,
   },
   {
      name: '5 Điểm',
      value: 5,
   },
   {
      name: '4 Điểm',
      value: 4,
   },
   {
      name: '3 Điểm',
      value: 3,
   },
   {
      name: '2 Điểm',
      value: 2,
   },
   {
      name: '1 Điểm',
      value: 1,
   },
]
