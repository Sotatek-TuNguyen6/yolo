import addWishlist from "../Util/addWishlist";
import {
  ADD_TO_WISHLIST,
  DELETE_WISHLIST_ITEM,
  CLEAR_WISHLIST,
  wishlistType,
  itemType,
  SET_WISHLIST,
} from "./wishlist-type";

type actionType = {
  type: string;
  payload?: itemType | itemType[];
};

const wishlistReducer = (state: wishlistType, action: actionType) => {
  switch (action.type) {
    case ADD_TO_WISHLIST:
      return {
        ...state,
        wishlist: addWishlist(state.wishlist, action.payload as itemType),
      };
    case DELETE_WISHLIST_ITEM:
      const itemToDelete = action.payload as itemType;
      return {
        ...state,
        wishlist: state.wishlist.filter(
          (wishlistItem) => {
            // Nếu có màu sắc đã chọn, xét cả id và màu
            if (itemToDelete.selectedColor && wishlistItem.selectedColor) {
              return !(
                wishlistItem.id === itemToDelete.id && 
                wishlistItem.selectedColor.colorCode === itemToDelete.selectedColor.colorCode
              );
            }
            // Nếu không có màu sắc, chỉ xét id
            return wishlistItem.id !== itemToDelete.id;
          }
        ),
      };
    case SET_WISHLIST:
      return {
        ...state,
        wishlist: action.payload as itemType[],
      };
    case CLEAR_WISHLIST:
      return {
        ...state,
        wishlist: [],
      };
    default:
      return state;
  }
};

export default wishlistReducer;
