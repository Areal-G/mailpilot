import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { env } from "@/env";
import { BRAND_NAME, getBrandTitle } from "@/utils/branding";
import { SignUpShowcase } from "./SignUpShowcase";

export const metadata: Metadata = {
  title: getBrandTitle("Sign up"),
  description: `Create your ${BRAND_NAME} account.`,
  alternates: { canonical: "/signup" },
};

// A design showcase of the sign-up flow for the public demo. It never
// authenticates; outside demo mode visitors go to the real login.
export default async function SignUpPage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  if (!env.NEXT_PUBLIC_DEMO_MODE) redirect("/login");

  const searchParams = await props.searchParams;

  return (
    <BasicLayout>
      <SignUpShowcase
        initialMode={searchParams?.mode === "login" ? "login" : "signup"}
      />
    </BasicLayout>
  );
}
