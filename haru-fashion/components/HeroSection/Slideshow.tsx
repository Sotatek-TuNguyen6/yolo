import { useTranslations } from "next-intl";
import Image from "next/image";

import TextButton from "../Buttons/TextButton";
import styles from "./Hero.module.css";

// swiperjs
import { Swiper, SwiperSlide } from "swiper/react";

// import Swiper core and required modules
import SwiperCore, { Autoplay, Navigation, Pagination } from "swiper/core";

// install Swiper modules
SwiperCore.use([Pagination, Navigation, Autoplay]);

const sliders = [
  {
    id: 2,
    image: "/bg-img/banner-bst-lumen-1.jpg",
    imageTablet: "/bg-img/banner-bst-lumen-1-tablet.jpg",
    imageMobile: "/bg-img/banner-bst-lumen-1-mobile.jpg",
    subtitle: "",
    titleUp: "",
    titleDown: "",
    rightText: false,
    isBuyNow: false,
  },
  {
    id: 1,
    image: "/bg-img/banner-lumen-2.jpg",
    imageTablet: "/bg-img/banner-lumen-2-tablet.jpg",
    imageMobile: "/bg-img/banner-lumen-2-mobile.jpg",
    subtitle: "",
    titleUp: "",
    titleDown: "",
    rightText: true,
    isBuyNow: false,
  },
];

const Slideshow = () => {
  const t = useTranslations("Index");

  return (
    <>
      <div className="relative -top-20 slide-container w-full z-20">
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={true}
          pagination={{
            clickable: true,
            // type: "fraction",
            // dynamicBullets: true,
          }}
          className="mySwiper"
        >
          {sliders.map((slider) => (
            <SwiperSlide key={slider.id}>
              <div className="hidden lg:block">
                <Image
                  layout="responsive"
                  src={slider.image}
                  width={1144}
                  height={572}
                  alt={"some name"}
                />
              </div>
              <div className="hidden sm:block lg:hidden">
                <Image
                  layout="responsive"
                  src={slider.imageTablet}
                  width={820}
                  height={720}
                  alt={"some name"}
                />
              </div>
              <div className="sm:hidden">
                <Image
                  layout="responsive"
                  src={slider.imageMobile}
                  width={428}
                  height={800}
                  alt={"some name"}
                />
              </div>
              {/* <div
                className={
                  slider.rightText
                    ? styles.rightTextSection
                    : styles.leftTextSection
                }
              >
                <span className={styles.subtitle}>{slider.subtitle}</span>
                <span
                  className={`${styles.title} text-center ${
                    slider.rightText ? "sm:text-right" : "sm:text-left"
                  }`}
                >
                  {slider.titleUp} <br />
                  {slider.titleDown}
                </span>
                {slider.isBuyNow && <TextButton value={t("shop_now")} />}
              </div> */}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default Slideshow;
