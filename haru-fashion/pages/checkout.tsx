import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import Image from "next/image";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Button from "../components/Buttons/Button";
import { roundDecimal } from "../components/Util/utilFunc";
import { useCart } from "../context/cart/CartProvider";
import Input from "../components/Input/Input";
import { apiProductsType, itemType } from "../context/cart/cart-types";
import { useAuth } from "../context/AuthContext";

// let w = window.innerWidth;
type PaymentType = "CASH_ON_DELIVERY" | "BANK_TRANSFER";
type DeliveryType = "STORE_PICKUP" | "FREE" | "SHIP";

// Payment method mapping for display
const paymentMethodMapping: Record<PaymentType, { en: string; vi: string }> = {
  CASH_ON_DELIVERY: {
    en: "Cash on Delivery",
    vi: "Thanh toán khi nhận hàng",
  },
  BANK_TRANSFER: {
    en: "Bank Transfer",
    vi: "Chuyển khoản ngân hàng",
  },
};

// Delivery type mapping for display
const deliveryTypeMapping: Record<DeliveryType, { en: string; vi: string }> = {
  STORE_PICKUP: {
    en: "Store Pickup",
    vi: "Nhận tại cửa hàng",
  },
  FREE: {
    en: "Free Delivery",
    vi: "Miễn phí giao hàng",
  },
  SHIP: {
    en: "Express Shipping",
    vi: "Ship nhanh",
  },
};

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
};

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPING = "shipping",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  REFUNDED = "refunded",
}

export type OrderItem = {
  _id: string;
  name: string;
  price: number;
  orderDetailId: number;
  quantity: number;
  product: apiProductsType;
  imageId?: string;
  size?: string;
  selectedColor?: {
    colorName: string;
    colorCode: string;
  };
  productName?: string;
  discountPercent?: number;
};

export type Order = {
  orderId: number;
  customerInfo: Customer;
  shippingAddress: string;
  township?: null | string;
  city?: null | string;
  state?: null | string;
  zipCode?: null | string;
  orderDate: string;
  paymentType: PaymentType;
  deliveryType: DeliveryType;
  totalPrice: number;
  deliveryDate: string;
  paymentStatus: string;
  orderDetails: OrderItem[];
  orderStatus: OrderStatus;
};

const ShoppingCart = () => {
  const t = useTranslations("CartWishlist");
  const router = useRouter();
  const { locale } = router;
  const { cart, clearCart } = useCart();
  const auth = useAuth();
  const [deli, setDeli] = useState<DeliveryType>("STORE_PICKUP");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentType>("CASH_ON_DELIVERY");

  // Helper function to format price based on locale
  const formatPrice = (price: number | string) => {
    console.log("price", price);
    // Đảm bảo price là số
    const numPrice = typeof price === "string" ? parseFloat(price) : price;

    if (locale === "vi") {
      return `${new Intl.NumberFormat("vi-VN").format(numPrice)}\u00A0₫`;
    } else {
      return `$\u00A0${numPrice}`;
    }
  };

  // Form Fields
  const [name, setName] = useState(auth.user?.fullname || "");
  const [email, setEmail] = useState(auth.user?.email || "");
  const [phone, setPhone] = useState(auth.user?.phone || "");
  const [diffAddr, setDiffAddr] = useState(false);
  const [address, setAddress] = useState(auth.user?.shippingAddress || "");

  // New location fields
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");

  // For second address if different
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("");
  const [shippingWard, setShippingWard] = useState("");
  const [shippingSpecificAddress, setShippingSpecificAddress] = useState("");

  // State for API data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [shippingDistricts, setShippingDistricts] = useState<any[]>([]);
  const [shippingWards, setShippingWards] = useState<any[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingShippingDistricts, setLoadingShippingDistricts] =
    useState(false);
  const [loadingShippingWards, setLoadingShippingWards] = useState(false);

  const [isOrdering, setIsOrdering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  console.log("completedOrder", completedOrder);
  const [orderError, setOrderError] = useState("");
  const [sendEmail, setSendEmail] = useState(false);

  // Helper function to get localized payment method name
  const getPaymentMethodName = (type: PaymentType): string => {
    return locale === "vi"
      ? paymentMethodMapping[type].vi
      : paymentMethodMapping[type].en;
  };

  // Helper function to get localized delivery type name
  const getDeliveryTypeName = (type: DeliveryType): string => {
    return locale === "vi"
      ? deliveryTypeMapping[type].vi
      : deliveryTypeMapping[type].en;
  };

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await axios.get(
          "https://provinces.open-api.vn/api/p/"
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!city) return;

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const provinceCode = provinces.find((p) => p.name === city)?.code;
        if (provinceCode) {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
          );
          setDistricts(response.data.districts || []);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [city, provinces]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!district) return;

    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const districtCode = districts.find((d) => d.name === district)?.code;
        if (districtCode) {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
          );
          setWards(response.data.wards || []);
        }
      } catch (error) {
        console.error("Error fetching wards:", error);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [district, districts]);

  // Fetch shipping districts when shipping province changes
  useEffect(() => {
    if (!shippingCity) return;

    const fetchShippingDistricts = async () => {
      setLoadingShippingDistricts(true);
      try {
        const provinceCode = provinces.find(
          (p) => p.name === shippingCity
        )?.code;
        if (provinceCode) {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
          );
          setShippingDistricts(response.data.districts || []);
        }
      } catch (error) {
        console.error("Error fetching shipping districts:", error);
      } finally {
        setLoadingShippingDistricts(false);
      }
    };

    fetchShippingDistricts();
  }, [shippingCity, provinces]);

  // Fetch shipping wards when shipping district changes
  useEffect(() => {
    if (!shippingDistrict) return;

    const fetchShippingWards = async () => {
      setLoadingShippingWards(true);
      try {
        const districtCode = shippingDistricts.find(
          (d) => d.name === shippingDistrict
        )?.code;
        if (districtCode) {
          const response = await axios.get(
            `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
          );
          setShippingWards(response.data.wards || []);
        }
      } catch (error) {
        console.error("Error fetching shipping wards:", error);
      } finally {
        setLoadingShippingWards(false);
      }
    };

    fetchShippingWards();
  }, [shippingDistrict, shippingDistricts]);

  // Update address when location fields change
  useEffect(() => {
    if (city && district && ward && specificAddress) {
      const fullAddress = `${specificAddress}, ${ward}, ${district}, ${city}`;
      setAddress(fullAddress);
    }
  }, [city, district, ward, specificAddress]);

  // Update shipping address when location fields change
  useEffect(() => {
    if (
      shippingCity &&
      shippingDistrict &&
      shippingWard &&
      shippingSpecificAddress
    ) {
      const fullShippingAddress = `${shippingSpecificAddress}, ${shippingWard}, ${shippingDistrict}, ${shippingCity}`;
      setShippingAddress(fullShippingAddress);
    }
  }, [shippingCity, shippingDistrict, shippingWard, shippingSpecificAddress]);

  // Trước khi gửi đơn hàng, chuẩn bị dữ liệu sản phẩm
  const products = cart.map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    selectedColor: item.selectedColor,
    selectedImageId: item.selectedImageId,
    size: item.size,
  }));

  useEffect(() => {
    if (!isOrdering) return;

    setErrorMsg("");

    // No need to register users - we'll proceed directly to order
    const makeOrder = async () => {
      try {
        console.log("products", products);
        // If email is empty, force sendEmail to false
        const shouldSendEmail = email ? sendEmail : false;

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/orders`,
          {
            customerId: auth.user ? auth.user.id : 0, // Use 0 or null for guest users
            customerName: name,
            customerEmail: email, // This can be empty now
            customerPhone: phone,
            shippingAddress: shippingAddress ? shippingAddress : address,
            // Add structured address fields
            addressDetails: {
              city: diffAddr ? shippingCity : city,
              district: diffAddr ? shippingDistrict : district,
              ward: diffAddr ? shippingWard : ward,
              specificAddress: diffAddr
                ? shippingSpecificAddress
                : specificAddress,
            },
            totalPrice: Number(subtotal) + Number(deliFee),
            deliveryDate: new Date().setDate(new Date().getDate() + 7),
            paymentType: paymentMethod,
            deliveryType: deli,
            products,
            sendEmail: shouldSendEmail,
          }
        );
        if (res.data.success) {
          setCompletedOrder(res.data.data);
          clearCart!();
          setIsOrdering(false);
        } else {
          handleOrderError(res.data.error);
          setIsOrdering(false);
        }
      } catch (error) {
        console.error("Order error:", error);
        if (axios.isAxiosError(error) && error.response) {
          handleOrderError(error.response.data.error);
        } else {
          setOrderError("error_occurs");
          toast.error(
            t("error_occurs") || "Đã xảy ra lỗi, vui lòng thử lại sau",
            {
              position: "top-right",
              autoClose: 5000,
            }
          );
        }
        setIsOrdering(false);
      }
    };
    makeOrder();
  }, [isOrdering]);

  // Helper function to handle different error types
  const handleOrderError = (error: any) => {
    setOrderError("error_occurs");

    if (error && error.message) {
      // Check if the error is about stock quantity
      if (
        error.message.includes("không đủ số lượng") ||
        error.message.includes("chỉ còn") ||
        error.message.toLowerCase().includes("stock")
      ) {
        toast.error(error.message, {
          position: "top-right",
          autoClose: false,
          closeOnClick: true,
        });
      } else {
        toast.error(error.message, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } else {
      toast.error(t("error_occurs") || "Đã xảy ra lỗi, vui lòng thử lại sau", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    if (auth.user) {
      setName(auth.user.fullname);
      setEmail(auth.user.email);
      setAddress(auth.user.shippingAddress || "");
      setPhone(auth.user.phone || "");
    } else {
      setName("");
      setEmail("");
      setAddress("");
      setPhone("");
    }
  }, [auth.user]);

  // Add this useEffect after the other useEffect blocks
  useEffect(() => {
    // If email is empty, make sure sendEmail is set to false
    if (!email && sendEmail) {
      setSendEmail(false);
    }
    // If email is provided, automatically enable sendEmail
    else if (email && !sendEmail) {
      setSendEmail(true);
    }
  }, [email]);

  let disableOrder = true;

  // Update the disableOrder logic to check for all required location fields
  disableOrder =
    name === "" ||
    phone === "" ||
    city === "" ||
    district === "" ||
    ward === "" ||
    specificAddress === "" ||
    (diffAddr &&
      (shippingCity === "" ||
        shippingDistrict === "" ||
        shippingWard === "" ||
        shippingSpecificAddress === ""));

  let subtotal: number | string = 0;
  console.log("subtotal", subtotal);

  // Calculate discounted price if discount is available
  const getDiscountedPrice = (item: itemType): number => {
    if (item.discountPercent && item.discountPercent > 0) {
      return parseFloat(
        roundDecimal(item.price - item.price * (item.discountPercent / 100))
      );
    }
    return parseFloat(roundDecimal(item.price));
  };

  subtotal = roundDecimal(
    cart.reduce((accumulator: number, currentItem) => {
      const itemPrice = getDiscountedPrice(currentItem);
      return accumulator + itemPrice * currentItem!.quantity!;
    }, 0)
  );

  let deliFee = 0;
  if (deli === "FREE") {
    deliFee = 0;
  } else if (deli === "SHIP") {
    deliFee = 25000;
  }

  return (
    <div>
      {/* ===== Head Section ===== */}
      <Header title={`Thanh toán - Lumen Fashion`} />

      {/* Toast container for notifications */}
      <ToastContainer />

      <main id="main-content">
        {/* Custom styling for product images */}
        <style>{`
          .product-image {
            object-fit: contain !important;
            width: auto !important;
            height: auto !important;
            max-width: 100%;
          }
          .product-image-container {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>

        {/* Loading overlay */}
        {isOrdering && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray500 mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">
                Đang xử lý đơn hàng
              </h2>
              <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
            </div>
          </div>
        )}

        {/* ===== Heading & Continue Shopping */}
        <div className="app-max-width px-4 sm:px-8 md:px-20 w-full border-t-2 border-gray-100">
          <h1 className="text-2xl sm:text-4xl text-center sm:text-left mt-6 mb-2 animatee__animated animate__bounce">
            {t("checkout")}
          </h1>
          {!auth.user && (
            <h2 className="text-base sm:text-lg text-gray-400text-center sm:text-left mb-4">
              {t("guest_checkout") || "Guest Checkout"}
            </h2>
          )}
        </div>

        {/* ===== Form Section ===== */}
        {!completedOrder ? (
          <div className="app-max-width px-4 sm:px-8 md:px-20 mb-14 flex flex-col lg:flex-row">
            <div className="h-full w-full lg:w-7/12 mr-8">
              {errorMsg !== "" && (
                <span className="text-red text-sm font-semibold">
                  - {t(errorMsg)}
                </span>
              )}
              <div className="my-4">
                <label htmlFor="name" className="text-lg">
                  {t("name")}
                </label>
                <Input
                  name="name"
                  type="text"
                  extraClass="w-full mt-1 mb-2"
                  border="border-2 border-gray400"
                  value={name}
                  onChange={(e) =>
                    setName((e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div className="my-4">
                <label htmlFor="email" className="text-lg mb-1">
                  {t("email_address")}
                  <span className="ml-1 text-gray-500 text-sm italic">
                    ({t("optional") || "Tùy chọn"})
                  </span>
                </label>
                <Input
                  name="email"
                  type="email"
                  readOnly={auth.user ? true : false}
                  extraClass={`w-full mt-1 mb-2 ${
                    auth.user ? "bg-gray100 cursor-not-allowed" : ""
                  }`}
                  border="border-2 border-gray400"
                  value={email}
                  onChange={(e) =>
                    setEmail((e.target as HTMLInputElement).value)
                  }
                />
              </div>

              <div className="my-4">
                <label htmlFor="phone" className="text-lg">
                  {t("phone")}
                </label>
                <Input
                  name="phone"
                  type="text"
                  extraClass="w-full mt-1 mb-2"
                  border="border-2 border-gray400"
                  value={phone}
                  onChange={(e) =>
                    setPhone((e.target as HTMLInputElement).value)
                  }
                  required
                />
              </div>

              <div className="my-4">
                <label htmlFor="address" className="text-lg">
                  {t("address")}
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label htmlFor="city" className="text-sm text-gray-500">
                      {t("city") || "Tỉnh/Thành phố"}
                    </label>
                    <select
                      id="city"
                      className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setDistrict("");
                        setWard("");
                      }}
                      disabled={loadingProvinces}
                      required
                    >
                      <option value="">
                        {loadingProvinces ? t("loading") : t("select_city")}
                      </option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="district" className="text-sm text-gray-500">
                      {t("district") || "Quận/Huyện"}
                    </label>
                    <select
                      id="district"
                      className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setWard("");
                      }}
                      disabled={!city || loadingDistricts}
                      required
                    >
                      <option value="">
                        {loadingDistricts ? t("loading") : t("select_district")}
                      </option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ward" className="text-sm text-gray-500">
                      {t("ward") || "Phường/Xã"}
                    </label>
                    <select
                      id="ward"
                      className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      disabled={!district || loadingWards}
                      required
                    >
                      <option value="">
                        {loadingWards ? t("loading") : t("select_ward")}
                      </option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="specificAddress"
                      className="text-sm text-gray-500"
                    >
                      {t("specific_address") || "Địa chỉ cụ thể"}
                    </label>
                    <input
                      type="text"
                      id="specificAddress"
                      className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                      value={specificAddress}
                      onChange={(e) => setSpecificAddress(e.target.value)}
                      placeholder={t("address_placeholder")}
                      required
                    />
                  </div>
                </div>

                <input type="hidden" value={address} readOnly />
              </div>

              {/* <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  name="toggle"
                  id="toggle"
                  checked={diffAddr}
                  onChange={() => setDiffAddr(!diffAddr)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray300 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="toggle"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray300 cursor-pointer"
                ></label>
              </div> */}
              {/* <label htmlFor="toggle" className="text-xs text-gray-700">
                {t("different_shipping_address")}
              </label>

              {diffAddr && (
                <div className="my-4">
                  <label htmlFor="shipping_address" className="text-lg">
                    {t("shipping_address")}
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label
                        htmlFor="shipping_city"
                        className="text-sm text-gray-500"
                      >
                        {t("city") || "Tỉnh/Thành phố"}
                      </label>
                      <select
                        id="shipping_city"
                        className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                        value={shippingCity}
                        onChange={(e) => {
                          setShippingCity(e.target.value);
                          setShippingDistrict("");
                          setShippingWard("");
                        }}
                        disabled={loadingProvinces}
                        required
                      >
                        <option value="">
                          {loadingProvinces 
                            ? t("loading")
                            : t("select_city")}
                        </option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="shipping_district"
                        className="text-sm text-gray-500"
                      >
                        {t("district") || "Quận/Huyện"}
                      </label>
                      <select
                        id="shipping_district"
                        className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                        value={shippingDistrict}
                        onChange={(e) => {
                          setShippingDistrict(e.target.value);
                          setShippingWard("");
                        }}
                        disabled={!shippingCity || loadingShippingDistricts}
                        required
                      >
                        <option value="">
                          {loadingShippingDistricts 
                            ? t("loading")
                            : t("select_district")}
                        </option>
                        {shippingDistricts.map((d) => (
                          <option key={d.code} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="shipping_ward"
                        className="text-sm text-gray-500"
                      >
                        {t("ward") || "Phường/Xã"}
                      </label>
                      <select
                        id="shipping_ward"
                        className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                        value={shippingWard}
                        onChange={(e) => setShippingWard(e.target.value)}
                        disabled={!shippingDistrict || loadingShippingWards}
                        required
                      >
                        <option value="">
                          {loadingShippingWards 
                            ? t("loading")
                            : t("select_ward")}
                        </option>
                        {shippingWards.map((w) => (
                          <option key={w.code} value={w.name}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="shipping_specificAddress"
                        className="text-sm text-gray-500"
                      >
                        {t("specific_address") || "Địa chỉ cụ thể"}
                      </label>
                      <input
                        type="text"
                        id="shipping_specificAddress"
                        className="w-full mt-1 mb-2 border-2 border-gray400 p-2 outline-none"
                        value={shippingSpecificAddress}
                        onChange={(e) =>
                          setShippingSpecificAddress(e.target.value)
                        }
                        placeholder={t("address_placeholder")}
                        required
                      />
                    </div>
                  </div>

                  <input type="hidden" value={shippingAddress} readOnly />
                </div>
              )} */}

              {!auth.user && (
                <div className="text-sm text-gray-400mt-8 leading-6">
                  {t("guest_checkout_note") ||
                    "You are checking out as a guest. No account will be created."}
                </div>
              )}
            </div>
            <div className="h-full w-full lg:w-5/12 mt-10 lg:mt-4">
              {/* Cart Totals */}
              <div className="border border-gray500 p-6 divide-y-2 divide-gray200">
                <div className="flex justify-between">
                  <span className="text-base uppercase mb-3">
                    {t("product")}
                  </span>
                  <span className="text-base uppercase mb-3">
                    {t("subtotal")}
                  </span>
                </div>

                <div className="pt-2">
                  {cart.map((item) => {
                    const discountedPrice = getDiscountedPrice(item);
                    return (
                      <div
                        className="flex justify-between mb-2"
                        key={
                          item.productId +
                          (item.selectedColor?.colorCode || "") +
                          (item.size || "")
                        }
                      >
                        <div className="text-base font-medium">
                          {item.name}{" "}
                          <span className="text-gray-400">
                            x {item.quantity}
                          </span>
                          {(item.selectedColor || item.size) && (
                            <div className="text-sm text-gray-500 mt-1">
                              {item.selectedColor && (
                                <div className="flex items-center">
                                  <span>
                                    Màu: {item.selectedColor.colorName}
                                  </span>
                                  {item.selectedColor.colorCode && (
                                    <div
                                      className="ml-2 w-4 h-4 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor:
                                          item.selectedColor.colorCode,
                                      }}
                                    ></div>
                                  )}
                                </div>
                              )}
                              {item.size && <div>Kích thước: {item.size}</div>}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {item.discountPercent && item.discountPercent > 0 ? (
                            <>
                              <div className="text-base line-through text-gray-400">
                                {formatPrice(item.price * item!.quantity!)}
                              </div>
                              <div className="text-base text-red-500">
                                {formatPrice(discountedPrice * item!.quantity!)}
                              </div>
                              <div className="text-xs bg-red-500 text-white px-1 py-0.5 rounded inline-block">
                                -{item.discountPercent}%
                              </div>
                            </>
                          ) : (
                            <span className="text-base">
                              {formatPrice(item.price * item!.quantity!)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="py-3 flex justify-between">
                  <span className="uppercase">{t("subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {/* Show total discount savings if any product has a discount */}
                {cart.some(
                  (item) => item.discountPercent && item.discountPercent > 0
                ) && (
                  <div className="flex justify-between py-2 text-red-500">
                    <span className="uppercase">
                      {t("discount") || "Tiết kiệm"}
                    </span>
                    <span>
                      {formatPrice(
                        cart.reduce((total, item) => {
                          if (
                            item.discountPercent &&
                            item.discountPercent > 0
                          ) {
                            const regularPrice = item.price * item.quantity!;
                            const discountedPrice =
                              getDiscountedPrice(item) * item.quantity!;
                            return total + (regularPrice - discountedPrice);
                          }
                          return total;
                        }, 0)
                      )}
                    </span>
                  </div>
                )}

                <div className="py-3">
                  <span className="uppercase">{t("delivery")}</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <input
                          type="radio"
                          name="deli"
                          value="STORE_PICKUP"
                          id="pickup"
                          checked={deli === "STORE_PICKUP"}
                          onChange={() => setDeli("STORE_PICKUP")}
                        />{" "}
                        <label htmlFor="pickup" className="cursor-pointer">
                          {getDeliveryTypeName("STORE_PICKUP")}
                        </label>
                      </div>
                      <span>Miễn phí</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <input
                          type="radio"
                          name="deli"
                          value="FREE"
                          id="ygn"
                          checked={deli === "FREE"}
                          onChange={() => setDeli("FREE")}
                          // defaultChecked
                        />{" "}
                        <label htmlFor="ygn" className="cursor-pointer">
                          {getDeliveryTypeName("FREE")}
                        </label>
                      </div>
                      <span>Miễn Phí</span>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <input
                          type="radio"
                          name="deli"
                          value="SHIP"
                          id="others"
                          checked={deli === "SHIP"}
                          onChange={() => setDeli("SHIP")}
                        />{" "}
                        <label htmlFor="others" className="cursor-pointer">
                          {getDeliveryTypeName("SHIP")}
                        </label>
                      </div>
                      <span>{formatPrice(25000)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between py-3">
                    <span>{t("grand_total")}</span>
                    <span>
                      {formatPrice(Number(subtotal) + Number(deliFee))}
                    </span>
                  </div>

                  <div className="grid gap-4 mt-2 mb-4">
                    <label
                      htmlFor="plan-cash"
                      className="relative flex flex-col bg-white p-5 rounded-lg shadow-md border border-gray300 cursor-pointer"
                    >
                      <span className="font-semibold text-gray-500 text-base leading-tight capitalize">
                        {getPaymentMethodName("CASH_ON_DELIVERY")}
                      </span>
                      <input
                        type="radio"
                        name="plan"
                        id="plan-cash"
                        value="CASH_ON_DELIVERY"
                        className="absolute h-0 w-0 appearance-none"
                        onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                      />
                      <span
                        aria-hidden="true"
                        className={`${
                          paymentMethod === "CASH_ON_DELIVERY"
                            ? "block"
                            : "hidden"
                        } absolute inset-0 border-2 border-gray500 bg-opacity-10 rounded-lg`}
                      >
                        <span className="absolute top-4 right-4 h-6 w-6 inline-flex items-center justify-center rounded-full bg-gray100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5 text-green-600"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </span>
                    </label>
                    <label
                      htmlFor="plan-bank"
                      className="relative flex flex-col bg-white p-5 rounded-lg shadow-md border border-gray300 cursor-pointer"
                    >
                      <span className="font-semibold text-gray-500 leading-tight capitalize">
                        {getPaymentMethodName("BANK_TRANSFER")}
                      </span>
                      <span className="text-gray-400text-sm mt-1">
                        {t("bank_transfer_desc")}
                      </span>
                      <input
                        type="radio"
                        name="plan"
                        id="plan-bank"
                        value="BANK_TRANSFER"
                        className="absolute h-0 w-0 appearance-none"
                        onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      />
                      <span
                        aria-hidden="true"
                        className={`${
                          paymentMethod === "BANK_TRANSFER" ? "block" : "hidden"
                        } absolute inset-0 border-2 border-gray500 bg-opacity-10 rounded-lg`}
                      >
                        <span className="absolute top-4 right-4 h-6 w-6 inline-flex items-center justify-center rounded-full bg-gray100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5 text-green-600"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="my-8">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        name="send-email-toggle"
                        id="send-email-toggle"
                        checked={sendEmail}
                        onChange={() => setSendEmail(!sendEmail)}
                        disabled={!email}
                        className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 ${
                          email
                            ? "border-gray300 cursor-pointer"
                            : "border-gray300 opacity-50 cursor-not-allowed"
                        } appearance-none`}
                      />
                      <label
                        htmlFor="send-email-toggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full ${
                          email
                            ? "bg-gray300 cursor-pointer"
                            : "bg-gray200 cursor-not-allowed"
                        }`}
                      ></label>
                    </div>
                    <label
                      htmlFor="send-email-toggle"
                      className={`text-xs ${
                        email ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {email
                        ? t("send_order_email")
                        : t("email_required_for_order_details") ||
                          "Nhập email để nhận chi tiết đơn hàng"}
                    </label>
                  </div>
                </div>

                <Button
                  value={t("place_order")}
                  size="xl"
                  extraClass={`w-full`}
                  onClick={() => setIsOrdering(true)}
                  disabled={disableOrder}
                  loading={isOrdering}
                />
              </div>

              {orderError !== "" && (
                <span className="text-red text-sm font-semibold">
                  - {orderError}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="app-max-width px-4 sm:px-8 md:px-20 mb-14 mt-6">
            <div className="text-gray-400text-base">{t("thank_you_note")}</div>
            <div className="flex flex-col md:flex-row">
              <div className="h-full w-full md:w-1/2 mt-2 lg:mt-4">
                <div className="border border-gray500 p-6 divide-y-2 divide-gray200">
                  <div className="flex justify-between">
                    <span className="text-base uppercase mb-3">
                      {t("order_id")}
                    </span>
                    <span className="text-base uppercase mb-3">
                      {completedOrder.orderId}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-base">{t("email_address")}</span>
                      <span className="text-base">
                        {completedOrder.customerInfo.email}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-base">{t("order_date")}</span>
                      <span className="text-base">
                        {new Date(
                          completedOrder.orderDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-base">{t("delivery_date")}</span>
                      <span className="text-base">
                        {new Date(
                          completedOrder.deliveryDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="py-3">
                    <div className="flex justify-between mb-2">
                      <span className="">{t("payment_method")}</span>
                      <span>
                        {getPaymentMethodName(completedOrder.paymentType)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">{t("delivery_method")}</span>
                      <span>
                        {getDeliveryTypeName(completedOrder.deliveryType)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {completedOrder.orderDetails &&
                      completedOrder.orderDetails.map((item) => (
                        <div
                          className="flex justify-between mb-2"
                          key={item.orderDetailId}
                        >
                          <span className="text-base">
                            {item.productName} x {item.quantity}
                            {item.discountPercent &&
                              item.discountPercent > 0 && (
                                <span className="ml-2 text-xs bg-red-500 px-1 py-0.5 rounded">
                                  -{item.discountPercent}%
                                </span>
                              )}
                          </span>
                          <span className="text-base">
                            + {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                  </div>

                  {completedOrder.orderDetails &&
                    completedOrder.orderDetails.some(
                      (item) => item.discountPercent && item.discountPercent > 0
                    ) && (
                      <div className="flex justify-between py-2 text-red-500">
                        <span>Giá gốc</span>
                        <span>
                          {" "}
                          {formatPrice(
                            completedOrder.orderDetails.reduce(
                              (total, item) => {
                                if (
                                  item.discountPercent &&
                                  item.discountPercent > 0
                                ) {
                                  const regularPrice =
                                    item.price * item.quantity;
                                  return total + regularPrice;
                                }
                                return total;
                              },
                              0
                            )
                          )}
                        </span>
                      </div>
                    )}

                  {/* Show total savings if any */}
                  {completedOrder.orderDetails &&
                    completedOrder.orderDetails.some(
                      (item) => item.discountPercent && item.discountPercent > 0
                    ) && (
                      <div className="flex justify-between py-2 text-red-500">
                        <span>{t("discount") || "Tiết kiệm"}</span>
                        <span>
                          -{" "}
                          {formatPrice(
                            completedOrder.orderDetails.reduce(
                              (total, item) => {
                                if (
                                  item.discountPercent &&
                                  item.discountPercent > 0
                                ) {
                                  const regularPrice =
                                    item.price * item.quantity;
                                  const discountedPrice =
                                    regularPrice * (item.discountPercent / 100);
                                  return total + discountedPrice;
                                }
                                return total;
                              },
                              0
                            )
                          )}
                        </span>
                      </div>
                    )}

                  {completedOrder.deliveryType && (
                    <div className="flex justify-between py-2 text-red-500">
                      <span>Phí ship</span>
                      <span>
                        {completedOrder.deliveryType === "SHIP"
                          ? "+ " + formatPrice(25000)
                          : "Miễn phí"}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between mb-2">
                    <span className="text-base uppercase">{t("total")}</span>
                    <span className="text-base">
                      {formatPrice(completedOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-full w-full md:w-1/2 md:ml-8 mt-4 md:mt-2 lg:mt-4">
                <div>
                  {t("your_order_received")}
                  {completedOrder.paymentType === "BANK_TRANSFER" &&
                    t("bank_transfer_note")}

                  {completedOrder.paymentType === "CASH_ON_DELIVERY" &&
                    completedOrder.deliveryType !== "STORE_PICKUP" &&
                    t("cash_delivery_note")}
                  {completedOrder.deliveryType === "STORE_PICKUP" &&
                    t("store_pickup_note")}
                  {t("thank_you_for_purchasing")}
                </div>
                <div>
                  Fanpage:{" "}
                  <a
                    href="https://www.facebook.com/lumenvn/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lumen Fashion
                  </a>
                </div>

                {completedOrder.paymentType === "BANK_TRANSFER" ? (
                  <div className="mt-6">
                    <h2 className="text-xl font-bold">
                      {t("our_banking_details")}
                    </h2>
                    <span className="uppercase block my-1">
                      Chủ tài khoản : Lê Xuân Thọ
                    </span>

                    <div className="flex justify-between w-full xl:w-1/2">
                      <span className="text-sm font-bold">VP BANK</span>
                      <span className="text-base">0942471636</span>
                    </div>
                    <div className="flex justify-between w-full xl:w-1/2">
                      <span className="text-sm font-bold">MB BANK </span>
                      <span className="text-base">0942471636</span>
                    </div>
                    <div className="flex justify-between w-full xl:w-1/2">
                      <span className="text-sm font-bold">SHB</span>
                      <span className="text-base">1012966393</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-56">
                    <div className="w-3/4 product-image-container mb-4">
                      <Image
                        className="product-image justify-center"
                        src="/logo.svg"
                        alt="Lumen Fashion"
                        width={220}
                        height={50}
                        layout="responsive"
                        objectFit="contain"
                      />
                    </div>
                    <a
                      href="https://www.facebook.com/lumenvn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="mr-2"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                      Theo dõi chúng tôi trên Facebook
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== Footer Section ===== */}
      <Footer />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "vi" }) => {
  return {
    props: {
      messages: (await import(`../messages/common/${locale}.json`)).default,
    },
  };
};

export default ShoppingCart;
