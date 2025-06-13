import { NextComponentType, NextPageContext } from "next";
import Router, { useRouter } from "next/router";
import NProgress from "nprogress";
import { NextIntlProvider } from "next-intl";
import { useEffect } from "react";

import { ProvideCart } from "../context/cart/CartProvider";
import { ProvideWishlist } from "../context/wishlist/WishlistProvider";
import { ProvideAuth } from "../context/AuthContext";

import "../styles/globals.css";
import "animate.css";
import "nprogress/nprogress.css";

// Import Swiper styles
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
import "swiper/components/pagination/pagination.min.css";
import "swiper/components/scrollbar/scrollbar.min.css";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

type AppCustomProps = {
  Component: NextComponentType<NextPageContext, any, {}>;
  pageProps: any;
  cartState: string;
  wishlistState: string;
};

const MyApp = ({ Component, pageProps }: AppCustomProps) => {
  const router = useRouter();

  useEffect(() => {
    // Nếu không có locale hoặc locale là 'en', chuyển hướng đến locale 'vi'
    if (!router.locale || router.locale === 'en') {
      const { pathname, asPath, query } = router;
      router.push({ pathname, query }, asPath, { locale: 'vi' });
    }
  }, [router.locale]);

  return (
    <NextIntlProvider messages={pageProps?.messages}>
      <ProvideAuth>
        <ProvideWishlist>
          <ProvideCart>
            <div className="flex flex-col min-h-screen">
              <Component {...pageProps} />
            </div>
          </ProvideCart>
        </ProvideWishlist>
      </ProvideAuth>
    </NextIntlProvider>
  );
};

export default MyApp;
