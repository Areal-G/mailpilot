import type { ComponentProps } from "react";
import Link from "next/link";
import { env } from "@/env";
import { EXTENSION_URL } from "@/utils/config";
import { BRAND_NAME } from "@/utils/branding";
import { CookieSettingsButton } from "@/components/CookieConsent";

export const footerNavigation = {
  main: [
    {
      name: `${BRAND_NAME} Tabs (Chrome Extension)`,
      href: EXTENSION_URL,
      target: "_blank",
    },
    { name: "AI Email Assistant", href: "/ai-automation" },
    { name: "Email App", href: "/email-client" },
    { name: "Mobile App", href: "/mobile-app" },
    { name: "Download", href: "/download" },
    { name: "AI Chat for Slack & Telegram", href: "/ai-assistant-chat" },
    { name: "Slack AI Assistant", href: "/slack-integration" },
    { name: "Telegram AI Assistant", href: "/telegram-integration" },
    { name: "Teams AI Assistant", href: "/teams-integration" },
    { name: "Brief My Meeting", href: "/brief-my-meeting" },
    { name: "AI Meeting Notetaker", href: "/ai-meeting-notetaker" },
    { name: "Reply Zero", href: "/reply-zero-ai" },
    { name: "Bulk Email Unsubscriber", href: "/bulk-email-unsubscriber" },
    { name: "Clean your inbox", href: "/clean-inbox" },
    { name: "Cold Email Blocker", href: "/block-cold-emails" },
    { name: "Email Analytics", href: "/email-analytics" },
    { name: "Auto Forward Emails", href: "/auto-forward-emails" },
    { name: "Auto-File Attachments", href: "/auto-file-email-attachments" },
  ],
  useCases: [
    { name: "Founder", href: "/founders" },
    { name: "Small Business", href: "/small-business" },
    { name: "Content Creator", href: "/creator" },
    { name: "Realtor", href: "/real-estate" },
    { name: "Customer Support", href: "/customer-support" },
    { name: "E-commerce", href: "/ecommerce" },
  ],
  industries: [
    { name: "MSPs", href: "/msp" },
    { name: "Property Management", href: "/property-management" },
    { name: "Law Firms", href: "/law-firms" },
    { name: "Accounting Firms", href: "/accounting-firms" },
  ],
  compare: [
    {
      name: "Best AI Email Assistants",
      href: "/blog/post/best-ai-email-assistants",
    },
    {
      name: "AI Email Assistant Directory",
      href: "https://aiemailassistants.com",
      target: "_blank",
    },
    { name: "vs Fyxer.ai", href: "/best-fyxer-alternative" },
    { name: "vs Superhuman", href: "/best-superhuman-alternative" },
    { name: "vs Shortwave", href: "/best-shortwave-alternative" },
    {
      name: "vs Perplexity Email Assistant",
      href: "/best-perplexity-email-assistant-alternative",
    },
  ],
  tools: [
    { name: "All Free Email Tools", href: "/tools" },
    {
      name: "Email Deliverability Checker",
      href: "/tools/email-deliverability-checker",
    },
    { name: "Gmail Personality Quiz", href: "/tools/gmail-quiz" },
    { name: "Subject Line Analyzer", href: "/tools/subject-line-analyzer" },
    {
      name: "Email Signature Generator",
      href: "/tools/email-signature-generator",
    },
    { name: "Meeting Cost Calculator", href: "/tools/meeting-cost-calculator" },
    {
      name: "Team Email Cost Calculator",
      href: "/tools/email-cost-calculator",
    },
  ],
  support: [
    { name: "Pricing", href: "/pricing" },
    { name: "Support", href: "/support" },
    { name: "Feature Requests", href: "/feature-requests", target: "_blank" },
    { name: "Changelog", href: "/changelog", target: "_blank" },
    {
      name: "Status",
      href: "https://mail-pilot.openstatus.dev/",
      target: "_blank",
    },
    { name: "CLI", href: "/cli" },
    { name: "OpenClaw Skill", href: "/openclaw" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Affiliates", href: "/affiliates", target: "_blank" },
    { name: "Blog", href: "/blog" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Twitter", href: "/twitter", target: "_blank" },
    { name: "OSS Friends", href: "/oss-friends" },
    { name: "Email Blaster", href: "/game" },
  ],
  legal: [
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
    {
      name: "SOC2 Compliant",
      href: "https://security.mailpilot.app",
      target: "_blank",
    },
  ],
  social: [
    {
      name: "Twitter",
      href: "/twitter",
      target: "_blank",
      icon: (props: ComponentProps<"svg">) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <title>Twitter</title>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
  ],
};

// Simple footer for self-hosted deployments
const selfHostedLegalLinks = [
  { name: "Terms", href: "/terms" },
  { name: "Privacy", href: "/privacy" },
];

export function Footer() {
  const copyrightName = BRAND_NAME;

  if (env.NEXT_PUBLIC_BYPASS_PREMIUM_CHECKS) {
    return (
      <footer className="relative">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {selfHostedLegalLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm leading-6 text-gray-600 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ))}
            <CookieSettingsButton className="text-sm leading-6 text-gray-600 hover:text-gray-900" />
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-gray-500">
            Powered by{" "}
            <Link
              href="https://mailpilot.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900"
            >
              Mail Pilot
            </Link>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav aria-label="Footer">
          <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-5 xl:col-span-2 xl:mt-0">
            <div>
              <FooterList title="Product" items={footerNavigation.main} />
            </div>
            <div>
              <FooterList title="Use Cases" items={footerNavigation.useCases} />

              <div className="mt-6">
                <FooterList
                  title="Industries"
                  items={footerNavigation.industries}
                />
              </div>

              <div className="mt-6">
                <FooterList title="Compare" items={footerNavigation.compare} />
              </div>
            </div>
            <div>
              <FooterList title="Support" items={footerNavigation.support} />

              <div className="mt-6">
                <FooterList title="Free Tools" items={footerNavigation.tools} />
              </div>
            </div>
            <div>
              <FooterList title="Company" items={footerNavigation.company} />
            </div>
            <div>
              <FooterList title="Legal" items={footerNavigation.legal} />
              <CookieSettingsButton className="mt-4 text-sm leading-6 text-gray-600 hover:text-gray-900" />
            </div>
          </div>
        </nav>

        <div className="mt-16 flex justify-center space-x-10">
          {footerNavigation.social.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} {copyrightName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterList(props: {
  title: string;
  items: { name: string; href: string; target?: string }[];
}) {
  return (
    <>
      <h3 className="text-sm font-semibold leading-6 text-gray-900">
        {props.title}
      </h3>
      <ul className="mt-6 space-y-4">
        {props.items.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              target={item.target}
              prefetch={false}
              className="text-sm leading-6 text-gray-600 hover:text-gray-900"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
