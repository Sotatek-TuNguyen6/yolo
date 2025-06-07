import { itemType } from "../wishlist/wishlist-type";

const addWishlist = (wishlistItems: itemType[], item: itemType) => {
  const existingItemIndex = wishlistItems.findIndex(
    (wishlistItem) => wishlistItem.id === item!.id
  );

  if (existingItemIndex === -1) {
    // Nếu sản phẩm chưa có trong wishlist, thêm mới
    return [...wishlistItems, { ...item }];
  } else {
    // Nếu sản phẩm đã có trong wishlist, cập nhật thông tin mới nhất
    const updatedWishlist = [...wishlistItems];
    updatedWishlist[existingItemIndex] = {
      ...updatedWishlist[existingItemIndex],
      ...item,
      // Đảm bảo giữ lại ID gốc
      id: wishlistItems[existingItemIndex].id
    };
    return updatedWishlist;
  }
};

export default addWishlist;
