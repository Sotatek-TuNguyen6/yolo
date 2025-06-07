import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { useTranslations } from "next-intl";
import axios from "axios";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { useRouter } from "next/router";

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

// install Swiper modules
SwiperCore.use([Pagination, Navigation]);

type Props = {
  product: itemType;
  products: itemType[];
};

const Product: React.FC<Props> = ({ product, products }) => {
  const { addItem } = useCart();
  const { wishlist, addToWishlist, deleteWishlistItem } = useWishlist();
  const [size, setSize] = useState("M");
  const [currentQty, setCurrentQty] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const t = useTranslations("Category");
  const router = useRouter();
  const { locale } = router;

  useEffect(() => {
    setSelectedColorIndex(0);
  }, [product]);

  const handleSize = (value: string) => {
    console.log(`Size selected: ${value}`);
    setSize(value);
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

  // Lọc ảnh theo màu đã chọn
  const filteredImages = product.images.filter(
    (img) => img.colorCode === uniqueColors[selectedColorIndex]?.colorCode
  );

  // Lấy thông tin màu đã chọn
  const selectedColor = uniqueColors[selectedColorIndex];

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

  // Tính tổng số lượng còn lại của màu đang chọn
  const colorStock = filteredImages.reduce(
    (sum, img) => sum + (img.quantity ?? 0), // hoặc img.stock, img.qty tùy backend
    0
  );

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    // Kiểm tra xem có còn hàng không
    if (colorStock <= 0) {
      alert("Sản phẩm đã hết hàng với màu sắc này!");
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
      quantity: currentQty
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
            <style jsx global>{`
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
                startIndex={0}
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
                  {formatPrice(product.price - (product.price * (product.discountPercent / 100)))}
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
            <span className="mb-2">
              {t("availability")}:{" "}
              {colorStock > 0 ? (
                colorStock
              ) : (
                <span className="text-red-500">Hết hàng</span>
              )}
            </span>

            {/* Color options */}
            {uniqueColors.length > 1 && (
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
                {/* <div className="mb-2 text-sm text-gray-500">
                  Số lượng còn lại: <span className="font-semibold">{colorStock}</span>
                </div> */}
              </div>
            )}

            <span className="mb-2">
              {t("size")}: {size}
            </span>
            <div className="sizeContainer flex space-x-4 text-sm mb-4">
              <div
                onClick={() => handleSize("S")}
                className={`w-8 h-8 flex items-center justify-center border ${
                  size === "S"
                    ? "border-gray500"
                    : "border-gray300 text-gray400"
                } cursor-pointer hover:bg-gray500 hover:text-gray100`}
              >
                S
              </div>
              <div
                onClick={() => handleSize("M")}
                className={`w-8 h-8 flex items-center justify-center border ${
                  size === "M"
                    ? "border-gray500"
                    : "border-gray300 text-gray400"
                } cursor-pointer hover:bg-gray500 hover:text-gray100`}
              >
                M
              </div>
              <div
                onClick={() => handleSize("L")}
                className={`w-8 h-8 flex items-center justify-center border ${
                  size === "L"
                    ? "border-gray500"
                    : "border-gray300 text-gray400"
                } cursor-pointer hover:bg-gray500 hover:text-gray100`}
              >
                L
              </div>
            </div>
            <div className="addToCart flex flex-col sm:flex-row md:flex-col lg:flex-row space-y-4 sm:space-y-0 mb-4">
              <div className="plusOrMinus h-12 flex border justify-center border-gray300 divide-x-2 divide-gray300 mb-4 mr-0 sm:mr-4 md:mr-0 lg:mr-4">
                <div
                  onClick={() => setCurrentQty((prevState) => prevState - 1)}
                  className={`${
                    currentQty === 1 && "pointer-events-none"
                  } h-full w-full sm:w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100`}
                >
                  -
                </div>
                <div className="h-full w-28 sm:w-12 flex justify-center items-center pointer-events-none">
                  {currentQty}
                </div>
                <div
                  onClick={() => setCurrentQty((prevState) => prevState + 1)}
                  className="h-full w-full sm:w-12 flex justify-center items-center cursor-pointer hover:bg-gray500 hover:text-gray100"
                >
                  +
                </div>
              </div>
              <div className="flex h-12 space-x-4 w-full">
                <Button
                  value={t("add_to_cart")}
                  size="lg"
                  extraClass={`flex-grow text-center whitespace-nowrap ${
                    colorStock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleAddToCart}
                  disabled={colorStock <= 0}
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
