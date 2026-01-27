import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBox = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}`); // Đẩy từ khóa lên URL trang chủ
    } else {
      navigate("/"); // Nếu xóa trắng thì về trang chủ gốc
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex bg-white rounded overflow-hidden mx-4">
      <input
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className="px-4 py-2 text-gray-700 focus:outline-none w-48 sm:w-64"
      />
      <button type="submit" className="bg-yellow-500 text-white px-4 hover:bg-yellow-600">
        Tìm
      </button>
    </form>
  );
};

export default SearchBox;