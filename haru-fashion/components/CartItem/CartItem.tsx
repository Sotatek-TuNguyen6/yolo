import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import BagIcon from "../../public/icons/BagIcon";
import Button from "../Buttons/Button";
import Item from "./Item";
import LinkButton from "../Buttons/LinkButton";
import { roundDecimal } from "../Util/utilFunc";
import { useCart } from "../../context/cart/CartProvider";
import { useRouter } from "next/router";
import { itemType } from "../../context/cart/cart-types";

export default function CartItem() {
  const router = useRouter();
  const t = useTranslations("CartWishlist");
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState("");
  const { cart, addOne, removeItem, deleteItem } = useCart();

  console.log("🔥 CartItem", cart);
  let subtotal = 0;

  let noOfItems = 0;
  cart.forEach((item) => {
    noOfItems += item.quantity!;
  });

  const handleAnimate = useCallback(() => {
    if (noOfItems === 0) return;
    setAnimate("animate__animated animate__headShake");
    // setTimeout(() => {
    //   setAnimate("");
    // }, 0.1);
  }, [noOfItems, setAnimate]);

  // Set animate when no of items changes
  useEffect(() => {
    handleAnimate();
    setTimeout(() => {
      setAnimate("");
    }, 1000);
  }, [handleAnimate]);

  function closeModal() {
    setOpen(false);
  }

  function openModal() {
    setOpen(true);
  }

  const getProductImage = (item: itemType): string => {
    if (item.cartImage) {
      return item.cartImage;
    } else if (item.selectedImageId) {
      const selectedImage = item.images.find(img => img._id === item.selectedImageId);
      if (selectedImage) {
        return Array.isArray(selectedImage.url) ? selectedImage.url[0] : selectedImage.url;
      }
    }
    // Fallback to first image
    return Array.isArray(item.images[0].url) ? item.images[0].url[0] : item.images[0].url;
  };

  const formatPrice = (price: number | string) => {
    // Đảm bảo price là số
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (router.locale === "vi") {
      return `${new Intl.NumberFormat('vi-VN').format(numPrice)}\u00A0₫`;
    } else {
      return `$\u00A0${numPrice}`;
    }
  };

  // Calculate discounted price if discount is available
  const getDiscountedPrice = (item: itemType): number => {
    if (item.discountPercent && item.discountPercent > 0) {
      return parseFloat(roundDecimal(item.price - (item.price * (item.discountPercent / 100))));
    }
    return parseFloat(roundDecimal(item.price));
  };

  return (
    <>
      <div className="relative">
        <button type="button" onClick={openModal} aria-label="Cart">
          <BagIcon extraClass="h-8 w-8 sm:h-6 sm:w-6" />
          {noOfItems > 0 && (
            <span
              className={`${animate} absolute text-xs -top-3 bg-gray500 text-gray100 py-1 px-2 rounded-full`}
            >
              {noOfItems}
            </span>
          )}
        </button>
      </div>
      <Transition show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          style={{ zIndex: 99999 }}
          static
          open={open}
          onClose={closeModal}
        >
          <div className="min-h-screen text-right">
            <Transition.Child
              as={Fragment}
              //   enter="ease-out duration-300"
              //   enterFrom="opacity-0"
              //   enterTo="opacity-100"
              //   leave="ease-in duration-200"
              //   leaveFrom="opacity-100"
              //   leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray500 opacity-50" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            {/* <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span> */}
            <Transition.Child
              as={Fragment}
              enter="ease-linear duration-600"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-linear duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div
                style={{ height: "100vh" }}
                className="relative inline-block dur h-screen w-full max-w-md overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl"
              >
                <div className="bg-lightgreen flex justify-between items-center p-6">
                  <h3 className="text-xl">
                    {t("cart")} ({noOfItems})
                  </h3>
                  <button
                    type="button"
                    className="outline-none focus:outline-none text-3xl sm:text-2xl"
                    onClick={closeModal}
                  >
                    &#10005;
                  </button>
                </div>

                <div className="h-full">
                  <div className="itemContainer px-4 h-2/3 w-full flex-grow flex-shrink overflow-y-auto">
                    {cart.map((item) => {
                      const discountedPrice = getDiscountedPrice(item);
                      subtotal += discountedPrice * item.quantity!;
                      return (
                        <div 
                          className="w-full min-h-40 flex flex-col sm:flex-row justify-between items-center px-2 my-2 border-b-2 border-gray100 pb-2"
                          key={item.productId + (item.selectedColor?.colorCode || '') + (item.size || '')}
                        >
                          <div className="flex flex-col sm:flex-row items-center">
                            <Link href={`/products/${encodeURIComponent(item.productId)}`}>
                              <a>
                                <Image
                                  src={getProductImage(item)}
                                  alt={item.name}
                                  width={80}
                                  height={100}
                                  className="object-contain"
                                />
                              </a>
                            </Link>
                            <div className="flex flex-col items-start ml-2">
                              <Link href={`/products/${encodeURIComponent(item.productId)}`}>
                                <a className="text-gray400 text-xl font-bold">{item.name}</a>
                              </Link>
                              <div className="text-gray400 text-base">
                                {item.discountPercent && item.discountPercent > 0 ? (
                                  <div className="flex items-center">
                                    <span className="line-through mr-2">{formatPrice(item.price)}</span>
                                    <span className="text-red-500">{formatPrice(discountedPrice)}</span>
                                    <span className="ml-2 text-xs bg-red-500 text-white px-1 py-0.5 rounded">
                                      -{item.discountPercent}%
                                    </span>
                                  </div>
                                ) : (
                                  <>{t("price")}: {formatPrice(item.price)}</>
                                )}
                              </div>
                              {/* Hiển thị thông tin màu sắc đã chọn */}
                              {item.selectedColor && (
                                <div className="flex items-center mt-1">
                                  <span className="text-gray400 text-sm">
                                    {t("color")}: {item.selectedColor.colorName}
                                  </span>
                                  {item.selectedColor.colorCode && (
                                    <div
                                      className="ml-2 w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: item.selectedColor.colorCode }}
                                    ></div>
                                  )}
                                </div>
                              )}
                              {/* Hiển thị thông tin kích thước đã chọn */}
                              {item.size && (
                                <div className="text-gray400 text-sm">
                                  {t("size")}: {item.size}
                                </div>
                              )}
                              {/* Lưu selectedImageId để gửi xuống backend */}
                              <input type="hidden" value={item.selectedImageId || ''} />
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-center">
                              <div className="text-base text-gray400 mb-2">
                                {t("quantity")}:
                              </div>
                              <div className="flex justify-center items-center">
                                <button
                                  type="button"
                                  onClick={() => removeItem!(item)}
                                  className="w-8 h-8 border border-gray300 text-gray500"
                                >
                                  -
                                </button>
                                <div className="w-8 h-8 border-t border-b border-gray300 flex justify-center items-center text-gray500">
                                  {item.quantity}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => addOne!(item)}
                                  className="w-8 h-8 border border-gray300 text-gray500"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="text-center mt-2">
                              <div className="text-base text-gray400 mb-2">
                                {t("subtotal")}:
                              </div>
                              <div className="text-gray400 font-bold">
                                {formatPrice(roundDecimal(discountedPrice * item!.quantity!))}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteItem!(item)}
                              className="text-xs text-red mt-2 font-bold"
                            >
                              {t("remove")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="btnContainer mt-4 px-4 h-1/3 mb-20 w-full flex flex-col ">
                    <div className="flex justify-between">
                      <span>{t("subtotal")}</span>
                      <span>{formatPrice(roundDecimal(subtotal))}</span>
                    </div>
                    <LinkButton
                      href="/shopping-cart"
                      extraClass="my-4"
                      noBorder={false}
                      inverted={false}
                    >
                      {t("view_cart")}
                    </LinkButton>
                    <Button
                      value={t("checkout")}
                      onClick={() => router.push(`/checkout`)}
                      disabled={cart.length < 1 ? true : false}
                      extraClass="text-center"
                      size="lg"
                    />
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
