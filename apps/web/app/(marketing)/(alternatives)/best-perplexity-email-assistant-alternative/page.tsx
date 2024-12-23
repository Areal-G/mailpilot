import type { Metadata } from "next";
import { Content } from "./content";
import { StructuredData } from "@/app/(marketing)/blog/post/StructuredData";

export const metadata: Metadata = {
  title:
    "Best Perplexity Email Assistant Alternative in 2025: Mail Pilot Comparison",
  description:
    "Looking for a better Perplexity Email Assistant alternative? Compare Perplexity vs Mail Pilot for email management. Get more customization, bulk unsubscribe, and better pricing with Mail Pilot.",
  keywords: [
    "Perplexity alternative",
    "Perplexity Email Assistant alternative",
    "Perplexity vs Mail Pilot",
    "best email management tool",
    "AI email assistant",
    "email productivity app",
    "Perplexity email review",
    "email automation tool",
    "bulk unsubscribe",
  ],
  alternates: {
    canonical:
      "https://www.mailpilot.dev/best-perplexity-email-assistant-alternative",
  },
  openGraph: {
    title:
      "Best Perplexity Email Assistant Alternative in 2025: Mail Pilot Comparison",
    description:
      "Looking for a better Perplexity Email Assistant alternative? Compare Perplexity vs Mail Pilot. Get full customization, bulk unsubscribe, and transparent pricing starting at $20/month.",
    type: "article",
    siteName: "Mail Pilot",
    images: [
      {
        url: "https://images.mailpilot.dev/mailpilot-vs-perplexity.png",
        width: 1200,
        height: 630,
        alt: "Perplexity Email Assistant vs Mail Pilot comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Perplexity Email Assistant Alternative in 2025: Mail Pilot",
    description:
      "Compare Perplexity Email Assistant vs Mail Pilot: ✓ Full customization ✓ Bulk unsubscribe ✓ Open source ✓ Better pricing. Find the best AI email assistant.",
    images: ["https://images.mailpilot.dev/mailpilot-vs-perplexity.png"],
  },
};

export default function Page() {
  return (
    <>
      <StructuredData
        headline="Best Perplexity Email Assistant Alternative in 2025: Mail Pilot Comparison"
        datePublished="2025-09-25T08:00:00+00:00"
        dateModified="2025-09-25T10:00:00+00:00"
        authorName="Areal"
        authorUrl="https://elie.tech"
        image={["https://images.mailpilot.dev/mailpilot-vs-perplexity.png"]}
      />
      <Content />
    </>
  );
}
