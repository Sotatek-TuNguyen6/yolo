import { useRouter } from "next/router";
import NextArrow from "../../public/icons/NextArrow";
import PrevArrow from "../../public/icons/PrevArrow";

type Props = {
  lastPage: number;
  currentPage: number;
  orderby: "latest" | "price" | "price-desc";
};

const Pagination: React.FC<Props> = ({ lastPage, currentPage, orderby }) => {
  const router = useRouter();
  const { category } = router.query;

  // Nếu không có sản phẩm hoặc chỉ có 1 trang, không hiển thị phân trang
  if (lastPage <= 1) {
    return null;
  }

  // Số lượng nút trang tối đa hiển thị
  const MAX_VISIBLE_PAGES = 5;
  
  // Tính toán các trang cần hiển thị
  let pageNumbers: number[] = [];
  let showLeftEllipsis = false;
  let showRightEllipsis = false;

  if (lastPage <= MAX_VISIBLE_PAGES) {
    // Nếu tổng số trang ít hơn hoặc bằng số lượng nút tối đa, hiển thị tất cả
    for (let i = 1; i <= lastPage; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Luôn hiển thị trang đầu và trang cuối
    if (currentPage <= 3) {
      // Gần trang đầu
      pageNumbers = [1, 2, 3, 4, 5];
      showRightEllipsis = true;
    } else if (currentPage >= lastPage - 2) {
      // Gần trang cuối
      pageNumbers = [lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
      showLeftEllipsis = true;
    } else {
      // Ở giữa
      pageNumbers = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
      showLeftEllipsis = true;
      showRightEllipsis = true;
    }
  }

  return (
    <div className="w-full my-8">
      <ul className="flex justify-center items-center">
        <li>
          <button
            type="button"
            aria-label="Navigate to Previous Page"
            onClick={() =>
              router.push(
                `/product-category/${category}?page=${
                  currentPage - 1
                }&orderby=${orderby}`
              )
            }
            className={`${
              currentPage === 1
                ? "pointer-events-none cursor-not-allowed text-gray400 opacity-50"
                : "cursor-pointer hover:bg-gray500 hover:text-gray100"
            } focus:outline-none flex justify-center items-center h-10 w-12 border rounded-l-md mx-0.5 transition-colors`}
          >
            <PrevArrow />
          </button>
        </li>
        
        {/* Hiển thị nút trang đầu tiên nếu cần */}
        {showLeftEllipsis && (
          <>
            <li>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/product-category/${category}?page=1&orderby=${orderby}`
                  )
                }
                className={`focus:outline-none cursor-pointer flex justify-center items-center w-10 h-10 border mx-0.5 hover:bg-gray500 hover:text-gray100 transition-colors`}
              >
                1
              </button>
            </li>
            <li>
              <span className="flex items-center justify-center w-8 text-gray400">...</span>
            </li>
          </>
        )}
        
        {/* Hiển thị các nút trang */}
        {pageNumbers.map((num) => {
          // Không hiển thị lại nút trang đầu hoặc cuối nếu đã có trong dải số
          if ((showLeftEllipsis && num === 1) || (showRightEllipsis && num === lastPage)) {
            return null;
          }
          return (
            <li key={num}>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/product-category/${category}?page=${num}&orderby=${orderby}`
                  )
                }
                className={`${
                  num === currentPage 
                    ? "bg-gray500 text-gray100" 
                    : "hover:bg-gray200"
                } focus:outline-none cursor-pointer flex justify-center items-center w-10 h-10 border mx-0.5 transition-colors`}
              >
                {num}
              </button>
            </li>
          );
        })}
        
        {/* Hiển thị nút trang cuối cùng nếu cần */}
        {showRightEllipsis && (
          <>
            <li>
              <span className="flex items-center justify-center w-8 text-gray400">...</span>
            </li>
            <li>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/product-category/${category}?page=${lastPage}&orderby=${orderby}`
                  )
                }
                className={`focus:outline-none cursor-pointer flex justify-center items-center w-10 h-10 border mx-0.5 hover:bg-gray500 hover:text-gray100 transition-colors`}
              >
                {lastPage}
              </button>
            </li>
          </>
        )}
        
        <li>
          <button
            type="button"
            aria-label="Navigate to Next Page"
            onClick={() =>
              router.push(
                `/product-category/${category}?page=${
                  currentPage + 1
                }&orderby=${orderby}`
              )
            }
            className={`${
              currentPage >= lastPage
                ? "pointer-events-none cursor-not-allowed text-gray400 opacity-50"
                : "cursor-pointer hover:bg-gray500 hover:text-gray100"
            } focus:outline-none flex justify-center items-center h-10 w-12 border rounded-r-md mx-0.5 transition-colors`}
          >
            <NextArrow />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
