import { imagesType, SelectedColorType } from "../cart/cart-types";

export const ADD_TO_WISHLIST = "ADD_TO_WISHLIST";
export const DELETE_WISHLIST_ITEM = "DELETE_WISHLIST_ITEMS";
export const SET_WISHLIST = "SET_WISHLIST";
export const CLEAR_WISHLIST = "CLEAR_WISHLIST";

export type itemType = {
  id: number;
  images?: imagesType[];
  name: string;
  price: number;
  quantity?: number;
  selectedColor?: SelectedColorType;
  selectedImageId?: string;
  size?: string;
  cartImage?: string;
};

export type wishlistType = {
  wishlist: itemType[];
  // addItem?: (item: itemType) => void; // delete
  addToWishlist?: (item: itemType) => void;
  // removeItem?: (item: itemType) => void; // delete
  deleteWishlistItem?: (item: itemType) => void;
  clearWishlist?: () => void;
};
