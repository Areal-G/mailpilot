import { createForwardingQueueHandler } from "@/utils/queue/create-forwarding-queue-handler";
import { digestBody } from "../validation";

export const POST = createForwardingQueueHandler({
  loggerScope: "ai/digest/queue",
  schema: digestBody,
  path: "/api/ai/digest",
  invalidPayloadMessage: "Invalid AI digest queue payload",
  visibilityTimeoutSeconds: 55,
  getLoggerContext: (payload) => ({
    emailAccountId: payload.emailAccountId,
    messageId: payload.message.id,
  }),
});
