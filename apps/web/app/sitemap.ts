import type { MetadataRoute } from "next";
import { unstable_noStore } from "next/cache";
import { getSanityBlogPostsForSitemap } from "@/utils/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // to try fix caching issue: https://github.com/vercel/next.js/discussions/56708#discussioncomment-10127496
  unstable_noStore();

  const blogPosts = await getSanityBlogPostsForSitemap();

  const staticUrls = [
    {
      url: "https://www.mailpilot.dev/",
      priority: 1,
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
      url: "https://www.mailpilot.dev/clean-inbox",
    },
    {
      url: "https://www.mailpilot.dev/enterprise",
    },
    {
      url: "https://www.mailpilot.dev/founders",
    },
    {
      url: "https://www.mailpilot.dev/small-business",
    },
    {
      url: "https://www.mailpilot.dev/creator",
    },
    {
      url: "https://www.mailpilot.dev/real-estate",
    },
    {
      url: "https://www.mailpilot.dev/support",
    },
    {
      url: "https://www.mailpilot.dev/ecommerce",
    },
    {
      url: "https://www.mailpilot.dev/msp",
    },
    {
      url: "https://www.mailpilot.dev/commercial-real-estate",
    },
    {
      url: "https://www.mailpilot.dev/law-firms",
    },
    {
      url: "https://www.mailpilot.dev/accounting-firms",
    },
    {
      url: "https://www.mailpilot.dev/property-management",
    },
    {
      url: "https://www.mailpilot.dev/insurance-agencies",
    },
    {
      url: "https://www.mailpilot.dev/recruiting",
    },
    {
      url: "https://www.mailpilot.dev/construction",
    },
    {
      url: "https://www.mailpilot.dev/travel-advisors",
    },
    {
      url: "https://www.mailpilot.dev/executive-assistants",
    },
    {
      url: "https://www.mailpilot.dev/operations-managers",
    },
    {
      url: "https://www.mailpilot.dev/auto-file-email-attachments",
    },
    {
      url: "https://www.mailpilot.dev/email-follow-up-tracker",
    },
    {
      url: "https://www.mailpilot.dev/client-intake-email-automation",
    },
    {
      url: "https://www.mailpilot.dev/organize-document-heavy-email",
    },
    {
      url: "https://www.mailpilot.dev/meeting-briefs-for-client-teams",
    },
    {
      url: "https://www.mailpilot.dev/ai-assistant-chat",
    },
    {
      url: "https://www.mailpilot.dev/slack-integration",
    },
    {
      url: "https://www.mailpilot.dev/telegram-integration",
    },
    {
      url: "https://www.mailpilot.dev/teams-integration",
    },
    {
      url: "https://www.mailpilot.dev/cli",
    },
    {
      url: "https://www.mailpilot.dev/openclaw",
    },
    {
      url: "https://www.mailpilot.dev/privacy",
    },
    {
      url: "https://www.mailpilot.dev/terms",
    },
    {
      url: "https://www.mailpilot.dev/blog",
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://www.mailpilot.dev/best-fyxer-alternative",
    },
    {
      url: "https://www.mailpilot.dev/best-perplexity-email-assistant-alternative",
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
  ];

  return [...staticUrls, ...blogPosts];
}
