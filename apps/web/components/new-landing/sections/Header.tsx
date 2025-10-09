"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { cn } from "@/utils";
import { Logo } from "@/components/new-landing/common/Logo";
import { Button } from "@/components/new-landing/common/Button";
import { HeaderLinks } from "@/components/new-landing/HeaderLinks";
import { landingPageAnalytics } from "@/hooks/useAnalytics";
import { GET_STARTED_PATH, LOG_IN_PATH } from "@/utils/landing-paths";

interface HeaderProps {
  className: string;
}

export function Header({ className }: HeaderProps) {
  const posthog = usePostHog();

  return (
    <header
      className={cn(
        "bg-white mx-auto flex items-center justify-between h-16",
        className,
      )}
    >
      <div className="hidden md:block">
        <Logo />
      </div>
      <div className="block md:hidden">
        <Logo variant="mobile" />
      </div>
      <HeaderLinks />
      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <Button variant="secondary" asChild>
            <Link
              href={LOG_IN_PATH}
              onClick={() => landingPageAnalytics.logInClicked(posthog)}
            >
              Log in
            </Link>
          </Button>
        </div>
        <Button asChild>
          <Link
            href={GET_STARTED_PATH}
            onClick={() => landingPageAnalytics.getStartedClicked(posthog)}
          >
            <span className="relative z-10">Get started free</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
