const withPWA = require("next-pwa");

module.exports = withPWA({
  // module.exports = {
  i18n: {
    locales: ["en", "my", "vi"],
    defaultLocale: "vi",
  },
  reactStrictMode: true,
  // swcMinify: true,
  compiler: {
    removeConsole: false,
  },
  images: {
    domains: ["robohash.org", "res.cloudinary.com"],
  },
  pwa: {
    dest: "public",
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  },
  // };
});
