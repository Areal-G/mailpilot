import { AuthCallbackHandoff } from "./AuthCallbackHandoff";
import { getMailPilotCustomSchemeCallbackUrl } from "@/utils/mobile-auth/app-callback-url";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const appUrl = getMailPilotCustomSchemeCallbackUrl(await searchParams);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {appUrl ? <AuthCallbackHandoff href={appUrl} /> : null}
      <p className="text-muted-foreground text-sm">
        Return to Mail Pilot to finish signing in.
      </p>
      {appUrl ? (
        <a
          href={appUrl}
          className="text-sm font-medium text-foreground underline underline-offset-4"
        >
          Open Mail Pilot
        </a>
      ) : null}
    </main>
  );
}
