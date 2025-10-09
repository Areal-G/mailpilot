"use client";

import { EmailsSortedIllustration } from "@/app/(app)/[emailAccountId]/onboarding/illustrations/EmailsSortedIllustration";
import { OnboardingFeatureStep } from "./OnboardingFeatureStep";

export function StepMailApp({ onNext }: { onNext: () => void }) {
  return (
    <OnboardingFeatureStep
      illustration={<EmailsSortedIllustration />}
      title="Meet your new email app"
      description="Read and send email on web, desktop, and iPhone. Add the AI assistant anytime."
      onNext={onNext}
    />
  );
}
