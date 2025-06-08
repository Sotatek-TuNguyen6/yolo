import { itemType } from "../cart/cart-types";

const addItemToCart = (
  cartItems: itemType[],
  item: itemType,
  add_one = false
) => {
  // Simplified logging to reduce cookie size
  console.log("Adding item to cart:", {
    productId: item.productId,
    name: item.name,
    color: item.selectedColor?.colorName,
    size: item.size
  });
  
  // Check if the exact same product (same ID, color, and size) already exists in cart
  const duplicate = cartItems.some(
    (cartItem) => 
      cartItem.productId === item.productId && 
      cartItem.selectedColor?.colorCode === item.selectedColor?.colorCode &&
      cartItem.size === item.size
  );
  
  console.log("Is duplicate?", duplicate);
  console.log("cartItems", cartItems);
  console.log("item", item);
  if (duplicate) {
    // debugger;
    return cartItems.map((cartItem) => {
      console.log("cartItem", cartItem)
      // Only update quantity for the exact matching item (same ID, color, and size)
      if (
        cartItem.productId === item.productId && 
        cartItem.selectedColor?.colorCode === item.selectedColor?.colorCode &&
        cartItem.size === item.size
      ) {
        let itemQty = 0;
          item.quantity || add_one
          ? (itemQty = cartItem.quantity! + item.quantity!)
          : (itemQty = item.quantity!);
        console.log("Updating quantity for existing item:", {
          name: cartItem.name,
          size: cartItem.size,
          newQuantity: itemQty
        });
        return { ...cartItem, quantity: itemQty };
      }
      return cartItem;
    });
  }
  
  let itemQty = !item.quantity ? 1 : item.quantity;
  console.log("Adding new item to cart with quantity:", itemQty);
  return [...cartItems, { ...item, qty: itemQty }];
};

export default addItemToCart;
