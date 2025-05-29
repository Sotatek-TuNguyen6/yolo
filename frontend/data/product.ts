import { BoxIcon, CarFreeShipIcon, CardIcon } from '@/components/icons'
import { CarFastShip } from '@/components/icons/CarFastShip'
import { IProduct } from '@/models'
import { formatCurrency } from '@/utils'

export const notionProduct = [
   {
      icon: CarFreeShipIcon,
      title: 'Miễn phí vận chuyển với mọi đơn hàng từ 498k',
   },
   {
      icon: BoxIcon,
      title: 'Miễn phí đổi trả tại 230+ cửa hàng trong 15 ngày',
   },
   {
      icon: CardIcon,
      title: 'Đa dạng phương thức thanh toán (VNPay, Momo, COD)',
   },
   {
      icon: CarFastShip,
      title: 'Vận chuyển siêu tốc từ 1 đến 3 ngày',
   },
]

export const rates = [
   {
      id: 1,
      title: 'quá tệ',
   },
   {
      id: 2,
      title: 'tệ',
   },
   {
      id: 3,
      title: 'bình thường',
   },
   {
      id: 4,
      title: 'tốt',
   },
   {
      id: 5,
      title: 'quá tốt',
   },
]

export const sortProduct = [
   {
      name: 'Mặc định',
      val: '',
   },
   {
      name: 'Từ A-Z',
      val: 'name',
   },
   {
      name: 'Từ Z-A',
      val: '-name',
   },
   {
      name: 'Rẻ nhất',
      val: 'price',
   },
   {
      name: 'Giá giảm dần',
      val: '-price',
   },
   {
      name: 'Mới nhất',
      val: '-createdAt',
   },
]

export const ingredient = `
   <div class="text-sm">
      <div class='mb-3'>
         <h5 class="block font-semibold">Hướng dẫn sử dụng chung:</h5>
         <h5 class="hidden font-semibold">1. Hướng dẫn sử dụng chung:</h5>
      </div>
      <ul class='mt-1 mb-4 pl-6'>
         <li class='item-ingredient'>Giặt máy chế độ nhẹ với sản phẩm cùng màu ở nhiệt độ thường</li>
         <li class='item-ingredient'>Không giặt chung với các vật sắc nhọn</li>
         <li class='item-ingredient'>Không sử dụng chất tẩy rửa</li>
         <li class='item-ingredient'>Không ngâm lâu sản phẩm với các chất có tính tẩy rửa</li>
         <li class='item-ingredient'>Sử dụng xà phòng trung tính</li>
         <li class='item-ingredient'>Lộn trái và phơi bằng móc trong bóng râm, tránh ánh nắng trực tiếp</li>
         <li class='item-ingredient'>Là ủi ở mức 1, Nhiệt độ dưới 110 độ C</li>
         <li class='item-ingredient'>Không là lên chi tiết trang trí</li>
      </ul>
      <div class='mb-3'>
         <h5 class="block font-semibold">Hướng dẫn sử dụng với sản phẩm phụ kiện giày, túi xách:</h5>
         <h5 class="hidden font-semibold">2. Hướng dẫn sử dụng với sản phẩm phụ kiện giày, túi xách:</h5>
      </div>
      <ul class='mt-1 mb-4 pl-6'>
         <li class='item-ingredient'>Bảo quản nơi khô ráo</li>
         <li class='item-ingredient'>Không ngâm trong nước</li>
      </ul>
   </div>
`

export const prices = [
   {
      id: '00031',
      name: `Nhỏ hơn ${formatCurrency(100000)}`,
      val: {
         [`price[lte]`]: 100000,
      },
   },
   {
      id: '00032',
      name: `Từ ${formatCurrency(100000)} - ${formatCurrency(200000)}`,
      val: {
         [`price[gte]`]: 100000,
         [`price[lte]`]: 200000,
      },
   },
   {
      id: '00033',
      name: `Từ ${formatCurrency(200000)} - ${formatCurrency(350000)}`,
      val: {
         [`price[gte]`]: 200000,
         [`price[lte]`]: 350000,
      },
   },
   {
      id: '00034',
      name: `Từ ${formatCurrency(350000)} - ${formatCurrency(500000)}`,
      val: {
         [`price[gte]`]: 350000,
         [`price[lte]`]: 500000,
      },
   },
   {
      id: '00035',
      name: `Từ ${formatCurrency(500000)} - ${formatCurrency(700000)}`,
      val: {
         [`price[gte]`]: 500000,
         [`price[lte]`]: 700000,
      },
   },
   {
      id: '00036',
      name: `Lớn hơn ${formatCurrency(700000)}`,
      val: {
         [`price[gte]`]: 700000,
      },
   },
]
