import { Link } from "react-router-dom";

const Paginate = ({ pages, page, isAdmin = false, keyword = "" }) => {
  // Nếu chỉ có 1 trang thì khỏi hiện thanh phân trang làm gì cho rác
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <nav className="inline-flex shadow-sm rounded-md">
        {[...Array(pages).keys()].map((x) => (
          <Link
            key={x + 1}
            to={
              !isAdmin
                ? keyword
                  ? `/?keyword=${keyword}&pageNumber=${x + 1}`
                  : `/?pageNumber=${x + 1}`
                : `/admin/productlist/${x + 1}` // Đường dẫn cho Admin (nếu làm sau này)
            }
            className={`px-4 py-2 border text-sm font-medium ${
              x + 1 === page
                ? "bg-yellow-500 text-white border-yellow-500 z-10" // Trang hiện tại
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" // Các trang khác
            }`}
          >
            {x + 1}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Paginate;