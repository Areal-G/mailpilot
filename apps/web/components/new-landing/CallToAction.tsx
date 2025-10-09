"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/new-landing/common/Button";
import { Chat } from "@/components/new-landing/icons/Chat";
import { landingPageAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/utils";
import { env } from "@/env";
import { TryDemoForm } from "@/components/TryDemoForm";
import { GET_STARTED_PATH } from "@/utils/landing-paths";

interface CallToActionProps {
  buttonSize?: "xl" | "lg";
  className?: string;
  href?: string;
  showSalesButton?: boolean;
  text?: string;
}

export function CallToAction({
  text = "Get started",
  buttonSize = "xl",
  className,
  href = GET_STARTED_PATH,
  showSalesButton = true,
}: CallToActionProps) {
  const posthog = usePostHog();

  return (
    <div className={cn("flex justify-center items-center gap-4", className)}>
      <Button size={buttonSize} asChild>
        <Link
          href={href}
          onClick={() => landingPageAnalytics.getStartedClicked(posthog)}
        >
          <span className="relative z-10">{text}</span>
        </Link>
      </Button>
      {env.NEXT_PUBLIC_DEMO_MODE ? (
        <TryDemoForm>
          <Button variant="secondary-two" size={buttonSize} type="submit">
            Try demo
          </Button>
        </TryDemoForm>
      ) : showSalesButton ? (
        <Button variant="secondary-two" size={buttonSize} asChild>
          <Link
            href="https://www.mailpilot.app/sales"
            onClick={() => landingPageAnalytics.talkToSalesClicked(posthog)}
          >
            <Chat />
            Talk to sales
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
