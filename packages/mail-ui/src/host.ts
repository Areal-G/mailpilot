import type { MessageKey } from "@mailpilot/mail-core/identities";

export type MailUiHost = {
  openSettings(): void;
  loadAttachment?: (
    input: MessageKey & { attachmentId: string },
  ) => Promise<Blob>;
  openAccount?(accountId: string): void;
  compose?: () => void;
};
