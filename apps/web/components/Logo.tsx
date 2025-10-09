import Image from "next/image";
import { BRAND_LOGO_URL, BRAND_NAME } from "@/utils/branding";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  if (BRAND_LOGO_URL) {
    return (
      <Image
        src={BRAND_LOGO_URL}
        alt={`${BRAND_NAME} logo`}
        width={209}
        height={25}
        className={className}
        unoptimized
      />
    );
  }

  return (
    <svg viewBox="0 0 209 25" fill="none" className={className}>
      <title>{BRAND_NAME}</title>
      <rect x="0" y="1" width="23" height="23" rx="6" fill="#0d9488" />
      <path d="M18.4 6.1 3.9 12.5l6 2.3Z" fill="white" />
      <path d="M18.4 6.1 9.9 14.8l1.6 4.9Z" fill="white" fillOpacity="0.78" />
      <text
        x="31"
        y="20"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="21"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        {BRAND_NAME}
      </text>
    </svg>
  );
}
