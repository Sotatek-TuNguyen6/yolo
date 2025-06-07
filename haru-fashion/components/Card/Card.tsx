import { FC, useState } from "react";
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { name, price, discountPercent, images, productId, tags, size } = item;

  const itemLink = `/products/${encodeURIComponent(productId)}`;

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
    size: size,
    cartImage: Array.isArray(selectedImage.url) ? selectedImage.url[0] : selectedImage.url
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
    setIsImageLoaded(false); // Reset trạng thái load khi đổi màu
  };

  // Helper function to format price based on locale
  const formatPrice = (price: number) => {
    if (locale === "vi") {
      return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
    } else {
      return `$ ${price}`;
    }
  };

  // Calculate discounted price if discount is available
  const hasDiscount = !!discountPercent && discountPercent > 0;
  const discountedPrice = hasDiscount 
    ? price - (price * (discountPercent / 100))
    : price;

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
          onClick={() => addOne!({
            ...item,
            selectedColor: {
              colorCode: selectedColor?.colorCode || "",
              colorName: selectedColor?.color || "",
            },
            selectedImageId: selectedImage._id,
            cartImage: Array.isArray(selectedImage.url) ? selectedImage.url[0] : selectedImage.url
          })}
          className={styles.addBtn}
        >
          {t("add_to_cart")}
        </button>
      </div>

      <div className="content">
        <Link href={itemLink}>
          <a className={styles.itemName}>{name}</a>
        </Link>
        <div className="flex items-center space-x-2">
          {hasDiscount ? (
            <>
              <span className="text-gray400 line-through">{formatPrice(price)}</span>
              <span className="text-red-500 font-medium">{formatPrice(discountedPrice)}</span>
            </>
          ) : (
            <span className="text-gray400">{formatPrice(price)}</span>
          )}
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((tag) => (
              <span
                key={tag._id}
                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag.name}
              </span>
            ))}
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
          onClick={() => addOne!({
            ...item,
            selectedColor: {
              colorCode: selectedColor?.colorCode || "",
              colorName: selectedColor?.color || "",
            },
            selectedImageId: selectedImage._id,
            cartImage: Array.isArray(selectedImage.url) ? selectedImage.url[0] : selectedImage.url
          })}
          className="uppercase font-bold text-sm sm:hidden mt-2"
        >
          {t("add_to_cart")}
        </button>
      </div>
    </div>
  );
};

export default Card;
