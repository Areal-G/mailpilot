import { Metadata } from "next";
import { TermsContent } from "@/app/(landing)/terms/content";

export const metadata: Metadata = {
  title: "Terms of Service - Mail Pilot",
  description: "Terms of Service - Mail Pilot",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <TermsContent />;
}
