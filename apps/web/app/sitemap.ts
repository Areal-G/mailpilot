import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import { postSlugsQuery } from "@/sanity/lib/queries";

async function getBlogPosts() {
  const posts = await sanityFetch<{ slug: string }[]>({
    query: postSlugsQuery,
  });
  return posts.map((post) => ({
    url: `https://www.mailpilot.dev/blog/post/${post.slug}`,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts();

  const staticUrls = [
    {
      url: "https://www.mailpilot.dev/",
    },
    {
      url: "https://www.mailpilot.dev/bulk-email-unsubscriber",
    },
    {
      url: "https://www.mailpilot.dev/ai-automation",
    },
    {
      url: "https://www.mailpilot.dev/email-analytics",
    },
    {
      url: "https://www.mailpilot.dev/block-cold-emails",
    },
    {
      url: "https://www.mailpilot.dev/new-email-senders",
    },
    {
      url: "https://www.mailpilot.dev/privacy",
    },
    {
      url: "https://www.mailpilot.dev/terms",
    },
    {
      url: "https://www.mailpilot.dev/blog",
    },
    {
      url: "https://www.mailpilot.dev/blog/post/how-my-open-source-saas-hit-first-on-product-hunt",
    },
    {
      url: "https://www.mailpilot.dev/blog/post/why-build-an-open-source-saas",
    },
    {
      url: "https://www.mailpilot.dev/blog/post/alternatives-to-skiff-mail",
    },
    {
      url: "https://www.mailpilot.dev/blog/post/best-email-unsubscribe-app",
    },
    {
      url: "https://www.mailpilot.dev/blog/post/bulk-unsubscribe-from-emails",
    },
    {
      url: "https://www.mailpilot.dev/blog/post/escape-email-trap-unsubscribe-for-good",
    },
    {
      url: "https://docs.mailpilot.dev/",
    },
    {
      url: "https://docs.mailpilot.dev/introduction",
    },
    {
      url: "https://docs.mailpilot.dev/essentials/email-ai-automation",
    },
    {
      url: "https://docs.mailpilot.dev/essentials/bulk-email-unsubscriber",
    },
    {
      url: "https://docs.mailpilot.dev/essentials/cold-email-blocker",
    },
  ];

  return [...staticUrls, ...blogPosts];
}
