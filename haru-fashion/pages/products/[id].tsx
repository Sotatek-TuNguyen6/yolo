import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { Disclosure, Dialog, Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";
import axios from "axios";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { useRouter } from "next/router";
import { Fragment } from "react";

import Heart from "../../public/icons/Heart";
import DownArrow from "../../public/icons/DownArrow";
import FacebookLogo from "../../public/icons/FacebookLogo";
import InstagramLogo from "../../public/icons/InstagramLogo";
import LeftArrow from "../../public/icons/LeftArrow";
import RightArrow from "../../public/icons/RightArrow";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GhostButton from "../../components/Buttons/GhostButton";
import Button from "../../components/Buttons/Button";
import Card from "../../components/Card/Card";

// swiperjs
import { Swiper, SwiperSlide } from "swiper/react";

// import Swiper core and required modules
import SwiperCore, { Pagination, Navigation } from "swiper/core";
import { apiProductsType, itemType } from "../../context/cart/cart-types";
import { useWishlist } from "../../context/wishlist/WishlistProvider";
import { itemType as WishlistItemType } from "../../context/wishlist/wishlist-type";
import { useCart } from "../../context/cart/CartProvider";
import HeartSolid from "../../public/icons/HeartSolid";

import chonSize from "../../public/bg-img/huong_dan_chon_size.jpeg";

// install Swiper modules
SwiperCore.use([Pagination, Navigation]);

// SizeQuantity interface - phù hợp với backend
interface SizeQuantity {
  size: string;
  quantity: number;
}

type Props = {
  product: itemType;
  products: itemType[];
};

const Product: React.FC<Props> = ({ product, products }) => {
  const { addItem } = useCart();
  const { wishlist, addToWishlist, deleteWishlistItem } = useWishlist();
  const [size, setSize] = useState("");
  const [currentQty, setCurrentQty] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [availableSizes, setAvailableSizes] = useState<SizeQuantity[]>([]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const t = useTranslations("Category");
  const router = useRouter();
  const { locale } = router;

  useEffect(() => {
    setSelectedColorIndex(0);
  }, [product]);

  // Xử lý khi người dùng chọn kích thước
  const handleSize = (value: string) => {
    console.log(`Size selected: ${value}`);
    setSize(value);

    // Reset số lượng khi chọn kích thước mới
    setCurrentQty(1);
  };

  // Tạo mảng các màu sắc duy nhất từ images
  const uniqueColors = Array.from(
    new Set(product.images.map((img) => img.colorCode))
  ).map((colorCode) => {
    const img = product.images.find((img) => img.colorCode === colorCode);
    return {
      colorCode,
      color: img?.color || "",
    };
  });
  console.log("uniqueColors", uniqueColors);

  // Lọc ảnh theo màu đã chọn
  const filteredImages = product.images.filter(
    (img) => img.colorCode === uniqueColors[selectedColorIndex]?.colorCode
  );

  // Lấy thông tin màu đã chọn
  const selectedColor = uniqueColors[selectedColorIndex];

  // Lấy thông tin kích thước và số lượng từ màu đã chọn
  useEffect(() => {
    if (filteredImages.length > 0) {
      // Lấy sizeQuantities từ hình ảnh đầu tiên của màu đã chọn
      const sizeQtyArray = filteredImages[0].sizeQuantities || [];
      setAvailableSizes(sizeQtyArray);

      // Chọn size đầu tiên có sẵn nếu chưa chọn hoặc size đã chọn không có trong danh sách
      if (!size || !sizeQtyArray.some((sq) => sq.size === size)) {
        const firstAvailableSize =
          sizeQtyArray.find((sq) => sq.quantity > 0)?.size ||
          (sizeQtyArray.length > 0 ? sizeQtyArray[0].size : "");
        setSize(firstAvailableSize);
      }
    } else {
      setAvailableSizes([]);
      setSize("");
    }
  }, [filteredImages, selectedColorIndex]);

  // Kiểm tra số lượng tồn kho của kích thước đã chọn
  const selectedSizeQuantity = availableSizes.find((sq) => sq.size === size);
  const stockForSelectedSize = selectedSizeQuantity?.quantity || 0;

  // Đảm bảo số lượng không vượt quá tồn kho
  useEffect(() => {
    if (currentQty > stockForSelectedSize) {
      setCurrentQty(stockForSelectedSize > 0 ? stockForSelectedSize : 1);
    }
  }, [stockForSelectedSize, currentQty]);

  // Chuyển đổi item từ cart-types sang wishlist-types
  const wishlistItem: WishlistItemType = {
    id: product.productId,
    name: product.name,
    price: product.price,
    images: product.images,
    selectedColor: {
      colorCode: selectedColor?.colorCode || "",
      colorName: selectedColor?.color || "",
    },
    size: size,
    cartImage:
      filteredImages.length > 0
        ? Array.isArray(filteredImages[0].url)
          ? filteredImages[0].url[0]
          : filteredImages[0].url
        : Array.isArray(product.images[0].url)
        ? product.images[0].url[0]
        : product.images[0].url,
  };

  const alreadyWishlisted = wishlist.some((wItem) => {
    // Nếu có màu sắc đã chọn, kiểm tra cả id và màu
    if (selectedColor && wItem.selectedColor) {
      return (
        wItem.id === product.productId &&
        wItem.selectedColor.colorCode === selectedColor.colorCode
      );
    }
    // Nếu không có màu sắc, chỉ kiểm tra id
    return wItem.id === product.productId;
  });

  // Cập nhật currentItem để bao gồm thông tin màu sắc đã chọn
  const currentItem = {
    ...product,
    qty: currentQty,
    selectedColor: {
      colorCode: selectedColor?.colorCode || "",
      colorName: selectedColor?.color || "",
    },
    size: size,
    // Chỉ lấy hình ảnh của màu đã chọn
    selectedImages: filteredImages,
  };

  const handleWishlist = () => {
    alreadyWishlisted
      ? deleteWishlistItem!(wishlistItem)
      : addToWishlist!(wishlistItem);
  };

  // Thêm useEffect để theo dõi khi màu được chọn thay đổi
  useEffect(() => {
    if (uniqueColors.length > 0) {
      // Tìm index của hình ảnh đầu tiên có màu được chọn
      const selectedColorCode = uniqueColors[selectedColorIndex]?.colorCode;
      const firstImageIndex = product.images.findIndex(
        (img) => img.colorCode === selectedColorCode
      );

      // Nếu tìm thấy, cập nhật startIndex cho ImageGallery
      if (firstImageIndex !== -1) {
        setCurrentImageIndex(firstImageIndex);
      }
    }
  }, [selectedColorIndex, uniqueColors, product.images]);

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    // Kiểm tra xem có còn hàng không
    if (!selectedSizeQuantity || stockForSelectedSize <= 0) {
      alert("Sản phẩm đã hết hàng với kích thước này!");
      return;
    }

    // Kiểm tra số lượng mua không vượt quá tồn kho
    if (currentQty > stockForSelectedSize) {
      alert(`Chỉ còn ${stockForSelectedSize} sản phẩm với kích thước này!`);
      setCurrentQty(stockForSelectedSize);
      return;
    }

    // Lấy thông tin hình ảnh của màu đã chọn
    const selectedImageInfo =
      filteredImages.length > 0 ? filteredImages[0] : product.images[0];

    // Log thông tin sản phẩm được thêm vào giỏ hàng
    console.log("Adding to cart:", {
      productId: product.productId,
      name: product.name,
      color: selectedColor?.color,
      colorCode: selectedColor?.colorCode,
      size: size,
      quantity: currentQty,
    });

    // Thêm sản phẩm vào giỏ hàng với thông tin màu sắc và kích thước đã chọn
    addItem!({
      ...product,
      quantity: currentQty,
      selectedColor: {
        colorCode: selectedColor?.colorCode || "",
        colorName: selectedColor?.color || "",
      },
      size: size, // Ensure size is explicitly set
      // Lưu _id của hình ảnh
      selectedImageId: selectedImageInfo._id,
      // Chỉ lưu hình ảnh đầu tiên của màu đã chọn để hiển thị trong giỏ hàng
      cartImage: Array.isArray(selectedImageInfo.url)
        ? selectedImageInfo.url[0]
        : selectedImageInfo.url,
      discountPercent: product.discountPercent,
    });
  };

  // Chuẩn bị dữ liệu cho ImageGallery
  const galleryImages = filteredImages
    .map((image) =>
      Array.isArray(image.url)
        ? image.url.map((url: string) => ({
            original: url,
            thumbnail: url,
            originalAlt: product.name,
            thumbnailAlt: product.name,
          }))
        : [
            {
              original: image.url,
              thumbnail: image.url,
              originalAlt: product.name,
              thumbnailAlt: product.name,
            },
          ]
    )
    .flat();

  // Custom navigation buttons
  const renderLeftNav = (
    onClick: React.MouseEventHandler<HTMLElement>,
    disabled: boolean
  ) => {
    return (
      <button
        className={`image-gallery-custom-left-nav absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md z-10 hover:bg-opacity-100 transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={onClick}
        disabled={disabled}
      >
        <LeftArrow size="sm" />
      </button>
    );
  };

  const renderRightNav = (
    onClick: React.MouseEventHandler<HTMLElement>,
    disabled: boolean
  ) => {
    return (
      <button
        className={`image-gallery-custom-right-nav absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md z-10 hover:bg-opacity-100 transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={onClick}
        disabled={disabled}
      >
        <RightArrow />
      </button>
    );
  };

  // Helper function to format price based on locale
  const formatPrice = (price: number) => {
    if (locale === "vi") {
      return `${new Intl.NumberFormat("vi-VN").format(price)}\u00A0₫`;
    } else {
      return `$\u00A0${price}`;
    }
  };

  return (
    <div>
      {/* ===== Head Section ===== */}
      <Header title={`${product.name} - Lumen Fashion`} />

      {/* Size Guide Modal */}
      <Transition appear show={isSizeGuideOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsSizeGuideOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-4xl p-4 md:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex justify-between items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {locale === 'vi' ? 'Hướng dẫn chọn size' : 'Size Guide'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray500 hover:text-gray700 focus:outline-none"
                    onClick={() => setIsSizeGuideOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4">
                  <div className="relative w-full" style={{ height: "60vh" }}>
                    <Image
                      src={chonSize}
                      alt="Size Guide"
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <main id="main-content">
        {/* ===== Breadcrumb Section ===== */}
        <div className="bg-lightgreen h-16 w-full flex items-center border-t-2 border-gray200">
          <div className="app-x-padding app-max-width w-full">
            <div className="breadcrumb">
              <Link href="/">
                <a className="text-gray400">{t("home")}</a>
              </Link>{" "}
              /{" "}
              <Link href={`/product-category/${product.categoryName}`}>
                <a className="text-gray400 capitalize">
                  {t(product.categoryName as string)}
                </a>
              </Link>{" "}
              / <span>{product.name}</span>
            </div>
          </div>
        </div>
        {/* ===== Main Content Section ===== */}
        <div className="itemSection app-max-width app-x-padding flex flex-col md:flex-row">
          <div className="imgSection w-full md:w-1/2 h-full">
            {/* Custom styles for ImageGallery */}
            <style >{`
              .image-gallery-thumbnails-wrapper.left {
                width: 80px;
              }
              .image-gallery-thumbnails {
                padding: 0;
              }
              .image-gallery-thumbnail {
                width: 80px;
                border: 2px solid #e5e7eb !important;
                margin-bottom: 8px;
                background: #fff;
                border-radius: 8px;
              }
              .image-gallery-thumbnail.active {
                border: 2px solid #555 !important;
              }
              .image-gallery-slide-wrapper.left {
                margin-left: 80px;
              }
              .image-gallery-content:not(.fullscreen) .image-gallery-slide img {
                max-height: 720px;
                object-fit: contain;
              }
              .image-gallery-content {
                margin-bottom: 20px;
              }
              @media (max-width: 768px) {
                .image-gallery-thumbnails-wrapper.left {
                  display: none;
                }
                .image-gallery-slide-wrapper.left {
                  margin-left: 0;
                }
              }
              .image-gallery-slide img,
              .each-slide {
                width: 100% !important;
                height: 500px !important; /* hoặc chiều cao bạn muốn, ví dụ 500px */
                object-fit: contain !important; /* hoặc cover nếu muốn ảnh luôn lấp đầy khung */
                background: #fff;
                display: block;
                margin: 0 auto;
              }
            `}</style>

            {/* ImageGallery component */}
            <div className="hidden sm:block">
              <ImageGallery
                items={galleryImages}
                showPlayButton={false}
                showFullscreenButton={false}
                thumbnailPosition="left"
                slideDuration={300}
                showNav={true}
                showBullets={true}
                renderLeftNav={renderLeftNav}
                renderRightNav={renderRightNav}
                startIndex={currentImageIndex}
                key={selectedColorIndex}
              />
            </div>

            {/* Mobile view - Swiper */}
            <div className="sm:hidden">
              <Swiper
                slidesPerView={1}
                spaceBetween={0}
                loop={true}
                pagination={{
                  clickable: true,
                }}
                className="mySwiper"
              >
                {filteredImages.map((image, index) =>
                  Array.isArray(image.url) ? (
                    image.url.map((url: string, idx: number) => (
                      <SwiperSlide key={image._id + "-" + idx}>
                        <Image
                          className="each-slide w-full"
                          src={url}
                          width={1000}
                          height={1282}
                          alt={`${product.name} - ${index}-${idx}`}
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide key={image._id}>
                      <Image
                        className="each-slide w-full"
                        src={image.url}
                        width={1000}
                        height={1282}
                        alt={`${product.name} - ${index}`}
                      />
                    </SwiperSlide>
                  )
                )}
              </Swiper>
            </div>
          </div>
          <div className="infoSection w-full md:w-1/2 h-auto py-8 sm:pl-4 flex flex-col">
            <h1 className="text-3xl mb-4">{product.name}</h1>
            {product.discountPercent && product.discountPercent > 0 ? (
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl text-gray400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-2xl text-red-500">
                  {formatPrice(
                    product.price -
                      product.price * (product.discountPercent / 100)
                  )}
                </span>
                <span className="bg-red-500 text-white px-2 py-1 text-sm font-medium rounded">
                  -{product.discountPercent}%
                </span>
              </div>
            ) : (
              <span className="text-2xl text-gray400 mb-2">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="mb-2 text-justify">{product.description}</span>

            {/* Color options */}
            {uniqueColors.length > 0 && (
              <div className="mb-4">
                <span className="mb-2 block">
                  {t("color")}: {selectedColor?.color || ""}
                </span>
                <div className="flex space-x-2">
                  {uniqueColors.map((colorItem, index) => (
                    <button
                      key={colorItem.colorCode}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColorIndex === index
                          ? "border-gray500"
                          : colorItem.colorCode.toLowerCase() === "#ffffff" ||
                            colorItem.colorCode.toLowerCase() === "#fff"
                          ? "border-gray300"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: colorItem.colorCode }}
                      onClick={() => handleColorSelect(index)}
                      aria-label={`Select ${colorItem.color} color`}
                      title={colorItem.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size options */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  {t("size")}: {size || ""}
                </span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-sm bg-gray100 hover:bg-gray200 text-gray600 hover:text-gray800 py-1 px-2 rounded flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {locale === 'vi' ? 'Bảng size' : 'Size Guide'}
                </button>
              </div>
              <div className="sizeContainer flex flex-wrap gap-2 text-sm">
                {availableSizes.map((sizeQty) => (
                  <div
                    key={sizeQty.size}
                    onClick={() =>
                      sizeQty.quantity > 0 ? handleSize(sizeQty.size) : null
                    }
                    className={`relative px-3 py-2 flex flex-col items-center justify-center border rounded ${
                      size === sizeQty.size
                        ? "border-gray500 bg-gray-50"
                        : sizeQty.quantity > 0
                        ? "border-gray300 text-gray400 hover:border-gray500"
                        : "border-gray200 text-gray300 cursor-not-allowed bg-gray-50"
                    } cursor-pointer`}
                  >
                    <span className="font-medium">{sizeQty.size}</span>
                    <span
                      className={`text-xs mt-1 ${
                        sizeQty.quantity > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {sizeQty.quantity > 0
                        ? `Còn ${sizeQty.quantity}`
                        : "Hết hàng"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability */}
            {size && (
              <span className="mb-4 block">
                {t("availability")}:{" "}
                {stockForSelectedSize > 0 ? (
                  <span className="text-green-600 font-medium">
                    {stockForSelectedSize} sản phẩm
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Hết hàng</span>
                )}
              </span>
            )}

            <div className="addToCart flex flex-col sm:flex-row md:flex-col lg:flex-row space-y-4 sm:space-y-0 mb-4">
              <div className="plusOrMinus h-12 flex border justify-center border-gray300 divide-x-2 divide-gray300 mb-4 mr-0 sm:mr-4 md:mr-0 lg:mr-4">
                <div
                  onClick={() =>
                    setCurrentQty((prevState) => Math.max(1, prevState - 1))
                  }
                  className={`${
                    currentQty === 1 || stockForSelectedSize <= 0
                      ? "pointer-events-none opacity-50"
                      : ""
                  } h-full w-full sm:w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100`}
                >
                  -
                </div>
                <div className="h-full w-28 sm:w-12 flex justify-center items-center pointer-events-none">
                  {currentQty}
                </div>
                <div
                  onClick={() =>
                    setCurrentQty((prevState) =>
                      Math.min(stockForSelectedSize, prevState + 1)
                    )
                  }
                  className={`${
                    currentQty >= stockForSelectedSize ||
                    stockForSelectedSize <= 0
                      ? "pointer-events-none opacity-50"
                      : ""
                  } h-full w-full sm:w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100`}
                >
                  +
                </div>
              </div>
              <div className="flex h-12 space-x-4 w-full">
                <Button
                  value={t("add_to_cart")}
                  size="lg"
                  extraClass={`flex-grow text-center whitespace-nowrap ${
                    stockForSelectedSize <= 0 || !size
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={handleAddToCart}
                  disabled={stockForSelectedSize <= 0 || !size}
                />
                <GhostButton onClick={handleWishlist}>
                  {alreadyWishlisted ? (
                    <HeartSolid extraClass="inline" />
                  ) : (
                    <Heart extraClass="inline" />
                  )}
                </GhostButton>
              </div>
            </div>
            <Disclosure>
              {({ open }) => (
                <>
                  <Disclosure.Button className="py-2 focus:outline-none text-left mb-4 border-b-2 border-gray200 flex items-center justify-between">
                    <span>{t("details")}</span>
                    <DownArrow
                      extraClass={`${
                        open ? "" : "transform rotate-180"
                      } w-5 h-5 text-purple-500`}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel
                    className={`text-gray400 animate__animated animate__bounceIn`}
                  >
                    {product.detail}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
            <div className="flex items-center space-x-4 mt-4">
              <span>{t("share")}</span>
              <FacebookLogo extraClass="h-4 cursor-pointer text-gray400 hover:text-gray500" />
              <InstagramLogo extraClass="h-4 cursor-pointer text-gray400 hover:text-gray500" />
            </div>
          </div>
        </div>
        {/* ===== Horizontal Divider ===== */}
        <div className="border-b-2 border-gray200"></div>

        {/* ===== You May Also Like Section ===== */}
        <div className="recSection my-8 app-max-width app-x-padding">
          <h2 className="text-3xl mb-6">{t("you_may_also_like")}</h2>
          <Swiper
            slidesPerView={2}
            // centeredSlides={true}
            spaceBetween={10}
            loop={true}
            grabCursor={true}
            pagination={{
              clickable: true,
              type: "bullets",
            }}
            className="mySwiper card-swiper sm:hidden"
          >
            {products.map((item) => (
              <SwiperSlide key={item.productId}>
                <div className="mb-6">
                  <Card key={item.productId} item={item} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-10 sm:gap-y-6 mb-10">
            {products.map((item) => (
              <Card key={item.productId} item={item} />
            ))}
          </div>
        </div>
      </main>

      {/* ===== Footer Section ===== */}
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  locale,
}) => {
  const paramId = params!.id as string;
  let fetchedProduct: apiProductsType;
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/${paramId}?include=category`
    );
    fetchedProduct = res.data.data;
  } catch (error) {
    return {
      notFound: true,
    };
  }

  console.log(fetchedProduct);
  if (!fetchedProduct.category) {
    return {
      notFound: true,
    };
  }

  let product: itemType = {
    _id: fetchedProduct._id,
    productId: fetchedProduct.productId,
    name: fetchedProduct.name,
    price: fetchedProduct.price,
    detail: fetchedProduct.detail,
    images: fetchedProduct.images,
    categoryName: fetchedProduct.category.name,
    discountPercent: fetchedProduct.discountPercent,
  };

  // Might be temporary solution for suggested products
  const randomProductRes = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products?category=${product.categoryName}`
  );
  const fetchedProducts: apiProductsType[] = randomProductRes.data.data;

  // Shuffle array
  const shuffled = fetchedProducts.sort(() => 0.5 - Math.random());

  // Get sub-array of first 5 elements after shuffled
  let randomFetchedProducts = shuffled.slice(0, 5);

  let products: itemType[] = [];
  randomFetchedProducts.forEach((randomProduct: apiProductsType) => {
    products.push({
      _id: randomProduct._id,
      productId: randomProduct.productId,
      name: randomProduct.name,
      price: randomProduct.price,
      images: randomProduct.images,
      tags: randomProduct.tags,
      discountPercent: randomProduct.discountPercent,
    });
  });

  // Pass data to the page via props
  return {
    props: {
      product,
      products,
      messages: (await import(`../../messages/common/${locale}.json`)).default,
    },
  };
};

export default Product;
