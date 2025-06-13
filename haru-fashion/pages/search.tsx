import { useCallback, useEffect, useState } from "react";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslations } from "next-intl";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Card from "../components/Card/Card";
import Pagination from "../components/Util/Pagination";
import useWindowSize from "../components/Util/useWindowSize";
import { apiProductsType, itemType } from "../context/cart/cart-types";
import axios from "axios";

type Props = {
  items: itemType[];
  searchWord: string;
};

const Search: React.FC<Props> = ({ items, searchWord }) => {
  console.log(items);
  const t = useTranslations("Search");

  return (
    <div>
      {/* ===== Head Section ===== */}
      <Header
        title={`Thời trang nam cao cấp | Thương hiệu quần áo nam Lumen`}
      />

      <main id="main-content">
        {/* ===== Breadcrumb Section ===== */}
        <div className="bg-lightgreen h-16 w-full flex items-center">
          <div className="app-x-padding app-max-width w-full">
            <div className="breadcrumb">
              <Link href="/">
                <a className="text-gray-400">{t("home")}</a>
              </Link>{" "}
              / <span>{t("search_results")}</span>
            </div>
          </div>
        </div>

        {/* ===== Heading & Filter Section ===== */}
        <div className="app-x-padding app-max-width w-full mt-8">
          <h1 className="text-3xl mb-2">
            {t("search_results")}: &quot;{searchWord}&quot;
          </h1>
          {items.length > 0 && (
            <div className="flex justify-between mt-6">
              <span>
                {t("showing_results", {
                  products: items.length,
                })}
              </span>
            </div>
          )}
        </div>

        {/* ===== Main Content Section ===== */}
        <div className="app-x-padding app-max-width mt-3 mb-14">
          {items.length < 1 ? (
            <div className="flex justify-center items-center h-72">
              {t("no_result")}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 sm:gap-y-6 mb-10">
              {items.map((item) => (
                <Card key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ===== Footer Section ===== */}
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  query: { q = "" },
}) => {
  try {
    // Encode query parameter to handle Vietnamese characters properly
    const encodedQuery = encodeURIComponent(q as string);

    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_PROD_BACKEND_URL}/api/v1/products/search/any/product?q=${encodedQuery}`
    );
    console.log(res.data.data);
    // console.log(res.data.data);
    const fetchedProducts: apiProductsType[] = res.data.data.map(
      (product: apiProductsType) => ({
        ...product,
        img1: product.images?.[0] || null,
        img2: product.images?.[1] || null,
      })
    );

    let items: apiProductsType[] = [];
    fetchedProducts.forEach((product: apiProductsType) => {
      items.push(product);
    });

    return {
      props: {
        messages: (await import(`../messages/common/${locale}.json`)).default,
        items,
        searchWord: q,
      },
    };
  } catch (error) {
    console.log("error", error);
    return {
      props: {
        messages: (await import(`../messages/common/${locale}.json`)).default,
        items: [],
        searchWord: q,
      },
    };
  }
};

export default Search;
