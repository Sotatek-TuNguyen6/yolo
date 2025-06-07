import { itemType } from "../cart/cart-types";

const removeItemFromCart = (cartItems: itemType[], item: itemType) => {
  //   const duplicate = cartItems.some((cartItem) => cartItem.id === item.id);
  if (item.quantity === 1) {
    // Remove the exact matching item (same ID, color, and size)
    return cartItems.filter(
      (cartItem) => 
        !(cartItem.productId === item.productId && 
          cartItem.selectedColor?.colorCode === item.selectedColor?.colorCode &&
          cartItem.size === item.size)
    );
  }
  
  // Decrease quantity only for the exact matching item
  return cartItems.map((cartItem) =>
    cartItem.productId === item.productId && 
    cartItem.selectedColor?.colorCode === item.selectedColor?.colorCode &&
    cartItem.size === item.size
      ? { ...cartItem, quantity: cartItem.quantity! - 1 } 
      : cartItem
  );
  //   if (duplicate) {
  //     return cartItems.map((cartItem) =>
  //       cartItem.id === item.id
  //         ? { ...cartItem, qty: cartItem.qty - 1 }
  //         : cartItem
  //     );
  //   }
  //   return [
  //     ...cartItems,
  //     {
  //       id: item.id,
  //       name: item.name,
  //       price: item.price,
  //       img1: item.img1,
  //       img2: item.img2,
  //       qty: 1,
  //     },
  //   ];
};

export default removeItemFromCart;
