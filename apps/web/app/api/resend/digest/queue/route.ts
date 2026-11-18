import { createForwardingQueueHandler } from "@/utils/queue/create-forwarding-queue-handler";
import { sendDigestEmailBody } from "../validation";

export const POST = createForwardingQueueHandler({
  loggerScope: "resend/digest/queue",
  schema: sendDigestEmailBody,
  path: "/api/resend/digest",
  invalidPayloadMessage: "Invalid resend digest queue payload",
  visibilityTimeoutSeconds: 55,
  getLoggerContext: (payload) => ({
    emailAccountId: payload.emailAccountId,
  }),
});
