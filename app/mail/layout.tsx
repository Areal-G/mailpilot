import "../globals.css";
import { Inter } from "next/font/google";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { GmailProvider } from "@/providers/GmailProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { SideNavWithTopNav } from "@/components/SideNavWithTopNav";
import { PromptProvider } from "@/providers/PromptProvider";
import { SWRProvider } from "@/providers/SWRProvider";

export const metadata = {
  title: "Mail Pilot AI",
  description:
    "Reach inbox zero in minutes. Mail Pilot uses AI to help you empty your inbox daily. What previously took hours, now takes minutes. Mail Pilot is your VA for emails.",
};

// NOTE: inherits from top level layout. use groups if we want to break this out
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>
          <GmailProvider>
            <NotificationProvider>
              <SessionProvider>
                <PromptProvider>
                  <SideNavWithTopNav>{children}</SideNavWithTopNav>
                </PromptProvider>
              </SessionProvider>
            </NotificationProvider>
          </GmailProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
