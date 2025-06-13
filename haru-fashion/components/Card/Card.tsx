import { FC, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import Heart from "../../public/icons/Heart";
import styles from "./Card.module.css";
import HeartSolid from "../../public/icons/HeartSolid";
import { itemType } from "../../context/cart/cart-types";
import { useCart } from "../../context/cart/CartProvider";
import { useWishlist } from "../../context/wishlist/WishlistProvider";
import { itemType as WishlistItemType } from "../../context/wishlist/wishlist-type";

type Props = {
  item: itemType;
};

const Card: FC<Props> = ({ item }) => {
  const t = useTranslations("CartWishlist");
  const router = useRouter();
  const { locale } = router;
  const { wishlist, addToWishlist, deleteWishlistItem } = useWishlist();
  const { addOne } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWLHovered, setIsWLHovered] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { name, price, discountPercent, images, productId, tags, slug } = item;

  const itemLink = `/products/${encodeURIComponent(slug || productId)}`;

  // Tạo mảng các màu sắc duy nhất từ images
  const uniqueColors = Array.from(
    new Set(images.map((img) => img.colorCode))
  ).map((colorCode) => {
    const img = images.find((img) => img.colorCode === colorCode);
    return {
      colorCode,
      color: img?.color || "",
    };
  });

  // Lấy ảnh theo màu đã chọn
  const selectedImage =
    images.find(
      (img) => img.colorCode === uniqueColors[selectedColorIndex]?.colorCode
    ) || images[0];

  // Lấy thông tin màu đã chọn
  const selectedColor = uniqueColors[selectedColorIndex];

  // Lấy danh sách size từ ảnh đã chọn
  const availableSizes = selectedImage.sizeQuantities || [];
  const selectedSize = availableSizes[selectedSizeIndex] || "";

  // Chuyển đổi item từ cart-types sang wishlist-types với thông tin màu sắc đã chọn
  const wishlistItem: WishlistItemType = {
    id: productId,
    name,
    price,
    images,
    selectedColor: {
      colorCode: selectedColor?.colorCode || "",
      colorName: selectedColor?.color || "",
    },
    selectedImageId: selectedImage._id,
    size: selectedSize.size,
    cartImage: Array.isArray(selectedImage.url)
      ? selectedImage.url[0]
      : selectedImage.url,
  };

  const alreadyWishlisted = wishlist.some((wItem) => {
    // Nếu có màu sắc đã chọn, kiểm tra cả id và màu
    if (selectedColor && wItem.selectedColor) {
      return (
        wItem.id === productId &&
        wItem.selectedColor.colorCode === selectedColor.colorCode
      );
    }
    // Nếu không có màu sắc, chỉ kiểm tra id
    return wItem.id === productId;
  });

  const handleWishlist = () => {
    alreadyWishlisted
      ? deleteWishlistItem!(wishlistItem)
      : addToWishlist!(wishlistItem);
  };

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);

    // Find the first available size with stock after color change
    const newImage =
      images.find((img) => img.colorCode === uniqueColors[index]?.colorCode) ||
      images[0];

    const newSizes = newImage.sizeQuantities || [];
    const firstInStockSizeIndex = newSizes.findIndex(
      (size) => size.quantity > 0
    );

    // Set to first in-stock size or 0 if all are out of stock
    setSelectedSizeIndex(
      firstInStockSizeIndex >= 0 ? firstInStockSizeIndex : 0
    );

    setIsImageLoaded(false); // Reset trạng thái load khi đổi màu
  };

  const handleSizeSelect = (index: number) => {
    setSelectedSizeIndex(index);
  };

  // Helper function to format price based on locale
  const formatPrice = (price: number) => {
    if (locale === "vi") {
      return `${new Intl.NumberFormat("vi-VN").format(price)} ₫`;
    } else {
      return `$ ${price}`;
    }
  };

  // Calculate discounted price if discount is available
  const hasDiscount = !!discountPercent && discountPercent > 0;
  const discountedPrice = hasDiscount
    ? price - price * (discountPercent / 100)
    : price;

  // Check if selected size is out of stock
  const selectedSizeOutOfStock =
    availableSizes.length > 0 &&
    availableSizes[selectedSizeIndex] &&
    availableSizes[selectedSizeIndex].quantity <= 0;

  // Find and select the first in-stock size on initial render
  useEffect(() => {
    if (availableSizes.length > 0) {
      const firstInStockSizeIndex = availableSizes.findIndex(
        (size) => size.quantity > 0
      );
      if (firstInStockSizeIndex >= 0) {
        setSelectedSizeIndex(firstInStockSizeIndex);
      }
    }
  }, []);

  // Update selected size when availableSizes changes (when color changes)
  useEffect(() => {
    if (availableSizes.length > 0) {
      const firstInStockSizeIndex = availableSizes.findIndex(
        (size) => size.quantity > 0
      );
      if (firstInStockSizeIndex >= 0 && selectedSizeOutOfStock) {
        setSelectedSizeIndex(firstInStockSizeIndex);
      }
    }
  }, [selectedImage._id, availableSizes, selectedSizeOutOfStock]);

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {tags &&
          tags.length > 0 &&
          tags.map((tag) => (
            <div
              key={tag._id}
              className="absolute top-2 left-2 z-10 bg-white px-2 py-1 text-xs font-medium"
            >
              {tag.name}
            </div>
          ))}
        {hasDiscount && (
          <div className="absolute top-2 right-8 z-10 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
            -{discountPercent}%
          </div>
        )}
        <Link href={itemLink}>
          <a
            tabIndex={-1}
            onMouseOver={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative">
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              <Image
                className={`transition-transform duration-500 ${
                  isHovered ? "" : "transform scale-150"
                }`}
                src={selectedImage.url[0]}
                alt={name}
                width={230}
                height={300}
                layout="responsive"
                loading="lazy"
                onLoadingComplete={() => setIsImageLoaded(true)}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjMwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjJmMmYyIi8+PC9zdmc+"
              />
            </div>
          </a>
        </Link>
        <button
          type="button"
          className="absolute top-2 right-2 p-1 rounded-full"
          aria-label="Wishlist"
          onClick={handleWishlist}
          onMouseOver={() => setIsWLHovered(true)}
          onMouseLeave={() => setIsWLHovered(false)}
        >
          {isWLHovered || alreadyWishlisted ? <HeartSolid /> : <Heart />}
        </button>
        <button
          type="button"
          onClick={() =>
            addOne!({
              ...item,
              selectedColor: {
                colorCode: selectedColor?.colorCode || "",
                colorName: selectedColor?.color || "",
              },
              selectedImageId: selectedImage._id,
              cartImage: Array.isArray(selectedImage.url)
                ? selectedImage.url[0]
                : selectedImage.url,
              size: selectedSize.size,
              quantity: 1,
            })
          }
          className={`${styles.addBtn} ${
            selectedSizeOutOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={selectedSizeOutOfStock}
          title={
            selectedSizeOutOfStock
              ? `Size ${selectedSize.size} đã hết hàng`
              : t("add_to_cart")
          }
        >
          {selectedSizeOutOfStock
            ? t("out_of_stock") || "Hết hàng"
            : t("add_to_cart")}
        </button>
      </div>

      <div className={styles.content}>
        <Link href={itemLink}>
          <a className={styles.itemName}>{name}</a>
        </Link>
        <div className="flex items-center space-x-2">
          {hasDiscount ? (
            <>
              <span className="text-gray-400line-through">
                {formatPrice(price)}
              </span>
              <span className="text-red-500 font-medium">
                {formatPrice(discountedPrice)}
              </span>
            </>
          ) : (
            <span className="text-gray-400">{formatPrice(price)}</span>
          )}
        </div>

        {/* Size information */}
        {images.length > 0 && availableSizes.length > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-600 mb-1">{t("size")}:</div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size, index) => {
                const isOutOfStock = size.quantity <= 0;
                return (
                  <button
                    key={size.size}
                    type="button"
                    className={`min-w-6 h-6 px-2 flex items-center justify-center border text-xs ${
                      selectedSizeIndex === index && !isOutOfStock
                        ? "ring-2 ring-offset-1 ring-gray-500 font-medium bg-gray-100"
                        : isOutOfStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 relative"
                        : "bg-white"
                    }`}
                    onClick={() => !isOutOfStock && handleSizeSelect(index)}
                    aria-label={`Select size ${size.size}${
                      isOutOfStock ? " (out of stock)" : ""
                    }`}
                    disabled={isOutOfStock}
                    title={isOutOfStock ? `${size.size} - Hết hàng` : size.size}
                  >
                    {size.size}
                    {isOutOfStock && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-0.5 bg-gray-400 absolute transform rotate-45"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Color options */}
        {uniqueColors.length > 1 && (
          <div className="flex mt-2 space-x-2">
            {uniqueColors.map((colorItem, index) => (
              <button
                key={colorItem.colorCode}
                type="button"
                className={`w-4 h-4 rounded-full border ${
                  selectedColorIndex === index
                    ? "ring-2 ring-offset-1 ring-gray-500"
                    : ""
                }`}
                style={{ backgroundColor: colorItem.colorCode }}
                onClick={() => handleColorSelect(index)}
                aria-label={`Select ${colorItem.color} color`}
                title={colorItem.color}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            addOne!({
              ...item,
              selectedColor: {
                colorCode: selectedColor?.colorCode || "",
                colorName: selectedColor?.color || "",
              },
              selectedImageId: selectedImage._id,
              cartImage: Array.isArray(selectedImage.url)
                ? selectedImage.url[0]
                : selectedImage.url,
              size: selectedSize.size,
              quantity: 1,
            })
          }
          className={`uppercase font-bold text-sm sm:hidden mt-2 ${
            selectedSizeOutOfStock
              ? "opacity-50 cursor-not-allowed text-gray-400"
              : ""
          }`}
          disabled={selectedSizeOutOfStock}
          title={
            selectedSizeOutOfStock
              ? `Size ${selectedSize.size} đã hết hàng`
              : t("add_to_cart")
          }
        >
          {selectedSizeOutOfStock
            ? t("out_of_stock") || "Hết hàng"
            : t("add_to_cart")}
        </button>
      </div>
    </div>
  );
};

export default Card;
