import { Menu } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import Link from "next/link";

import InstagramLogo from "../../public/icons/InstagramLogo";
import FacebookLogo from "../../public/icons/FacebookLogo";
import DownArrow from "../../public/icons/DownArrow";
import styles from "./Header.module.css";

type LinkProps = {
  href: string;
  locale: "en" | "my" | "vi";
  active: boolean;
};

const MyLink: React.FC<LinkProps> = ({
  href,
  locale,
  children,
  active,
  ...rest
}) => {
  return (
    <Link href={href} locale={locale}>
      <a
        className={`py-2 px-4 text-center ${
          active ? "bg-gray200 text-gray-500" : "bg-white text-gray-500"
        }`}
        {...rest}
      >
        {children}
      </a>
    </Link>
  );
};

const TopNav = () => {
  const router = useRouter();
  const { asPath, locale } = router;
  const t = useTranslations("Navigation");

  // Get the appropriate language code for display
  const getLanguageCode = () => {
    if (locale === "en") return t("eng");
    if (locale === "vi") return "Vie";
    return t("myn");
  };

  return (
    <div className="bg-gray-500 text-gray100 hidden lg:block">
      <div className="flex justify-between app-max-width">
        <ul className={`flex ${styles.topLeftMenu}`}>
          <li>
            <a href="https://www.facebook.com/lumenvn/" aria-label="Lumen Fashion Facebook Page">
              <FacebookLogo />
            </a>
          </li>
          <li>
            <a href="#" aria-label="Lumen Fashion Instagram Account">
              <InstagramLogo />
            </a>
          </li>
          <li>
            <a href="#">{t("about_us")}</a>
          </li>
          <li>
            <a href="#">{t("our_policy")}</a>
          </li>
        </ul>
        {/* <ul className={`flex ${styles.topRightMenu}`}>
          <li>
            <Menu as="div" className="relative">
              <Menu.Button as="a" href="#" className="flex">
                {getLanguageCode()} <DownArrow />
              </Menu.Button>
              <Menu.Items
                className="flex flex-col w-20 right-0 absolute p-1 border border-gray-200 bg-white mt-2 outline-none"
                style={{ zIndex: 9999 }}
              >
                <Menu.Item>
                  {({ active }) => (
                    <MyLink active={active} href={asPath} locale="en">
                      {t("eng")}
                    </MyLink>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <MyLink active={active} href={asPath} locale="my">
                      {t("myn")}
                    </MyLink>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <MyLink active={active} href={asPath} locale="vi">
                      Vie
                    </MyLink>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </li>
          <li>
            <Menu as="div" className="relative">
              <Menu.Button as="a" href="#" className="flex">
                {t("usd")} <DownArrow />
              </Menu.Button>
              <Menu.Items
                className="flex flex-col w-20 right-0 absolute p-1 border border-gray-200 bg-white mt-2 outline-none"
                style={{ zIndex: 9999 }}
              >
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={`${
                        active
                          ? "bg-gray100 text-gray-500"
                          : "bg-white text-gray-500"
                      } py-2 px-4 text-center focus:outline-none`}
                    >
                      {t("usd")}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={`${
                        active
                          ? "bg-gray100 text-gray-500"
                          : "bg-white text-gray-500"
                      } py-2 px-4 text-center focus:outline-none`}
                    >
                      {t("mmk")}
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </li>
        </ul> */}
      </div>
    </div>
  );
};

export default TopNav;
