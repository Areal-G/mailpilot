import { Metadata } from "next";
import { Content } from "./content";

export const metadata: Metadata = {
  title: "How Mail Pilot hit #1 on Product Hunt",
  description:
    "Mail Pilot finished first place on Product Hunt. This is how we did it.",
  alternates: {
    canonical: "/blog/how-my-open-source-saas-hit-first-on-product-hunt",
  },
};

export default function Page() {
  return <Content />;
}
