import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Phải có userInfo VÀ userInfo.isAdmin = true mới cho vào
  return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;