import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import LeftArrow from "../public/icons/LeftArrow";
import Button from "../components/Buttons/Button";
import GhostButton from "../components/Buttons/GhostButton";
import { GetStaticProps } from "next";
import { roundDecimal } from "../components/Util/utilFunc";
import { useCart } from "../context/cart/CartProvider";
import { useRouter } from "next/router";
import { itemType } from "../context/cart/cart-types";

// let w = window.innerWidth;

const ShoppingCart = () => {
  const t = useTranslations("CartWishlist");
  const router = useRouter();
  const { locale } = router;
  const [deli, setDeli] = useState("Pickup");
  const { cart, addOne, removeItem, deleteItem, clearCart } = useCart();

  console.log(cart);
  let subtotal = 0;

  let deliFee = 0;
  if (deli === "Yangon") {
    deliFee = 0;
  } else if (deli === "Others") {
    deliFee = 25000;
  }

  // Helper function to format price based on locale
  const formatPrice = (price: number | string) => {
    // Đảm bảo price là số
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    if (locale === "vi") {
      return `${new Intl.NumberFormat("vi-VN").format(numPrice)}\u00A0₫`;
    } else {
      return `$\u00A0${numPrice}`;
    }
  };

  // Helper function to get product image
  const getProductImage = (item: itemType): string => {
    if (item.cartImage) {
      return item.cartImage;
    } else if (item.selectedImageId) {
      const selectedImage = item.images.find(
        (img) => img._id === item.selectedImageId
      );
      if (selectedImage) {
        return Array.isArray(selectedImage.url)
          ? selectedImage.url[0]
          : selectedImage.url;
      }
    }
    // Fallback to first image
    return Array.isArray(item.images[0].url)
      ? item.images[0].url[0]
      : item.images[0].url;
  };

  // Calculate discounted price if discount is available
  const getDiscountedPrice = (item: itemType): number => {
    if (item.discountPercent && item.discountPercent > 0) {
      return parseFloat(
        roundDecimal(item.price - item.price * (item.discountPercent / 100))
      );
    }
    return parseFloat(roundDecimal(item.price));
  };

  return (
    <div>
      {/* ===== Head Section ===== */}
      <Header title={`Giỏ hàng - Lumen Fashion`} />

      <main id="main-content">
        {/* Custom styling for product images */}
        <style>{`
          .product-image {
            object-fit: contain !important;
            max-height: 128px;
            width: auto !important;
            height: auto !important;
          }
          .product-image-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 95px;
            height: 128px;
          }
        `}</style>

        {/* ===== Heading & Continue Shopping */}
        <div className="app-max-width px-4 sm:px-8 md:px-20 w-full border-t-2 border-gray100">
          <h1 className="text-2xl sm:text-4xl text-center sm:text-left mt-6 mb-2 animatee__animated animate__bounce">
            {t("shopping_cart")}
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

        {/* ===== Cart Table Section ===== */}
        <div className="app-max-width px-4 sm:px-8 md:px-20 mb-14 flex flex-col lg:flex-row">
          <div className="h-full w-full lg:w-4/6 mr-4">
            <table className="w-full mb-6">
              <thead>
                <tr className="border-t-2 border-b-2 border-gray200">
                  <th className="font-normal text-left sm:text-center py-2 xl:w-72">
                    {t("product_details")}
                  </th>
                  <th
                    className={`font-normal py-2 hidden sm:block ${
                      cart.length === 0 ? "text-center" : "text-right"
                    }`}
                  >
                    {t("unit_price")}
                  </th>
                  <th className="font-normal py-2">{t("quantity")}</th>
                  <th className="font-normal py-2 text-right">{t("amount")}</th>
                  <th
                    className="font-normal py-2 text-right"
                    style={{ minWidth: "3rem" }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr className="w-full text-center h-60 border-b-2 border-gray200">
                    <td colSpan={5}>{t("cart_is_empty")}</td>
                  </tr>
                ) : (
                  cart.map((item) => {
                    const discountedPrice = getDiscountedPrice(item);
                    subtotal += discountedPrice * item.quantity!;
                    return (
                      <tr
                        className="border-b-2 border-gray200"
                        key={
                          item.productId +
                          (item.selectedColor?.colorCode || "") +
                          (item.size || "")
                        }
                      >
                        <td className="my-3 flex flex-col xl:flex-row items-start sm:items-center xl:space-x-2 text-center xl:text-left">
                          <Link
                            href={`/products/${encodeURIComponent(
                              item.slug || item.productId
                            )}`}
                          >
                            <a className="product-image-container">
                              <Image
                                src={getProductImage(item)}
                                alt={item.name}
                                width={95}
                                height={128}
                                className="product-image"
                                objectFit="contain"
                              />
                            </a>
                          </Link>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            {/* Hiển thị thông tin màu sắc và kích thước nếu có */}
                            {(item.selectedColor || item.size) && (
                              <div className="text-sm text-gray-500 mt-1">
                                {item.selectedColor && (
                                  <div className="flex items-center">
                                    <span>
                                      Màu: {item.selectedColor.colorName}
                                    </span>
                                    {item.selectedColor.colorCode && (
                                      <div
                                        className="ml-2 w-4 h-4 rounded-full border border-gray-300"
                                        style={{
                                          backgroundColor:
                                            item.selectedColor.colorCode,
                                        }}
                                      ></div>
                                    )}
                                  </div>
                                )}
                                {item.size && (
                                  <div>Kích thước: {item.size}</div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-right text-gray400 hidden sm:table-cell">
                          {item.discountPercent && item.discountPercent > 0 ? (
                            <div>
                              <span className="line-through text-gray-400">
                                {formatPrice(roundDecimal(item.price))}
                              </span>
                              <br />
                              <span className="text-red-500">
                                {formatPrice(discountedPrice)}
                              </span>
                              <br />
                              <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded">
                                -{item.discountPercent}%
                              </span>
                            </div>
                          ) : (
                            formatPrice(roundDecimal(item.price))
                          )}
                        </td>
                        <td>
                          <div className="w-12 h-32 sm:h-auto sm:w-3/4 md:w-2/6 mx-auto flex flex-col-reverse sm:flex-row border border-gray300 sm:divide-x-2 divide-gray300">
                            <div
                              onClick={() => removeItem!(item)}
                              className="h-full w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100"
                            >
                              -
                            </div>
                            <div className="h-full w-12 flex justify-center items-center pointer-events-none">
                              {item.quantity}
                            </div>
                            <div
                              onClick={() => addOne!(item)}
                              className="h-full w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100"
                            >
                              +
                            </div>
                          </div>
                        </td>
                        <td className="text-right text-gray400">
                          {formatPrice(
                            roundDecimal(discountedPrice * item.quantity!)
                          )}
                          <br />
                          <span className="text-xs">
                            ({formatPrice(roundDecimal(discountedPrice))})
                          </span>
                        </td>
                        <td className="text-right" style={{ minWidth: "3rem" }}>
                          <button
                            onClick={() => deleteItem!(item)}
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
                onClick={clearCart}
                extraClass="hidden sm:inline-block"
              >
                {t("clear_cart")}
              </GhostButton>
            </div>
          </div>
          <div className="h-full w-full lg:w-4/12 mt-10 lg:mt-0">
            {/* Cart Totals */}
            <div className="border border-gray500 divide-y-2 divide-gray200 p-6">
              <h2 className="text-xl mb-3">{t("cart_totals")}</h2>
              <div className="flex justify-between py-2">
                <span className="uppercase">{t("subtotal")}</span>
                <span>{formatPrice(roundDecimal(subtotal))}</span>
              </div>
              {/* <div className="py-3">
                <span className="uppercase">{t("delivery")}</span>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <input
                        type="radio"
                        name="deli"
                        value="Pickup"
                        id="pickup"
                        checked={deli === "Pickup"}
                        onChange={() => setDeli("Pickup")}
                      />{" "}
                      <label htmlFor="pickup" className="cursor-pointer">
                        {t("store_pickup")}
                      </label>
                    </div>
                    <span>{t("free")}</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <input
                        type="radio"
                        name="deli"
                        value="Yangon"
                        id="ygn"
                        checked={deli === "Yangon"}
                        onChange={() => setDeli("Yangon")}
                        // defaultChecked
                      />{" "}
                      <label htmlFor="ygn" className="cursor-pointer">
                        Miễn phí giao hàng
                      </label>
                    </div>
                    <span>Miễn Phí</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <input
                        type="radio"
                        name="deli"
                        value="Others"
                        id="others"
                        checked={deli === "Others"}
                        onChange={() => setDeli("Others")}
                      />{" "}
                      <label htmlFor="others" className="cursor-pointer">
                        Ship nhanh
                      </label>
                    </div>
                    <span>{formatPrice(25000)}</span>
                  </div>
                </div>
              </div> */}
              <div className="flex justify-between py-3">
                <span>{t("grand_total")}</span>
                <span>{formatPrice(roundDecimal(subtotal + deliFee))}</span>
              </div>
              <Button
                value={t("proceed_to_checkout")}
                size="xl"
                extraClass="w-full"
                onClick={() => router.push(`/checkout`)}
                disabled={cart.length < 1 ? true : false}
              />
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

export default ShoppingCart;
