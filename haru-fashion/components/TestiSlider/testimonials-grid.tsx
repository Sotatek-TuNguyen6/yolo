import { useState } from "react";

const allTestimonials = [
  {
    content:
      "Tôi rất hài lòng với chất lượng áo sơ mi từ Lumen Fashion. Vải cotton cao cấp, đường may tỉ mỉ và kiểu dáng vừa vặn. Đặc biệt là dịch vụ giao hàng nhanh chóng, chỉ 2 ngày là đã nhận được.",
    author: "Nguyễn Văn Minh",
    role: "vanminh***@gmail.com",
    rating: 5,
  },
  {
    content:
      "Quần jean nam của shop rất đẹp và bền. Tôi đã mua 3 chiếc và tất cả đều giữ form tốt sau nhiều lần giặt. Giá cả hợp lý so với chất lượng nhận được.",
    author: "Trần Thị Lan",
    role: "lanthitran***@yahoo.com",
    rating: 5,
  },
  {
    content:
      "Áo phông có nhiều mẫu đẹp, hợp xu hướng. Tôi thích cách shop tư vấn size và màu sắc phù hợp với từng khách hàng. Sẽ tiếp tục ủng hộ shop trong tương lai.",
    author: "Lê Thanh Hải",
    role: "haile***@gmail.com",
    rating: 5,
  },
  {
    content:
      "Bộ sưu tập mùa hè rất thoáng mát và thời trang. Tôi đặc biệt thích chất liệu linen nhẹ nhàng. Chỉ tiếc là một số mẫu hot bán hết quá nhanh, mong shop nhập thêm hàng.",
    author: "Phạm Quốc Bảo",
    role: "quocbao***@gmail.com",
    rating: 4,
  },
  {
    content:
      "Đồ thể thao rất thoải mái khi vận động, thấm hút mồ hôi tốt. Tôi đã mua cả set để tập gym và rất hài lòng. Đường may chắc chắn, không bị giãn sau nhiều lần sử dụng.",
    author: "Hoàng Minh Tuấn",
    role: "minhtuan***@outlook.com",
    rating: 5,
  },
  {
    content:
      "Váy dự tiệc của Lumen Fashion giúp tôi nổi bật trong mọi sự kiện. Thiết kế tinh tế, chất liệu cao cấp. Dù giá hơi cao nhưng xứng đáng với chất lượng. Sẽ tiếp tục ủng hộ.",
    author: "Võ Thị Mai",
    role: "maivo***@gmail.com",
    rating: 5,
  },
  // Thêm các đánh giá mới
  {
    content:
      "Áo khoác mùa đông của Lumen Fashion vừa ấm vừa thời trang. Tôi đặc biệt thích chi tiết túi ẩn bên trong rất tiện lợi để cất giữ đồ có giá trị khi đi du lịch.",
    author: "Đỗ Hồng Nhung",
    role: "nhungdo***@gmail.com",
    rating: 5,
  },
  {
    content:
      "Đồ ngủ rất thoải mái và mềm mại. Sau nhiều lần giặt vẫn giữ được màu sắc và không bị co rút. Tôi đã mua tặng cả gia đình và ai cũng rất thích.",
    author: "Ngô Thanh Tùng",
    role: "tungngo***@hotmail.com",
    rating: 5,
  },
  {
    content:
      "Tôi đã mua bộ vest cưới tại Lumen Fashion và rất hài lòng với sự tỉ mỉ trong từng đường kim mũi chỉ. Nhân viên tư vấn nhiệt tình, giúp tôi chọn được mẫu phù hợp nhất.",
    author: "Trần Đức Anh",
    role: "ducanh***@gmail.com",
    rating: 5,
  },
  {
    content:
      "Đặt online rất tiện lợi, giao diện dễ sử dụng. Tuy nhiên có một lần shop gửi nhầm size, nhưng đã xử lý đổi trả rất nhanh và chuyên nghiệp nên tôi vẫn rất hài lòng.",
    author: "Lý Mỹ Hạnh",
    role: "hanhly***@gmail.com",
    rating: 4,
  },
  {
    content:
      "Áo len mùa đông ấm áp và không gây ngứa như nhiều shop khác. Tôi đặc biệt thích cách phối màu tinh tế của các mẫu áo len năm nay. Sẽ tiếp tục ủng hộ shop.",
    author: "Nguyễn Thị Hồng",
    role: "hongnt***@gmail.com",
    rating: 5,
  },
  {
    content:
      "Quần tây công sở vừa vặn hoàn hảo, không cần chỉnh sửa gì thêm. Chất vải bền, không nhăn và giữ form tốt. Đây là lần thứ 3 tôi mua hàng và chưa bao giờ thất vọng.",
    author: "Đặng Minh Quân",
    role: "quandang***@gmail.com",
    rating: 5,
  },
];

export default function TestimonialsGrid() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreTestimonials = () => {
    setIsLoading(true);
    // Giả lập thời gian tải
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 3, allTestimonials.length));
      setIsLoading(false);
    }, 800);
  };

  const visibleTestimonials = allTestimonials.slice(0, visibleCount);
  const hasMoreToLoad = visibleCount < allTestimonials.length;

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Khách hàng nói gì về sản phẩm của chúng tôi
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Những đánh giá chân thực từ khách hàng đã trải nghiệm mua sắm tại Lumen Fashion
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                {[...Array(5 - testimonial.rating)].map((_, i) => (
                  <svg
                    key={i + testimonial.rating}
                    className="w-5 h-5 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="flex-1">
                <p className="text-base text-gray-800">{testimonial.content}</p>
              </blockquote>
              <div className="flex items-center mt-6 space-x-3">
                <div className="flex-shrink-0">
                  <div className="relative w-10 h-10 overflow-hidden bg-gradient-to-r from-rose-400 to-rose-600 rounded-full">
                    <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-lg">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMoreToLoad && (
          <div className="flex justify-center mt-12">
            <button 
              className={`px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-rose-400 to-rose-600 rounded-full hover:from-rose-500 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={loadMoreTestimonials}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang tải...
                </span>
              ) : (
                "Xem thêm đánh giá"
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
