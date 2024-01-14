import { deleteContact as deleteLoopsContact } from "@mailpilot/loops";
import { deleteContact as deleteResendContact } from "@mailpilot/resend";
import prisma from "@/utils/prisma";
import { deleteInboxZeroLabels, deleteUserLabels } from "@/utils/redis/label";
import { deleteUserStats } from "@/utils/redis/stats";
import { deleteTinybirdEmails } from "@mailpilot/tinybird";
import { deleteTinybirdAiCalls } from "@mailpilot/tinybird-ai-analytics";
import { deletePosthogUser } from "@/utils/posthog";
import { captureException } from "@/utils/error";
import { unwatchEmails } from "@/app/api/google/watch/controller";

export async function deleteUser({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { access_token: true },
  });
  if (!account) return;

  try {
    await Promise.allSettled([
      deleteUserLabels({ email }),
      deleteInboxZeroLabels({ email }),
      deleteUserStats({ email }),
      deleteTinybirdEmails({ email }),
      deleteTinybirdAiCalls({ userId }),
      deletePosthogUser({ email }),
      deleteLoopsContact(email),
      deleteResendContact({ email }),
      unwatchEmails({
        userId: userId,
        access_token: account.access_token ?? null,
        refresh_token: null,
      }),
    ]);
  } catch (error) {
    console.error("Error while deleting account:", error);
    captureException(error, undefined, email);
  }

  await prisma.user.delete({ where: { email } });
}
