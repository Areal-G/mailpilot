"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import type { PropsWithChildren } from "react";

export function ThemeProvider({
  children,
  ...props
}: PropsWithChildren<ThemeProviderProps>) {
  return (
    <NextThemesProvider scriptProps={THEME_SCRIPT_PROPS} {...props}>
      {children}
    </NextThemesProvider>
  );
}

// next-themes renders its no-flash theme script inside this client component.
// The server-rendered copy runs before paint; on the client React 19 refuses to
// run scripts and warns, so the client copy is marked inert. The script already
// suppresses the hydration warning for the differing type attribute.
const THEME_SCRIPT_PROPS: ThemeProviderProps["scriptProps"] =
  typeof window === "undefined" ? undefined : { type: "text/plain" };
