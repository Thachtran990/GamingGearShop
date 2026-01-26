import { useState } from "react";
// Import useNavigate để chuyển trang sau khi đăng ký thành công
import { useNavigate } from "react-router-dom"; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
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
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      alert("Đăng ký thành công! Giờ hãy đăng nhập nhé.");
      navigate("/login"); // Chuyển sang trang đăng nhập (sẽ làm ở bước sau)

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
          ĐĂNG KÝ
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tên người dùng</label>
          <input
            type="text"
            name="username"
            placeholder="Nhập tên của bạn"
            className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
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
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Đăng Ký Ngay
        </button>
      </form>
    </div>
  );
};

export default Register;