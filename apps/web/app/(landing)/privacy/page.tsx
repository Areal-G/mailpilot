import type { Metadata } from "next";
import { PrivacyContent } from "@/app/(landing)/privacy/content";

export const metadata: Metadata = {
  title: "Privacy Policy - Mail Pilot",
  description: "Privacy Policy - Mail Pilot",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <PrivacyContent />;
}
