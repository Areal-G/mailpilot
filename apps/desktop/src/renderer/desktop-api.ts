import type { MessageKey } from "@mailpilot/mail-core/identities";
import type { MailIpcSnapshotEvent } from "@mailpilot/mail-core/protocol/mail-ipc-client";

export type MailPilotDesktopApi = {
  readAttachment: (
    input: MessageKey & { attachmentId: string },
  ) => Promise<Uint8Array<ArrayBuffer>>;
  mailEngine: (payload: unknown) => Promise<unknown>;
  mailEngineSubscribe: (input: unknown) => Promise<unknown>;
  mailEngineUnsubscribe: (subscriptionId: string) => Promise<unknown>;
  onMailEngineSnapshot: (
    listener: (event: MailIpcSnapshotEvent) => void,
  ) => () => void;
  wipeMailbox: () => Promise<unknown>;
  openWindow?: (path: string) => Promise<unknown>;
};
