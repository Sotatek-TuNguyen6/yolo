export const ADD_ITEM = "ADD_ITEM";
export const ADD_ONE = "ADD_ONE";
export const REMOVE_ITEM = "REMOVE_ITEM";
export const DELETE_ITEM = "DELETE_ITEM";
export const SET_CART = "SET_CART";
export const CLEAR_CART = "CLEAR_CART";

export type actionType = {
  type: string;
  payload?: itemType | itemType[];
};

export type commonType = {
  _id: string;
  productId: number;
  name: string;
  price: number;
  quantity?: number | undefined;
  discountPercent?: number;
  description?: string;
  detail?: string;
  categoryId?: number;
  stock?: number;
  createdAt?: string;
  updatedAt?: string | null;
  category?: {
    _id?: number;
    categoryId: number;
    name?: string;
    description?: string;
    thumbnailImage?: string;
    createdAt?: string;
    updatedAt?: string | null;
  };
  slug?: string;
};

export type imagesType = {
  url: string[] | string;
  color: string;
  colorCode: string;
  _id: string;
  sizeQuantities?: {
    size: string;
    quantity: number;
  }[];
};

export type TagType = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SelectedColorType = {
  colorCode: string;
  colorName: string;
};

export interface itemType extends commonType {
  images: imagesType[];
  categoryName?: string;
  tags?: TagType[];
  selectedColor?: SelectedColorType;
  selectedImages?: imagesType[];
  selectedImageId?: string;
  size?: string;
  cartImage?: string;
  discountPercent?: number;
}

export interface apiProductsType extends commonType {
  images: imagesType[];
  tags?: TagType[];
}

export type cartFuncType = (item: itemType) => void;

export type cartType = {
  cart: itemType[];
  addItem?: cartFuncType;
  addOne?: cartFuncType;
  removeItem?: cartFuncType;
  deleteItem?: cartFuncType;
  clearCart?: () => void;
};
