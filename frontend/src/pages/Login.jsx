import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // 1. Lưu thông tin người dùng vào máy (để F5 không bị mất)
      localStorage.setItem("userInfo", JSON.stringify(data));

      alert("Đăng nhập thành công!");
      
      // 2. Chuyển hướng về trang chủ
      navigate("/");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          ĐĂNG NHẬP
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email của bạn"
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="******"
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-4"
        >
          Đăng Nhập
        </button>

        <p className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;