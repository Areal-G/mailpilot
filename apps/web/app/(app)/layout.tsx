import "../../styles/globals.css";
import React from "react";
import { redirect } from "next/navigation";
import { SideNavWithTopNav } from "@/components/SideNavWithTopNav";
import { getAuthSession } from "@/utils/auth";
import { TokenCheck } from "@/components/TokenCheck";
import Providers from "@/app/(app)/providers";

export const metadata = {
  title: "Mail Pilot AI",
  description:
    "Reach inbox zero in minutes. Mail Pilot uses AI to help you empty your inbox daily. What previously took hours, now takes minutes. Mail Pilot is your VA for emails.",
};

// NOTE: inherits from top level layout
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user.email) redirect("/login");

  return (
    <html lang="en">
      <body>
        <Providers>
          <TokenCheck />
          <SideNavWithTopNav>{children}</SideNavWithTopNav>
        </Providers>
      </body>
    </html>
  );
}
