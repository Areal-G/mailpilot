import { describe, it, expect, vi, beforeEach } from "vitest";
import { hasCronSecret, isAuthorizedCronOrInternalRequest } from "./cron";
import type { RequestWithLogger } from "@/utils/middleware";
import { createTestLogger } from "@/__tests__/helpers";

const logger = createTestLogger();

const mockEnv = vi.hoisted(() => ({
  CRON_SECRET: "test-secret-123" as string | undefined,
  INTERNAL_API_KEY: "internal-key-456" as string | undefined,
}));

vi.mock("@/env", () => ({ env: mockEnv }));

function createMockRequestWithLogger(
  headers?: Record<string, string>,
): RequestWithLogger {
  const request = new Request("https://example.com", {
    headers: headers ? new Headers(headers) : undefined,
  });
  return {
    ...request,
    headers: request.headers,
    logger,
  } as RequestWithLogger;
}

describe("hasCronSecret", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true for valid authorization header", () => {
    const request = createMockRequestWithLogger({
      authorization: "Bearer test-secret-123",
    });

    expect(hasCronSecret(request)).toBe(true);
  });

  it("should return false for invalid authorization header", () => {
    const request = createMockRequestWithLogger({
      authorization: "Bearer wrong-secret",
    });

    expect(hasCronSecret(request)).toBe(false);
  });

  it("should return false for missing authorization header", () => {
    const request = createMockRequestWithLogger();

    expect(hasCronSecret(request)).toBe(false);
  });

  it("should return false for malformed authorization header", () => {
    const request = createMockRequestWithLogger({
      authorization: "test-secret-123", // Missing "Bearer" prefix
    });

    expect(hasCronSecret(request)).toBe(false);
  });
});

describe("isAuthorizedCronOrInternalRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.CRON_SECRET = "test-secret-123";
    mockEnv.INTERNAL_API_KEY = "internal-key-456";
  });

  it("accepts the cron secret", () => {
    const request = createMockRequestWithLogger({
      authorization: "Bearer test-secret-123",
    });

    expect(isAuthorizedCronOrInternalRequest(request)).toBe(true);
  });

  it("accepts the internal API key", () => {
    const request = createMockRequestWithLogger({
      "x-api-key": "internal-key-456",
    });

    expect(isAuthorizedCronOrInternalRequest(request)).toBe(true);
  });

  it("rejects wrong credentials", () => {
    const request = createMockRequestWithLogger({
      authorization: "Bearer wrong-secret",
      "x-api-key": "wrong-key",
    });

    expect(isAuthorizedCronOrInternalRequest(request)).toBe(false);
  });

  it("rejects a request without credentials", () => {
    expect(
      isAuthorizedCronOrInternalRequest(createMockRequestWithLogger()),
    ).toBe(false);
  });

  it("never matches an unset secret", () => {
    mockEnv.CRON_SECRET = undefined;
    mockEnv.INTERNAL_API_KEY = undefined;
    const request = createMockRequestWithLogger({
      authorization: "Bearer undefined",
      "x-api-key": "undefined",
    });

    expect(isAuthorizedCronOrInternalRequest(request)).toBe(false);
  });

  it("does not accept the internal API key as a bearer token", () => {
    const request = createMockRequestWithLogger({
      authorization: "Bearer internal-key-456",
    });

    expect(isAuthorizedCronOrInternalRequest(request)).toBe(false);
  });
});
