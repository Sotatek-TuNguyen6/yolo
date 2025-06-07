import React, { useState } from "react";
import { GetStaticProps } from "next";
import { useTranslations } from "next-intl";
import axios from "axios";
import { useRouter } from "next/router";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Button from "../components/Buttons/Button";
import { Order, OrderItem } from "./checkout";
import Image from "next/image";

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

// Định nghĩa thêm các kiểu dữ liệu cho thông tin màu sắc và kích thước
interface OrderItemExtended extends OrderItem {
  selectedColor?: {
    colorCode: string;
    colorName: string;
  };
  size?: string;
}

// Mở rộng kiểu Order để bao gồm thông tin chi tiết mở rộng
interface OrderExtended extends Order {
  orderDetails: OrderItemExtended[];
}

const OrderTracking: React.FC = () => {
  const t = useTranslations("Navigation");
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [orderResult, setOrderResult] = useState<OrderExtended | null>(null);
  console.log("orderResult", orderResult);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State for image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Function to open the image modal
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Function to close the image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  // Helper function to format price properly
  const formatPrice = (price: number | undefined): string => {
    if (price === undefined) return "0 ₫";
    return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
  };

  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
    return price - (price * (discountPercent / 100));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setOrderResult(null);
    setError("");

    if (!orderId.trim() || !email.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API đến endpoint /orders/order-tracking
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROD_BACKEND_URL}/api/v1/orders/tracking`,
        {
          orderId: orderId.trim(),
          email: email.trim(),
        }
      );

      if (response.data && response.data.success) {
        try {
          setOrderResult(response.data.data);
        } catch (parseError) {
          console.error("Error parsing order data:", parseError);
          router.push("/404");
        }
      } else {
        setError(
          response.data?.message ||
            "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại thông tin."
        );
      }
    } catch (err: any) {
      console.error("Error tracking order:", err);
      if (err.response?.status === 404) {
        router.push("/404");
        return;
      }
      setError(
        err.response?.data?.message ||
          "Đã xảy ra lỗi khi tra cứu đơn hàng. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const mappingStatus = (status: string) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return "Chờ xử lý";
      case PaymentStatus.SUCCESS:
        return "Đã thanh toán";
      case PaymentStatus.FAILED:
        return "Đã hủy";
      default:
        return "Chờ xử lý";
    }
  };

  // Helper function to find the correct product image based on color
  const getProductImage = (item: OrderItemExtended) => {
    if (!item.product || !item.product.images) {
      return "/images/placeholder.png";
    }

    // If there's a selected color, try to find an image with that color
    if (item.selectedColor && item.selectedColor.colorCode) {
      const colorImage = item.product.images.find(
        (img) => img.colorCode === item.selectedColor?.colorCode
      );

      if (colorImage) {
        return Array.isArray(colorImage.url)
          ? colorImage.url[0]
          : colorImage.url;
      }
    }

    // Fallback to the first image
    const firstImage = item.product.images[0];
    return Array.isArray(firstImage.url) ? firstImage.url[0] : firstImage.url;
  };

  return (
    <>
      <Header title={t("order_tracking")} />

      <main
        id="main-content"
        className="app-max-width app-x-padding my-8 min-h-screen"
      >
        <h1 className="text-3xl font-medium text-center mb-8">
          {t("order_tracking")}
        </h1>

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray200">
          <p className="mb-6 text-gray500">
            Để theo dõi đơn hàng của bạn, vui lòng nhập mã đơn hàng và địa chỉ
            email mà bạn đã sử dụng khi đặt hàng.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="order-id" className="block mb-2 font-medium">
                Mã đơn hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="order-id"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-3 border border-gray300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray400"
                placeholder="Nhập mã đơn hàng của bạn"
                required
              />
              <p className="text-sm text-gray400 mt-1">
                Mã đơn hàng được gửi trong email xác nhận đơn hàng của bạn.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray400"
                placeholder="Email bạn đã sử dụng khi đặt hàng"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <Button
                value={isLoading ? "Đang tra cứu..." : "Tra cứu đơn hàng"}
                type="submit"
                disabled={isLoading}
              />
            </div>
          </form>

          {orderResult && (
            <div className="mt-8 border-t border-gray200 pt-6">
              <h2 className="text-xl font-medium mb-4">Thông tin đơn hàng</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray500">Mã đơn hàng:</p>
                  <p className="font-medium">{orderResult.orderId}</p>
                </div>
                <div>
                  <p className="text-gray500">Ngày đặt hàng:</p>
                  <p className="font-medium">{orderResult.orderDate}</p>
                </div>
                <div>
                  <p className="text-gray500">Trạng thái:</p>
                  <p className="font-medium text-green-600">
                    {mappingStatus(orderResult.paymentStatus)}
                  </p>
                </div>
                <div>
                  <p className="text-gray500">Tổng tiền:</p>
                  <p className="font-medium">
                    {formatPrice(orderResult.totalPrice)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray500">Địa chỉ giao hàng:</p>
                <p className="font-medium">{orderResult.shippingAddress}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Sản phẩm đã đặt:</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray200">
                      <th className="text-left py-2">Hình ảnh</th>
                      <th className="text-left py-2">Sản phẩm</th>
                      <th className="text-center py-2">Số lượng</th>
                      <th className="text-right py-2">Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orderResult.orderDetails || []).map(
                      (item: OrderItemExtended) => (
                        <tr key={item._id} className="border-b border-gray200">
                          <td className="py-2">
                            {item.product ? (
                              <Image
                                src={getProductImage(item)}
                                alt={item.product.name || "Product image"}
                                width={50}
                                height={50}
                                className="w-20 h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  try {
                                    const imageUrl = getProductImage(item);
                                    if (imageUrl) {
                                      openImageModal(imageUrl);
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error opening image modal:",
                                      error
                                    );
                                  }
                                }}
                                onError={(e) => {
                                  console.error("Failed to load image");
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = "/images/placeholder.png";
                                }}
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">
                                  No image
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-2">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              {/* Hiển thị thông tin màu sắc và kích thước nếu có */}
                              <div className="mt-2">
                                {item.selectedColor && (
                                  <div className="flex items-center mb-1">
                                    <span className="font-medium mr-1">
                                      Màu:
                                    </span>
                                    <div
                                      className="w-5 h-5 rounded-full border border-gray-300 mr-2"
                                      style={{
                                        backgroundColor:
                                          item.selectedColor.colorCode,
                                      }}
                                    ></div>
                                    <span>{item.selectedColor.colorName}</span>
                                  </div>
                                )}
                                {item.size && (
                                  <div className="flex items-center">
                                    <span className="font-medium mr-1">
                                      Size:
                                    </span>
                                    <span>{item.size}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-2">{item.quantity}</td>
                          <td className="text-right py-2">
                            {item.product && item.product.discountPercent && item.product.discountPercent > 0 ? (
                              <div>
                                <div className="line-through text-gray-400">
                                  {formatPrice(item.product.price)}
                                </div>
                                <div className="text-red-500">
                                  {formatPrice(calculateDiscountedPrice(
                                    item.product.price || 0,
                                    item.product.discountPercent
                                  ))}
                                </div>
                                <div className="text-xs bg-red-500 text-white px-1 py-0.5 rounded inline-block">
                                  -{item.product.discountPercent}%
                                </div>
                              </div>
                            ) : (
                              <>{formatPrice(item.price)}</>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
              aria-label="Close modal"
            >
              ×
            </button>
            <div className="flex items-center justify-center h-full">
              <div className="relative w-full max-h-[70vh]">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt="Expanded Image"
                    width={1200}
                    height={800}
                    className="object-contain w-full h-auto max-h-[70vh]"
                    priority
                    quality={100}
                    onError={(e) => {
                      console.error("Failed to load full-size image");
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/placeholder.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-[50vh] bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "vi" }) => {
  try {
    return {
      props: {
        messages: (await import(`../messages/common/${locale}.json`)).default,
      },
    };
  } catch (error) {
    console.error("Error loading messages:", error);
    return {
      notFound: true,
    };
  }
};

export default OrderTracking;
