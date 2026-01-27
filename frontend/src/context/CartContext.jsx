import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Lấy giỏ hàng từ LocalStorage (nếu có)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  

  // 2. Lấy địa chỉ giao hàng từ LocalStorage (nếu có)
  const [shippingAddress, setShippingAddress] = useState(() => {
    const savedAddress = localStorage.getItem("shippingAddress");
    return savedAddress ? JSON.parse(savedAddress) : {};
  });

  // Lưu giỏ hàng mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Lưu địa chỉ mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  const addToCart = (product) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id ? { ...x, qty: x.qty + 1 } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  // 👇 HÀM MỚI: Lưu địa chỉ giao hàng
  const saveShippingAddress = (data) => {
    setShippingAddress(data);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        shippingAddress, // Xuất biến này ra để dùng
        saveShippingAddress, // Xuất hàm này ra để dùng
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);