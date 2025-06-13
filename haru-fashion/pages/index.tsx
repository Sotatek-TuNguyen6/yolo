import React, { useState, useEffect } from "react";
import { GetServerSideProps, GetStaticProps } from "next";
import Image from "next/image";
import { useTranslations } from "next-intl";
import axios from "axios";
import Link from "next/link";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Button from "../components/Buttons/Button";
import Slideshow from "../components/HeroSection/Slideshow";
import OverlayContainer from "../components/OverlayContainer/OverlayContainer";
import Card from "../components/Card/Card";
import TestiSlider from "../components/TestiSlider/TestiSlider";
import { apiProductsType, itemType } from "../context/cart/cart-types";
import LinkButton from "../components/Buttons/LinkButton";

// /bg-img/ourshop.png
import ourShop from "../public/bg-img/ourshop.png";

type CategoryProductsType = {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  products: itemType[];
};

type Props = {
  categoryProducts: CategoryProductsType[];
  featuredProducts: itemType[];
};

const Home: React.FC<Props> = ({ categoryProducts, featuredProducts }) => {
  const t = useTranslations("Index");
  const [currentItems, setCurrentItems] = useState(featuredProducts);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isFetching) return;
    const fetchData = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_PROD_BACKEND_URL}/api/v1/products?order_by=createdAt.desc&offset=${currentItems.length}&limit=10`
      );
      const fetchedProducts = res.data.data.map((product: apiProductsType) => ({
        ...product,
        images: product.images,
      }));
      setCurrentItems((products) => [...products, ...fetchedProducts]);
      setIsFetching(false);
    };
    fetchData();
  }, [isFetching, currentItems.length]);

  const handleSeemore = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setIsFetching(true);
  };

  // Lấy 4 sản phẩm bán chạy nhất (có thể thay bằng logic khác)
  const bestSellingProducts = featuredProducts.slice(0, 4);

  return (
    <>
      {/* ===== Header Section ===== */}
      <Header />

      {/* ===== Carousel Section ===== */}
      <Slideshow />

      <main id="main-content" className="-mt-20">
        {/* ===== Category Section ===== */}
        <section className="w-full h-auto py-10 border border-b-2 border-gray-100">
          <div className="app-max-width app-x-padding h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="w-full cursor-pointer">
              <OverlayContainer
                imgSrc="/bg-img/hangmoi.jpg"
                imgAlt="Hàng mới về"
                url="/product-category/new-arrivals"
              />
            </div>
            <div className="w-full cursor-pointer">
              <OverlayContainer
                imgSrc="/bg-img/quan.jpg"
                imgAlt="Quần nam"
                url="/product-category/quan-nam"
              />
            </div>
            <div className="w-full cursor-pointer">
              <OverlayContainer
                imgSrc="/bg-img/ao.jpg"
                imgAlt="Áo nam"
                url="/product-category/ao-nam"
              />
            </div>
            <div className="w-full cursor-pointer">
              <OverlayContainer
                imgSrc="/bg-img/sport.jpg"
                imgAlt="Sport"
                url="/product-category/sport-wear"
              />
            </div>
          </div>
        </section>

        {/* ===== Best Selling Section ===== */}
        <section className="app-max-width w-full h-full flex flex-col justify-center mt-16 mb-20">
          <div className="flex justify-center">
            <div className="w-3/4 sm:w-1/2 md:w-1/3 text-center mb-8">
              <h2 className="text-3xl mb-4">{t("best_selling")}</h2>
              {/* <span>{t("best_selling_desc")}</span> */}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 lg:gap-x-12 gap-y-6 mb-10 app-x-padding">
            {bestSellingProducts.map((item) => (
              <Card key={item.productId} item={item} />
            ))}
          </div>
        </section>

        {/* ===== Testimonial Section ===== */}
        <section className="w-full hidden h-full py-16 md:flex flex-col items-center bg-lightgreen">
          <TestiSlider />
        </section>

        {/* ===== Featured Products Section ===== */}
        <section className="app-max-width app-x-padding my-16 flex flex-col">
          <div className="text-center mb-6">
            <h2 className="text-3xl">{t("featured_products")}</h2>
          </div>

          {/* Hiển thị sản phẩm theo danh mục */}
          {categoryProducts.map((category) => (
            <div key={category.categoryId} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{category.categoryName}</h3>
                <Link
                  href={`/product-category/${category.categorySlug}`}
                  passHref
                >
                  <span className="text-rose-500 hover:text-rose-600 font-medium flex items-center">
                    Xem tất cả
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 mb-8">
                {category.products.slice(0, 4).map((product) => (
                  <Card key={product.productId} item={product} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="border-gray-100 border-b-2"></div>

        {/* ===== Our Shop Section */}
        <section className="app-max-width mt-16 mb-20 flex flex-col justify-center items-center text-center">
          <div className="textBox w-3/4 md:w-2/4 lg:w-2/5 mb-6">
            <h2 className="text-3xl mb-6">{t("our_shop")}</h2>
            {/* <span className="w-full">{t("our_shop_desc")}</span> */}
          </div>
          <div className="w-full app-x-padding flex justify-center">
            <Image src={ourShop} alt="Our Shop" />
          </div>
        </section>
      </main>

      {/* ===== Footer Section ===== */}
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    // Lấy sản phẩm theo danh mục
    const categoryRes = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/group-product-by-category`
    );

    // Lấy sản phẩm nổi bật
    const featuredRes = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products?limit=10`
    );

    // Xử lý dữ liệu sản phẩm theo danh mục
    const categoryProducts = categoryRes.data.data.map((category: any) => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      categorySlug: category.categorySlug,
      products: category.products.map((product: apiProductsType) => ({
        _id: product._id,
        productId: product.productId,
        name: product.name,
        price: product.price,
        images: product.images,
        tags: product.tags,
        discountPercent: product.discountPercent,
        slug: product?.slug || "",
      })),
    }));

    // Xử lý dữ liệu sản phẩm nổi bật
    const featuredProducts = featuredRes.data.data.map(
      (product: apiProductsType) => ({
        _id: product._id,
        productId: product.productId,
        name: product.name,
        price: product.price,
        images: product.images,
        tags: product.tags,
        discountPercent: product.discountPercent,
        slug: product?.slug || "",
      })
    );

    return {
      props: {
        messages: {
          ...require(`../messages/common/${locale}.json`),
        },
        categoryProducts,
        featuredProducts,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        messages: {
          ...require(`../messages/common/${locale}.json`),
        },
        categoryProducts: [],
        featuredProducts: [],
      },
    };
  }
};

export default Home;
