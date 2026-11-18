import { handleCallback } from "@vercel/queue";
import type { z } from "zod";
import { createScopedLogger } from "@/utils/logger";
import { forwardQueueMessageToInternalApi } from "@/utils/queue/forward-to-internal-api";
import { getQueueRetryBackoffSeconds } from "@/utils/queue/retry";

type QueueMetadata = {
  messageId: string;
  deliveryCount: number;
};

export function createForwardingQueueHandler<TSchema extends z.ZodTypeAny>({
  loggerScope,
  schema,
  path,
  invalidPayloadMessage,
  visibilityTimeoutSeconds,
  maxDeliveryAttempts,
  getLoggerContext,
  getTraceContext,
}: {
  loggerScope: string;
  schema: TSchema;
  path: string;
  invalidPayloadMessage: string;
  visibilityTimeoutSeconds: number;
  // Drops the message after this many failed deliveries. Unset retries until
  // the queue's own retention runs out.
  maxDeliveryAttempts?: number;
  getLoggerContext?: (
    payload: z.infer<TSchema>,
    metadata: QueueMetadata,
  ) => Record<string, unknown>;
  getTraceContext?: (
    payload: z.infer<TSchema>,
    metadata: QueueMetadata,
  ) => Record<string, unknown>;
}) {
  const logger = createScopedLogger(loggerScope);

  const queueHandler = handleCallback<z.infer<TSchema>>(
    async (message, metadata) => {
      const parseResult = schema.safeParse(message);
      if (!parseResult.success) {
        logger.error(invalidPayloadMessage, {
          errors: parseResult.error.issues,
          queueMessageId: metadata.messageId,
        });
        return;
      }

      const runLogger = logger.with({
        ...getLoggerContext?.(parseResult.data, metadata),
        queueMessageId: metadata.messageId,
        deliveryCount: metadata.deliveryCount,
      });

      const traceContext = getTraceContext?.(parseResult.data, metadata);
      if (traceContext) {
        runLogger.trace("Forwarding queue message", traceContext);
      }

      await forwardQueueMessageToInternalApi({
        path,
        body: parseResult.data,
        logger: runLogger,
      });
    },
    {
      visibilityTimeoutSeconds,
      retry: (error, metadata) => {
        if (
          maxDeliveryAttempts !== undefined &&
          metadata.deliveryCount >= maxDeliveryAttempts
        ) {
          logger.error("Dropping queue message after final delivery attempt", {
            error,
            queueMessageId: metadata.messageId,
            deliveryCount: metadata.deliveryCount,
          });
          return { acknowledge: true };
        }

        return {
          afterSeconds: getQueueRetryBackoffSeconds({
            deliveryCount: metadata.deliveryCount,
          }),
        };
      },
    },
  );

  return (request: Request) => queueHandler(request);
}
