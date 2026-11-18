import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createForwardingQueueHandler } from "./create-forwarding-queue-handler";

const mockHandleCallback = vi.hoisted(() => vi.fn());

vi.mock("@vercel/queue", () => ({ handleCallback: mockHandleCallback }));
vi.mock("@/utils/queue/forward-to-internal-api", () => ({
  forwardQueueMessageToInternalApi: vi.fn(),
}));

type RetryHandler = (
  error: unknown,
  metadata: { messageId: string; deliveryCount: number },
) => unknown;

describe("createForwardingQueueHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleCallback.mockReturnValue(vi.fn());
  });

  function getRetry(maxDeliveryAttempts?: number): RetryHandler {
    createForwardingQueueHandler({
      loggerScope: "test/queue",
      schema: z.object({ id: z.string() }),
      path: "/api/test",
      invalidPayloadMessage: "Invalid payload",
      visibilityTimeoutSeconds: 60,
      maxDeliveryAttempts,
    });
    return mockHandleCallback.mock.calls[0][1].retry;
  }

  it("backs off between failed deliveries", () => {
    const retry = getRetry(3);

    expect(
      retry(new Error("boom"), { messageId: "m1", deliveryCount: 2 }),
    ).toEqual({ afterSeconds: 20 });
  });

  it("drops the message after the last allowed delivery", () => {
    const retry = getRetry(3);

    expect(
      retry(new Error("boom"), { messageId: "m1", deliveryCount: 3 }),
    ).toEqual({ acknowledge: true });
  });

  it("keeps retrying without a delivery limit", () => {
    const retry = getRetry();

    expect(
      retry(new Error("boom"), { messageId: "m1", deliveryCount: 50 }),
    ).toEqual({ afterSeconds: 300 });
  });
});
