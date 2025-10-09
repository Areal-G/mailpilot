import { getMailPilotDesktopApp } from "@/utils/desktop-app";
import { hasDesktopMailEngineIpc } from "@/utils/mail-engine/desktop-ipc";
import { selectMailEngineRuntimeMode } from "@/utils/mail-engine/runtime-mode";
import { browserMailEngineCapabilities } from "@/utils/mail-engine/worker-protocol";

export function getClientAnalyticsProperties() {
  const mailEngineTransport = selectMailEngineRuntimeMode({
    desktopIpc: hasDesktopMailEngineIpc(),
    ...browserMailEngineCapabilities(),
  });

  if (!getMailPilotDesktopApp()) {
    return { client: "web", mail_engine_transport: mailEngineTransport };
  }

  return {
    client: "desktop",
    desktop_version: parseDesktopAppVersion(navigator.userAgent),
    mail_engine_transport: mailEngineTransport,
  };
}

/**
 * Electron's default user agent carries `<app name>/<version>`, with
 * whitespace stripped from the product name: `MailPilot/1.2.3`.
 */
export function parseDesktopAppVersion(userAgent: string): string | undefined {
  return userAgent.match(/(?:^|[\s(])Mail\s?Pilot\/(\d[\w.+-]*)/i)?.[1];
}
