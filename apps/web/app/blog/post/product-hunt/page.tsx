import { Metadata } from "next";
import { Content } from "./content";

export const metadata: Metadata = {
  title: "How to rank an open source project fist on Product Hunt - Mail Pilot",
  description: "How we finished first on Product Hunt with Mail Pilot",
  alternates: { canonical: "/product-hunt" },
};

export default function Page() {
  return <Content />;
}
