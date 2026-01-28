import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [shippingAddress, setShippingAddress] = useState(() => {
    const savedAddress = localStorage.getItem("shippingAddress");
    return savedAddress ? JSON.parse(savedAddress) : {};
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  // 👇 HÀM NÂNG CẤP: Thêm vào giỏ (Có kiểm tra tồn kho)
  // 👇 SỬA HÀM NÀY: Trả về true/false để bên ngoài biết kết quả
  const addToCart = (product, qty = 1) => {
    const existItem = cartItems.find((x) => 
      x._id === product._id && x.variantId === product.variantId
    );

    if (existItem) {
      const newQty = existItem.qty + qty;
      
      // KIỂM TRA TỒN KHO
      if (newQty > product.countInStock) {
          alert(`Trong giỏ bạn đã có ${existItem.qty} cái. Kho chỉ còn ${product.countInStock} cái nên không thể thêm nữa!`);
          return false; // ❌ TRẢ VỀ FALSE (BÁO LỖI)
      }

      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id && x.variantId === existItem.variantId
            ? { ...x, qty: newQty }
            : x
        )
      );
    } else {
      // Kiểm tra ngay cả khi thêm mới (đề phòng hack số lượng)
      if (qty > product.countInStock) {
         alert(`Kho chỉ còn ${product.countInStock} cái!`);
         return false; // ❌ TRẢ VỀ FALSE
      }
      setCartItems([...cartItems, { ...product, qty: qty }]);
    }

    return true; // ✅ TRẢ VỀ TRUE (THÀNH CÔNG)
  };

  // 👇 HÀM MỚI: Cập nhật số lượng trực tiếp (Dùng cho trang Giỏ hàng)
  const updateCartItemQty = (productId, variantId, newQty) => {
    setCartItems(cartItems.map((item) => 
        (item._id === productId && item.variantId === variantId) 
        ? { ...item, qty: newQty } 
        : item
    ));
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems(cartItems.filter((x) => 
      !(x._id === productId && x.variantId === variantId)
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  const saveShippingAddress = (data) => setShippingAddress(data);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItemQty, // <-- Xuất hàm này ra để CartPage dùng
        removeFromCart,
        clearCart,
        shippingAddress,
        saveShippingAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);