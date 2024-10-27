import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      "https://www.mailpilot.dev/sitemap.xml",
      "https://docs.mailpilot.dev/sitemap.xml",
    ],
  };
}
