import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    
    if (!userInfo) {
      navigate("/login");
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

      // 👇 GỬI YÊU CẦU CẬP NHẬT (KÈM TOKEN)
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`, // <--- QUAN TRỌNG: Kẹp Token vào đây
        },
        body: JSON.stringify({
          _id: userInfo._id, // Gửi thêm ID cho chắc (dù backend đã lấy từ token)
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Cập nhật thành công!");
        // Cập nhật lại LocalStorage với thông tin mới (Tên mới, Token mới)
        localStorage.setItem("userInfo", JSON.stringify(data));
        window.location.reload(); // Load lại trang để thấy tên mới
      } else {
        alert(data.message || "Lỗi cập nhật");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={submitHandler} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">HỒ SƠ CÁ NHÂN</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tên hiển thị</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email (Không đổi được)</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="border-t my-6 pt-4">
            <p className="text-sm text-gray-500 italic mb-2 text-center">Nhập mật khẩu mới nếu muốn đổi</p>
            
            <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mật khẩu mới</label>
            <input
                type="password"
                placeholder="Để trống nếu không đổi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            />
            </div>

            <div className="mb-6">
            <label className="block text-gray-700 mb-2">Nhập lại mật khẩu</label>
            <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            />
            </div>
        </div>

        <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900 font-bold transition duration-200">
          CẬP NHẬT HỒ SƠ
        </button>
      </form>
    </div>
  );
};

export default Profile;