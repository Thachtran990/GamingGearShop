import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Nếu có userInfo (đã đăng nhập) -> Outlet (cho hiện nội dung bên trong)
  // Nếu không -> Navigate (đá về trang login)
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;