import { NextResponse } from "next/server";
import { gmail_v1 } from "googleapis";
import countBy from "lodash/countBy";
import { getAuthSession } from "@/utils/auth";
import { getGmailClient } from "@/utils/gmail/client";
import { parseMessage } from "@/utils/mail";
import { getMessage } from "@/utils/gmail/message";

export type SendersResponse = Awaited<ReturnType<typeof getSenders>>;

async function getSenders(options: { gmail: gmail_v1.Gmail }) {
  const { gmail } = options;

  const res = await gmail.users.messages.list({
    userId: "me",
    q: `-in:sent`,
    maxResults: 50,
  });

  // be careful of rate limiting here
  const messages = await Promise.all(
    res.data.messages?.map(async (m) => {
      const message = await getMessage(m.id!, gmail);
      const parsedMessage = parseMessage(message);

      return {
        ...message,
        parsedMessage,
      };
    }) || []
  );

  const countBySender = countBy(messages, (m) => m.parsedMessage.headers.from);
  const countByDomain = countBy(messages, (m) =>
    parseDomain(m.parsedMessage.headers.from)
  );
  return { countBySender, countByDomain };

  // TODO store results in redis with history id?
}

// Converts "Name <hey@domain.com>" to "domain.com"
export function parseDomain(email: string) {
  const domain = email.match(/@([\w.-]+\.[a-zA-Z]{2,6})/)?.[1];
  return domain;
}

export async function GET() {
  const session = await getAuthSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" });

  const gmail = getGmailClient(session);

  const result = await getSenders({ gmail });

  return NextResponse.json(result);
}
