import { Fragment, useState, useEffect, useRef } from "react";
import { Menu as HMenu } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

import MenuIcon from "../../public/icons/MenuIcon";
import AuthForm from "../Auth/AuthForm";
import WhistlistIcon from "../../public/icons/WhistlistIcon";
import UserIcon from "../../public/icons/UserIcon";
import SearchIcon from "../../public/icons/SearchIcon";
import DownArrow from "../../public/icons/DownArrow";
import InstagramLogo from "../../public/icons/InstagramLogo";
import FacebookLogo from "../../public/icons/FacebookLogo";
import { useWishlist } from "../../context/wishlist/WishlistProvider";
import { useAuth } from "../../context/AuthContext";

// Add an interface for the search result products
interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  productId: string;
  images: Array<{
    url: string[];
    color?: string;
    colorCode?: string;
  }>;
}

export default function Menu() {
  const t = useTranslations("Navigation");
  const router = useRouter();
  const { asPath, locale } = router;
  const { wishlist } = useWishlist();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate Number of Wishlist
  let noOfWishlist = wishlist.length;

  function closeModal() {
    setOpen(false);
  }

  function openModal() {
    setOpen(true);
  }

  const fetchSearchResults = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/products/search/any/product?query=${term}`
      );
      const data = await res.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchSearchResults(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      closeModal();
    }
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label="Hamburger Menu"
          onClick={openModal}
          className="focus:outline-none"
        >
          <MenuIcon />
        </button>
      </div>
      <Transition show={open} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          style={{ zIndex: 99999 }}
          static
          open={open}
          onClose={closeModal}
        >
          <div className="min-h-screen">
            <Transition.Child as={Fragment}>
              <Dialog.Overlay className="fixed inset-0 bg-gray500 opacity-50" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="ease-linear duration-600"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-linear duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div
                style={{ height: "100vh" }}
                className="relative opacity-95 overflow-y-auto inline-block dur h-screen w-full max-w-md overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl"
              >
                <div className="flex justify-between items-center p-6 pb-0">
                  <Link href="/">
                    <a>
                      <Image
                        className="justify-center"
                        src="/logo.svg"
                        alt="Picture of the author"
                        width={85}
                        height={22}
                      />
                    </a>
                  </Link>
                  <button
                    type="button"
                    className="outline-none focus:outline-none text-3xl sm:text-2xl"
                    onClick={closeModal}
                  >
                    &#10005;
                  </button>
                </div>

                <div className="mb-10">
                  <div className="itemContainer px-6 w-full flex flex-col justify-around items-center">
                    <form
                      className="flex w-full justify-between items-center mt-5 mb-1 border-gray300 border-b-2 relative"
                      onSubmit={handleSubmit}
                    >
                      <SearchIcon extraClass="text-gray300 w-6 h-6" />
                      <input
                        type="search"
                        placeholder={t("search_anything")}
                        className="px-4 py-2 w-full focus:outline-none text-xl"
                        onChange={handleChange}
                        value={searchTerm}
                        ref={searchInputRef}
                      />
                      {/* {searchTerm && (
                        <button
                          type="button"
                          className="absolute right-0 mr-2 text-gray400"
                          onClick={() => {
                            setSearchTerm("");
                            setSearchResults([]);
                            if (searchInputRef.current) searchInputRef.current.focus();
                          }}
                        >
                          ✕
                        </button>
                      )} */}
                    </form>
                    {searchTerm && (
                      <div className="w-full relative">
                        <div className="absolute w-full bg-white shadow-lg rounded-b-md z-50 max-h-96 overflow-y-auto border border-gray200">
                          {isSearching ? (
                            <div className="p-4 text-center text-gray500">
                              <div className="w-6 h-6 border-2 border-t-2 border-gray500 rounded-full animate-spin mx-auto mb-2"></div>
                              {t("searching")}...
                            </div>
                          ) : searchResults.length > 0 ? (
                            <>
                              {searchResults.map((product) => (
                                <Link
                                  href={`/products/${product.productId}`}
                                  key={product._id}
                                >
                                  <a
                                    className="flex items-center p-3 border-b border-gray200 hover:bg-gray100"
                                    onClick={closeModal}
                                  >
                                    {product.images && product.images[0] && (
                                      <div className="w-12 h-12 mr-4 relative flex-shrink-0">
                                        <Image
                                          src={product.images[0].url[0]}
                                          alt={product.name}
                                          width={48}
                                          height={48}
                                          className="w-full h-full object-cover rounded"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h4 className="text-sm font-medium text-gray800 line-clamp-1">
                                        {product.name}
                                      </h4>
                                      <div className="flex items-center mt-1">
                                        <span className="text-sm font-medium text-gray500">
                                          {locale === "vi"
                                            ? `${new Intl.NumberFormat(
                                                "vi-VN"
                                              ).format(product.price)}\u00A0₫`
                                            : `$\u00A0${product.price}`}
                                        </span>
                                        {product.discountPercent &&
                                          product.discountPercent > 0 && (
                                            <>
                                              <span className="text-xs line-through text-gray400 ml-2">
                                                {locale === "vi"
                                                  ? `${new Intl.NumberFormat(
                                                      "vi-VN"
                                                    ).format(
                                                      product.originalPrice || 0
                                                    )}\u00A0₫`
                                                  : `$\u00A0${
                                                      product.originalPrice || 0
                                                    }`}
                                              </span>
                                              <span className="ml-2 text-xs bg-red-500 text-white px-1 py-0.5 rounded">
                                                -{product.discountPercent}%
                                              </span>
                                            </>
                                          )}
                                      </div>
                                    </div>
                                  </a>
                                </Link>
                              ))}
                              <Link
                                href={`/search?q=${encodeURIComponent(
                                  searchTerm
                                )}`}
                              >
                                <a
                                  className="block p-3 text-center text-blue-600 hover:bg-gray100 font-medium"
                                  onClick={closeModal}
                                >
                                  {t("view_all_results")} (
                                  {searchResults.length})
                                </a>
                              </Link>
                            </>
                          ) : (
                            <div className="p-4 text-center text-gray500">
                              {t("no_results_found")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <Link href="/product-category/men">
                      <a
                        className="w-full text-xl hover:bg-gray100 text-left py-2"
                        onClick={closeModal}
                      >
                        {t("men")}
                      </a>
                    </Link>
                    <Link href="/product-category/women">
                      <a
                        className="w-full text-xl hover:bg-gray100 text-left py-2"
                        onClick={closeModal}
                      >
                        {t("women")}
                      </a>
                    </Link>
                    <Link href="/product-category/bags">
                      <a
                        className="w-full text-xl hover:bg-gray100 text-left py-2"
                        onClick={closeModal}
                      >
                        {t("bags")}
                      </a>
                    </Link>
                    <Link href="/blogs">
                      <a
                        className="w-full text-xl hover:bg-gray100 text-left py-2"
                        onClick={closeModal}
                      >
                        {t("blogs")}
                      </a>
                    </Link>
                    <Link href="/order-tracking">
                      <a
                        className="w-full text-xl hover:bg-gray100 text-left py-2"
                        onClick={closeModal}
                      >
                        {t("order_tracking")}
                      </a>
                    </Link>
                    <Link href="/about">
                      <a
                        className="w-full text-xl hover:bg-gray100 text-left py-2"
                        onClick={closeModal}
                      >
                        {t("about_us")}
                      </a>
                    </Link>
                    <Link href="/contact">
                      <a
                        className="w-full text-xl hover:bg-gray100 text-left py-2"
                        onClick={closeModal}
                      >
                        {t("contact_us")}
                      </a>
                    </Link>
                    <hr className="border border-gray300 w-full mt-2" />
                    <div className="w-full text-xl py-2 my-3 flex justify-between">
                      <AuthForm extraClass="flex justify-between w-full">
                        <span>{auth.user ? t("profile") : t("login")}</span>
                        <UserIcon />
                      </AuthForm>
                    </div>
                    <hr className="border border-gray300 w-full" />
                    <Link href="/wishlist">
                      <a className="text-xl py-2 my-3 w-full flex justify-between">
                        <span>{t("wishlist")}</span>
                        <div className="relative">
                          <WhistlistIcon />
                          {noOfWishlist > 0 && (
                            <span
                              className={`absolute text-xs -top-0 -left-7 bg-gray500 text-gray100 py-1 px-2 rounded-full`}
                            >
                              {noOfWishlist}
                            </span>
                          )}
                        </div>
                      </a>
                    </Link>
                    <hr className="border border-gray300 w-full" />

                    {/* Locale Dropdown */}
                    <HMenu
                      as="div"
                      className="relative bg-gray100 mt-4 mb-2 w-full"
                    >
                      <HMenu.Button
                        as="a"
                        href="#"
                        className="flex justify-center items-center py-2 px-4 text-center"
                      >
                        {locale === "en"
                          ? t("english")
                          : locale === "vi"
                          ? t("vietnamese") || "Tiếng Việt"
                          : t("myanmar")}{" "}
                        <DownArrow />
                      </HMenu.Button>
                      <HMenu.Items
                        className="flex flex-col w-full right-0 absolute p-1 border border-gray200 bg-white mt-2 outline-none"
                        style={{ zIndex: 9999 }}
                      >
                        <HMenu.Item>
                          <Link href={asPath} locale="en">
                            <a
                              className={`${
                                locale === "en"
                                  ? "bg-gray200 text-gray500"
                                  : "bg-white text-gray500"
                              } py-2 px-4 text-center focus:outline-none`}
                            >
                              {t("english")}
                            </a>
                          </Link>
                        </HMenu.Item>
                        <HMenu.Item>
                          <Link href={asPath} locale="my">
                            <a
                              className={`${
                                locale === "my"
                                  ? "bg-gray200 text-gray500"
                                  : "bg-white text-gray500"
                              } py-2 px-4 text-center focus:outline-none`}
                            >
                              {t("myanmar")}
                            </a>
                          </Link>
                        </HMenu.Item>

                        <HMenu.Item>
                          <Link href={asPath} locale="vi">
                            <a
                              className={`${
                                locale === "vi"
                                  ? "bg-gray200 text-gray500"
                                  : "bg-white text-gray500"
                              } py-2 px-4 text-center focus:outline-none`}
                            >
                              {t("vietnamese") || "Tiếng Việt"}
                            </a>
                          </Link>
                        </HMenu.Item>
                      </HMenu.Items>
                    </HMenu>

                    {/* Currency Dropdown */}
                    <HMenu as="div" className="relative bg-gray100 my-2 w-full">
                      <HMenu.Button
                        as="a"
                        href="#"
                        className="flex justify-center items-center py-2 px-4 text-center"
                      >
                        {t("usd")} <DownArrow />
                      </HMenu.Button>
                      <HMenu.Items
                        className="flex flex-col w-full right-0 absolute p-1 border border-gray200 bg-white mt-2 outline-none"
                        style={{ zIndex: 9999 }}
                      >
                        <HMenu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={`${
                                active
                                  ? "bg-gray100 text-gray500"
                                  : "bg-white text-gray500"
                              } py-2 px-4 text-center focus:outline-none`}
                            >
                              {t("usd")}
                            </a>
                          )}
                        </HMenu.Item>
                        <HMenu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={`${
                                active
                                  ? "bg-gray100 text-gray500"
                                  : "bg-white text-gray500"
                              } py-2 px-4 text-center focus:outline-none`}
                            >
                              {t("mmk")}
                            </a>
                          )}
                        </HMenu.Item>
                      </HMenu.Items>
                    </HMenu>

                    <div className="flex my-10 w-2/5 space-x-6 justify-center">
                      <a
                        href="https://www.facebook.com/lumenvn/"
                        className="text-gray400 w-10 h-10 py-1 px-auto flex justify-center rounded-md active:bg-gray300"
                        aria-label="Lumen Fashion Facebook Page"
                      >
                        <FacebookLogo extraClass="h-8" />
                      </a>
                      <a
                        href="#"
                        className="text-gray400 w-10 h-10 py-1 px-auto flex justify-center rounded-md active:bg-gray300"
                        aria-label="Lumen Fashion Facebook Page"
                      >
                        <InstagramLogo extraClass="h-8" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
