import type { ReactNode } from "react";
import {
  Inbox,
  MessagesSquare,
  MonitorSmartphone,
  Rows3,
  Sparkles,
} from "lucide-react";
import { EmailsSortedIllustration } from "@/app/(app)/[emailAccountId]/onboarding/illustrations/EmailsSortedIllustration";

const DETAIL_ICON_CLASS = "size-4";

export interface AnnouncementDetail {
  description?: string;
  icon: ReactNode;
  title: string;
}

export interface Announcement {
  description: string;
  details?: AnnouncementDetail[];
  enabled?: boolean;
  id: string;
  image: ReactNode;
  link?: string;
  linkLabel?: string;
  publishedAt: string;
  secondaryLink?: { href: string; label: string };
  title: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "email-client-launch",
    title: "The email app is live",
    description:
      "A fast email app for web, desktop, and iPhone, with your AI assistant built in.",
    image: <EmailsSortedIllustration />,
    link: "/mail",
    linkLabel: "Try it",
    secondaryLink: { href: "/download", label: "Download the app" },
    publishedAt: "2026-10-15T00:00:00Z",
    details: [
      {
        title: "Web, desktop, and mobile",
        icon: <MonitorSmartphone className={DETAIL_ICON_CLASS} />,
      },
      { title: "Unified inbox", icon: <Inbox className={DETAIL_ICON_CLASS} /> },
      { title: "Split inbox", icon: <Rows3 className={DETAIL_ICON_CLASS} /> },
      {
        title: "Private team comments",
        icon: <MessagesSquare className={DETAIL_ICON_CLASS} />,
      },
      {
        title: "AI sorting and drafts",
        icon: <Sparkles className={DETAIL_ICON_CLASS} />,
      },
    ],
  },
];

export function getActiveAnnouncements(): Announcement[] {
  return ANNOUNCEMENTS.filter((a) => a.enabled !== false).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function hasNewAnnouncements(
  dismissedAt: Date | null | undefined,
): boolean {
  const announcements = getActiveAnnouncements();
  if (announcements.length === 0) return false;
  if (!dismissedAt) return true;
  return announcements.some(
    (a) => new Date(a.publishedAt) > new Date(dismissedAt),
  );
}
