const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
  async redirects() {
    return [
      {
        source: "/feature-requests",
        destination: "https://mailpilot.canny.io/feature-requests",
        permanent: true,
      },
      {
        source: "/roadmap",
        destination: "https://mailpilot.canny.io/",
        permanent: true,
      },
      {
        source: "/github",
        destination: "https://github.com/areal/mailpilot",
        permanent: true,
      },
      {
        source: "/discord",
        destination: "https://discord.gg/UnBwsydrug",
        permanent: true,
      },
    ];
  },
};

module.exports = withContentlayer(nextConfig);
