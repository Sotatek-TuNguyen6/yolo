import { MailIcon, MapIcon, Phone2Icon } from '@/components/icons'
import { aboutLUMEN, socials, supportUsers } from '@/data'
import Image from 'next/image'

export function FooterTop() {
   return (
      <div className="grid grid-cols-12 gap-4">
         <div className="col-start-1 col-end-5 text-white">
            <p className="text-sm leading-6">
               “Đặt sự hài lòng của khách hàng là ưu tiên số 1 trong mọi suy nghĩ hành
               động của mình” là sứ mệnh, là triết lý, chiến lược.. luôn cùng LUMEN tiến
               bước
            </p>
            <form className="mt-8">
               <label htmlFor="" className="uppercase text-sm inline-block mb-2">
                  Đăng ký nhận thông tin
               </label>
               <div className="flex items-stretch">
                  <input
                     type="text"
                     className="h-12 flex-1 border border-white rounded-l-md bg-gray-hr placeholder:text-white pl-6 pr-3"
                     placeholder="Nhập email đăng ký của bạn"
                  />
                  <button
                     type="submit"
                     className="block bg-white text-secondary w-28 h-12 rounded-r-md border border-transparent hover:bg-secondary hover:text-white duration-common"
                  >
                     Đăng ký
                  </button>
               </div>
            </form>
            <ul className="flex gap-2.5 items-center mt-6">
               {socials.map((social) => (
                  <li key={social.link}>
                     <a
                        href={social.link}
                        className="inline-block relative w-10 h-10 hover:rotate-45 duration-500 ease-in-out"
                        target="_blank"
                     >
                        <Image
                           src={social.image}
                           alt=""
                           fill
                           sizes="100%"
                           className="cursor-pointer"
                        />
                     </a>
                  </li>
               ))}
            </ul>
         </div>
         <div className="col-start-5 col-end-7 text-white">
            <h4 className="uppercase font-medium mb-3 text-sm">Về LUMEN</h4>
            <ul className="pl-2">
               {aboutLUMEN.map((item) => (
                  <li key={item.name} className="my-1">
                     <a
                        href={item.link}
                        target="_blank"
                        className="inline-block hover:text-secondary text-sm"
                     >
                        {item.name}
                     </a>
                  </li>
               ))}
            </ul>
         </div>
         <div className="col-start-7 col-end-10 text-white">
            <h4 className="uppercase font-medium mb-3 text-sm">Hỗ trợ khách hàng</h4>
            <ul className="pl-2">
               {supportUsers.map((item) => (
                  <li key={item.name} className="my-1">
                     <a
                        href={item.link}
                        target="_blank"
                        className="inline-block hover:text-secondary text-sm"
                     >
                        {item.name}
                     </a>
                  </li>
               ))}
            </ul>
         </div>
         <div className="col-start-10 col-end-13 text-white">
            <h4 className="uppercase font-medium mb-3 text-sm">
               Công ty cổ phần thời trang LUMEN
            </h4>
            <ul>
               <li className="text-sm leading-7 mb-2">
                  <MapIcon className="text-primary inline-block mr-1 w-8 h-8 mb-1" /> Công
                  ty cổ phần Thời trang LUMEN
                  <br />
                  Mã số thuế: 0801206940
                  <br />
                  Địa chỉ: Đường An Định - Phường Việt Hòa - Thành phố Hải Dương - Hải
                  Dương
               </li>
               <li className="text-sm leading-7 mb-2">
                  <Phone2Icon className="text-primary inline-block mr-1 w-8 h-8 mb-1" />{' '}
                  Liên hệ đặt hàng: 024 999 86 999.
                  <br />
                  Thắc mắc đơn hàng: 024 999 86 999. <br /> Góp ý khiếu nại: 1800 2086.
               </li>
               <li className="text-sm leading-7 mb-2">
                  <MailIcon className="text-primary inline-block mr-1 w-8 h-8 mb-1" />{' '}
                  Email: chamsockhachhang@LUMEN.vn
               </li>
            </ul>
         </div>
      </div>
   )
}
