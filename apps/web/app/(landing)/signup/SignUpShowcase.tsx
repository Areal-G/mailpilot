"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/new-landing/common/Button";
import {
  Paragraph,
  Subheading,
} from "@/components/new-landing/common/Typography";
import { TryDemoForm } from "@/components/TryDemoForm";
import { BRAND_NAME } from "@/utils/branding";
import { cn } from "@/utils";

type Mode = "signup" | "login";

const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
});

const signUpSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Enter your name"),
});

type FormValues = z.infer<typeof loginSchema>;

const COPY: Record<Mode, { title: string; subtitle: string; submit: string }> =
  {
    signup: {
      title: "Create your account",
      subtitle: "Put your inbox on autopilot in minutes.",
      submit: "Create account",
    },
    login: {
      title: "Welcome back",
      subtitle: `Log in to ${BRAND_NAME}.`,
      submit: "Log in",
    },
  };

export function SignUpShowcase({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [noticeShown, setNoticeShown] = useState(false);
  const copy = COPY[mode];

  // Showcase only: nothing here talks to an auth or OAuth endpoint.
  const showNotice = () => setNoticeShown(true);

  const switchMode = (next: Mode) => {
    setMode(next);
    setNoticeShown(false);
  };

  return (
    <div className="mx-auto w-full max-w-[440px] py-12 sm:py-16">
      <div className="text-center">
        <Subheading>{copy.title}</Subheading>
        <Paragraph className="mt-2">{copy.subtitle}</Paragraph>
      </div>

      <div className="mt-8 rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0px_2px_16px_0px_#00000008] sm:p-8">
        <div
          role="tablist"
          aria-label="Account"
          className="grid grid-cols-2 rounded-[13px] bg-gray-50 p-1"
        >
          {(["signup", "login"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => switchMode(tab)}
              className={cn(
                "rounded-[10px] py-2 text-sm font-medium transition-colors",
                mode === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800",
              )}
            >
              {tab === "signup" ? "Sign up" : "Log in"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={showNotice}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-[13px] border border-gray-200 bg-white py-[10.5px] text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
        >
          <Image src="/images/google.svg" alt="" width={18} height={18} />
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-100" />
          or with email
          <span className="h-px flex-1 bg-gray-100" />
        </div>

        <EmailForm
          key={mode}
          mode={mode}
          submitLabel={copy.submit}
          onSubmit={showNotice}
        />

        {noticeShown ? (
          <div
            role="status"
            className="mt-6 rounded-[13px] border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900"
          >
            <p className="font-medium">
              {mode === "signup" ? "Sign-up" : "Log-in"} isn't available in this
              demo.
            </p>
            <p className="mt-1 text-teal-800">
              Try the live demo instead: a full inbox, no account needed.
            </p>
            <TryDemoForm className="mt-3">
              <button
                type="submit"
                className="rounded-[10px] bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
              >
                Open the live demo
              </button>
            </TryDemoForm>
          </div>
        ) : null}

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 rounded-[20px] border border-gray-100 bg-gray-50/60 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-medium text-gray-900">Just looking?</p>
          <p className="text-sm text-gray-500">
            Explore a sample inbox, no sign-up needed.
          </p>
        </div>
        <TryDemoForm>
          <Button variant="secondary-two" size="lg" type="submit">
            Try demo
          </Button>
        </TryDemoForm>
      </div>
    </div>
  );
}

function EmailForm({
  mode,
  submitLabel,
  onSubmit,
}: {
  mode: Mode;
  submitLabel: string;
  onSubmit: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(mode === "signup" ? signUpSchema : loginSchema),
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {mode === "signup" ? (
        <Field id="signup-name" label="Name" error={errors.name?.message}>
          <input
            id="signup-name"
            {...register("name")}
            type="text"
            autoComplete="name"
            placeholder="Alex Morgan"
            className={inputClassName(!!errors.name)}
          />
        </Field>
      ) : null}
      <Field id="signup-email" label="Email" error={errors.email?.message}>
        <input
          id="signup-email"
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className={inputClassName(!!errors.email)}
        />
      </Field>
      <Field
        id="signup-password"
        label="Password"
        error={errors.password?.message}
        action={
          mode === "login" ? (
            <button
              type="button"
              onClick={onSubmit}
              className="text-xs font-medium text-[#2965EC] hover:underline"
            >
              Forgot password?
            </button>
          ) : null
        }
      >
        <input
          id="signup-password"
          {...register("password")}
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={
            mode === "signup" ? "At least 8 characters" : "Your password"
          }
          className={inputClassName(!!errors.password)}
        />
      </Field>

      <Button type="submit" size="lg" auto>
        <span className="relative z-10">{submitLabel}</span>
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  action,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactElement;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-800">
          {label}
        </label>
        {action}
      </div>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function inputClassName(invalid: boolean) {
  return cn(
    "block w-full rounded-[13px] border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
    "outline-none transition-shadow focus:ring-4",
    invalid
      ? "border-red-300 focus:ring-red-100"
      : "border-gray-200 focus:border-[#5C89F8] focus:ring-[#2965EC]/10",
  );
}
