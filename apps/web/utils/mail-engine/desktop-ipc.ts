import type { MailClient } from "@mailpilot/mail-core/engine";
import { createMailIpcClient } from "@mailpilot/mail-core/protocol/mail-ipc-client";
import { getMailPilotDesktopApp } from "@/utils/desktop-app";
import {
  pageConnectivityOnline,
  requestSyncUnlessOffline,
} from "@/utils/mail-engine/worker-protocol";

export function hasDesktopMailEngineIpc() {
  const desktop = getMailPilotDesktopApp();
  return Boolean(
    desktop?.mailEngine &&
      desktop.mailEngineSubscribe &&
      desktop.mailEngineUnsubscribe &&
      desktop.onMailEngineSnapshot,
  );
}

export function createDesktopIpcMailClient(input?: {
  provider?: "google" | "microsoft";
}) {
  const desktop = getMailPilotDesktopApp();
  const invoke = desktop?.mailEngine;
  const subscribe = desktop?.mailEngineSubscribe;
  const unsubscribe = desktop?.mailEngineUnsubscribe;
  const onSnapshot = desktop?.onMailEngineSnapshot;
  if (!invoke || !subscribe || !unsubscribe || !onSnapshot) {
    throw new Error("Desktop mail engine IPC is unavailable");
  }
  const client = createMailIpcClient(invoke, {
    provider: input?.provider,
    push: { subscribe, unsubscribe, onSnapshot },
  });
  const originalRequestSync = client.requestSync.bind(client);
  client.requestSync = (accountIds) =>
    requestSyncUnlessOffline(pageConnectivityOnline(), () =>
      originalRequestSync(accountIds),
    );
  return client;
}

export async function startDesktopIpcMailClient(input: {
  provider: "google" | "microsoft";
  accountId: string;
  publish: (client: MailClient) => Promise<void>;
  onSyncError: (error: unknown) => void;
}) {
  const client = createDesktopIpcMailClient({ provider: input.provider });
  await input.publish(client);
  client.requestSync([input.accountId]).catch(input.onSyncError);
}
