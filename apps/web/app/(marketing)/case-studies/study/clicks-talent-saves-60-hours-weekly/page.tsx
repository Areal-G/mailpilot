import type { Metadata } from "next";
import { Content } from "./content";

export const metadata: Metadata = {
  title:
    "How Clicks Talent Saves 60+ Hours Weekly with Mail Pilot | Case Study",
  description:
    "Discover how Clicks Talent, an influencer marketing agency, transformed their email management by saving 60+ hours weekly, handling 10,000+ daily emails, and scaling without hiring additional staff using Mail Pilot's AI automation.",
  alternates: {
    canonical: "/case-studies/study/clicks-talent-saves-60-hours-weekly",
  },
  openGraph: {
    title: "How Clicks Talent Saves 60+ Hours Weekly with Mail Pilot",
    description:
      "Influencer marketing agency saves 60+ hours weekly handling 10,000+ daily emails with AI automation. See the transformation.",
    type: "article",
  },
};

export default function Page() {
  return <Content />;
}
