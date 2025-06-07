import Link from "next/link";
import Image from "next/image";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import LeftArrow from "../public/icons/LeftArrow";
import Button from "../components/Buttons/Button";
import GhostButton from "../components/Buttons/GhostButton";
import { useCart } from "../context/cart/CartProvider";
import { useWishlist } from "../context/wishlist/WishlistProvider";
import { roundDecimal } from "../components/Util/utilFunc";
import { itemType as CartItemType } from "../context/cart/cart-types";
import { itemType as WishlistItemType } from "../context/wishlist/wishlist-type";

// let w = window.innerWidth;

const Wishlist = () => {
  const t = useTranslations("CartWishlist");
  const { addOne } = useCart();
  const { wishlist, deleteWishlistItem, clearWishlist } = useWishlist();
  const router = useRouter();
  const { locale } = router;

  console.log(wishlist);
  let subtotal = 0;

  // Helper function to format price based on locale
  const formatPrice = (price: number | string) => {
    // Đảm bảo price là số
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (locale === "vi") {
      return `${new Intl.NumberFormat('vi-VN').format(numPrice)}\u00A0₫`;
    } else {
      return `$\u00A0${numPrice}`;
    }
  };

  // Hàm chuyển đổi từ WishlistItemType sang CartItemType
  const convertToCartItem = (item: WishlistItemType): CartItemType => {
    return {
      _id: item.id.toString(),
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      images: item.images || [],
      selectedColor: item.selectedColor,
      size: item.size,
      cartImage: item.cartImage
    };
  };

  // Hàm để lấy hình ảnh sản phẩm dựa trên màu đã chọn
  const getProductImage = (item: WishlistItemType): string => {
    // Nếu có cartImage (hình ảnh đã được chọn khi thêm vào danh sách yêu thích)
    if (item.cartImage) {
      return item.cartImage;
    }
    
    // Nếu có selectedColor, tìm hình ảnh phù hợp với màu đó
    if (item.selectedColor && item.images) {
      const colorImage = item.images.find(img => img.colorCode === item.selectedColor?.colorCode);
      if (colorImage) {
        return Array.isArray(colorImage.url) ? colorImage.url[0] : colorImage.url as string;
      }
    }
    
    // Mặc định, sử dụng hình ảnh đầu tiên
    const firstImage = item.images?.[0];
    if (firstImage) {
      return Array.isArray(firstImage.url) ? firstImage.url[0] : firstImage.url as string;
    }
    
    // Fallback nếu không có hình ảnh nào
    return "/placeholder-image.jpg";
  };

  return (
    <div>
      {/* ===== Head Section ===== */}
      <Header title={`Danh sách yêu thích - Lumen Fashion`} />

      <main id="main-content">
        {/* ===== Heading & Continue Shopping */}
        <div className="app-max-width px-4 sm:px-8 md:px-20 w-full border-t-2 border-gray100">
          <h1 className="text-2xl sm:text-4xl text-center sm:text-left mt-6 mb-2 animatee__animated animate__bounce">
            {t("wishlist")}
          </h1>
          <div className="mt-6 mb-3">
            <Link href="/">
              <a className="inline-block">
                <LeftArrow size="sm" extraClass="inline-block" />{" "}
                {t("continue_shopping")}
              </a>
            </Link>
          </div>
        </div>

        {/* ===== Wishlist Table Section ===== */}
        <div className="app-max-width px-4 sm:px-8 md:px-20 mb-14 flex flex-col lg:flex-row">
          <div className="h-full w-full">
            <table className="w-full mb-6">
              <thead>
                <tr className="border-t-2 border-b-2 border-gray200">
                  <th className="font-normal hidden md:table-cell text-left sm:text-center py-2 xl:w-72">
                    {t("product_image")}
                  </th>
                  <th className="font-normal hidden md:table-cell text-left sm:text-center py-2 xl:w-72">
                    {t("product_name")}
                  </th>
                  <th className="font-normal md:hidden text-left sm:text-center py-2 xl:w-72">
                    {t("product_details")}
                  </th>
                  <th
                    className={`font-normal py-2 ${
                      wishlist.length === 0 ? "text-center" : "text-right"
                    }`}
                  >
                    {t("unit_price")}
                  </th>
                  <th className="font-normal hidden sm:table-cell py-2 max-w-xs">
                    {t("add")}
                  </th>
                  <th className="font-normal hidden sm:table-cell py-2 text-right w-10 whitespace-nowrap">
                    {t("remove")}
                  </th>
                  <th className="font-normal sm:hidden py-2 text-right w-10">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {wishlist.length === 0 ? (
                  <tr className="w-full text-center h-60 border-b-2 border-gray200">
                    <td colSpan={5}>{t("wishlist_is_empty")}</td>
                  </tr>
                ) : (
                  wishlist.map((item) => {
                    subtotal += item.price * item.quantity!;
                    return (
                      <tr className="border-b-2 border-gray200" key={item.id}>
                        <td className="my-3 flex justify-center flex-col items-start sm:items-center">
                          <Link
                            href={`/products/${encodeURIComponent(item.id)}`}
                          >
                            <a>
                              <Image
                                src={getProductImage(item)}
                                alt={item.name}
                                width={95}
                                height={128}
                                className="h-32 xl:mr-4"
                                objectFit="contain"
                              />
                            </a>
                          </Link>
                          <span className="text-xs md:hidden">{item.name}</span>
                        </td>
                        <td className="text-center hidden md:table-cell">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {/* Hiển thị thông tin màu sắc và kích thước nếu có */}
                            {(item.selectedColor || item.size) && (
                              <div className="text-sm text-gray-500 mt-1">
                                {item.selectedColor && (
                                  <div className="flex items-center justify-center">
                                    <span>Màu: {item.selectedColor.colorName}</span>
                                    {item.selectedColor.colorCode && (
                                      <div 
                                        className="ml-2 w-4 h-4 rounded-full border border-gray-300" 
                                        style={{ backgroundColor: item.selectedColor.colorCode }}
                                      ></div>
                                    )}
                                  </div>
                                )}
                                {item.size && <div>Kích thước: {item.size}</div>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-right text-gray400">
                          {formatPrice(roundDecimal(item.price))}
                        </td>
                        <td className="text-center hidden sm:table-cell max-w-xs text-gray400">
                          <Button
                            value={t("add_to_cart")}
                            extraClass="hidden sm:block m-auto"
                            onClick={() => addOne!(convertToCartItem(item))}
                          />
                        </td>
                        <td
                          className="text-right pl-8"
                          style={{ minWidth: "3rem" }}
                        >
                          <Button
                            value={t("add")}
                            onClick={() => addOne!(convertToCartItem(item))}
                            extraClass="sm:hidden mb-4 whitespace-nowrap"
                          />
                          <button
                            onClick={() => deleteWishlistItem!(item)}
                            type="button"
                            className="outline-none text-gray300 hover:text-gray500 focus:outline-none text-4xl sm:text-2xl"
                          >
                            &#10005;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div>
              <GhostButton
                onClick={clearWishlist}
                extraClass="w-full sm:w-72 whitespace-nowrap"
              >
                {t("clear_wishlist")}
              </GhostButton>
            </div>
          </div>
        </div>
      </main>

      {/* ===== Footer Section ===== */}
      <Footer />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../messages/common/${locale}.json`)).default,
    },
  };
};

export default Wishlist;
