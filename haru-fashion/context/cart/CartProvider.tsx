import React, { useContext, useEffect, useReducer } from "react";
import cartReducer from "./cartReducer";
import CartContext from "./CartContext";
import {
  ADD_ITEM,
  ADD_ONE,
  REMOVE_ITEM,
  DELETE_ITEM,
  itemType,
  cartType,
  CLEAR_CART,
  SET_CART,
  actionType,
} from "./cart-types";

const CART_STORAGE_KEY = "haru_fashion_cart";

export const ProvideCart = ({ children }: { children: React.ReactNode }) => {
  const value = useProvideCart();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);

const useProvideCart = () => {
  const initPersistState: cartType = { cart: [] };
  const [state, dispatch] = useReducer<React.Reducer<cartType, actionType>>(
    cartReducer,
    initPersistState as cartType
  );

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          console.log("Loading cart from localStorage");
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: SET_CART, payload: cartItems });
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        console.log("Saving cart to localStorage:", state.cart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [state.cart]);

  const addItem = (item: itemType) => {
    dispatch({
      type: ADD_ITEM,
      payload: item,
    });
  };

  const addOne = (item: itemType) => {
    dispatch({
      type: ADD_ONE,
      payload: item,
    });
  };

  const removeItem = (item: itemType) => {
    dispatch({
      type: REMOVE_ITEM,
      payload: item,
    });
  };

  const deleteItem = (item: itemType) => {
    dispatch({
      type: DELETE_ITEM,
      payload: item,
    });
  };

  const clearCart = () => {
    dispatch({
      type: CLEAR_CART,
    });
  };

  const value: cartType = {
    cart: state.cart,
    addItem,
    addOne,
    removeItem,
    deleteItem,
    clearCart,
  };

  return value;
};
