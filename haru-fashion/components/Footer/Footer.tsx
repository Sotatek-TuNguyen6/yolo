import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react"
import styles from "./Footer.module.css"

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Thông tin cửa hàng */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-block mb-6">
              <h2 className="text-2xl font-bold">Lumen Fashion</h2>
            </a>
            <p className="text-gray-400 mb-6 max-w-md">
              Chúng tôi cung cấp những sản phẩm thời trang chất lượng cao, theo xu hướng mới nhất với giá cả phải chăng
              cho tất cả mọi người.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400">Khu đô thị Ngôi Sao, thị trấn Thọ Xuân, huyện Thọ Xuân, Thanh Hóa</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">+84 942-471-636</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">contact@lumenfashion.com</span>
              </div>
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <h3 className={`text-lg font-semibold mb-6 ${styles.sectionTitle}`}>
              Danh mục
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/product-category/ao-nam" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Áo nam
                </a>
              </li>
              <li>
                <a href="/product-category/quan-nam" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Quần nam
                </a>
              </li>
              <li>
                <a href="/product-category/sport-wear" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Sportswear
                </a>
              </li>
              {/* <li>
                <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
                  S
                </a>
              </li> */}
              <li>
                <a href="/product-category/new-arrivals" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Bộ sưu tập mới
                </a>
              </li>
            </ul>
          </div>

          {/* Thông tin */}
          <div>
            <h3 className={`text-lg font-semibold mb-6 ${styles.sectionTitle}`}>
              Thông tin
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="/" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="/" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="/" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="/" className="text-gray-400 hover:text-rose-400 transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
            </ul>
          </div>

          {/* Đăng ký nhận tin */}
          <div>
            <h3 className={`text-lg font-semibold mb-6 ${styles.sectionTitle}`}>
              Đăng ký nhận tin
            </h3>
            <p className="text-gray-400 mb-4">Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt</p>
            <div className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Email của bạn"
                className="px-4 py-2 rounded bg-gray-900 border border-gray-700 focus:border-rose-500 focus:outline-none text-white"
              />
              <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors">
                Đăng ký
              </button>
            </div>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
                <Facebook className="w-5 h-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-rose-400 transition-colors">
                <Youtube className="w-5 h-5" />
                <span className="sr-only">Youtube</span>
              </a>
            </div>
          </div>
        </div>

        {/* Thanh toán và bản quyền */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Lumen Fashion. Tất cả các quyền được bảo lưu.
            </p>
        
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
