import { openOrQuarantineNodeMailbox } from "@mailpilot/mail-sqlite/node";
import { createSqliteMailStore } from "@mailpilot/mail-sqlite/store";
import type { MailStore } from "@mailpilot/mail-core/ports/mail-store";

export async function createDesktopMailStore(path: string): Promise<MailStore> {
  const { driver } = await openOrQuarantineNodeMailbox(path);
  return createSqliteMailStore(driver);
}
