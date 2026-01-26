import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Lấy giỏ hàng từ LocalStorage (nếu có) khi vừa mở web
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Mỗi khi giỏ hàng thay đổi -> Lưu ngay vào LocalStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm thêm sản phẩm
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existItem = prev.find((item) => item._id === product._id);
      if (existItem) {
        // Nếu có rồi thì tăng số lượng lên 1
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        // Nếu chưa có thì thêm mới với số lượng = 1
        return [...prev, { ...product, qty: 1 }];
      }
    });
    alert("Đã thêm vào giỏ hàng!");
  };

  // Hàm xóa sản phẩm
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);