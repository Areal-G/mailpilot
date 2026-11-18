// The portfolio demo runs with no database and no outside services. Built
// with DEMO_IN_MEMORY=true, PostgreSQL is PGlite in memory, Redis is a small
// in-memory store, and Google and the LLM are emulators inside the server
// process, all on loopback ports (see
// ./index.ts, started from instrumentation.ts). Netlify does not pass build
// settings to server functions, so next.config.ts inlines DEMO_IN_MEMORY and
// these defaults apply at build time and at runtime. Values set in the
// environment still win.
//
// Imported first by env.ts, so it runs before the environment is parsed.

export const DEMO_DATABASE_PORT = 45_432;
export const DEMO_GOOGLE_PORT = 45_402;
export const DEMO_LLM_PORT = 45_403;
export const DEMO_REDIS_PORT = 45_404;

export function isInMemoryDemo() {
  return process.env.DEMO_IN_MEMORY === "true";
}

// None of these are secrets: the only account is the shared guest, its
// mailbox is emulated, and every value stays inside the demo process.
const inMemoryDemoEnv: Record<string, string> = {
  NEXT_PUBLIC_BASE_URL: "https://mailpilot.arealjagema.com",
  NEXT_PUBLIC_DEMO_MODE: "true",
  NEXT_PUBLIC_BYPASS_PREMIUM_CHECKS: "true",
  NEXT_PUBLIC_BOOKING_LINKS_ENABLED: "true",
  DATABASE_URL: `postgresql://postgres@127.0.0.1:${DEMO_DATABASE_PORT}/postgres`,
  AUTH_SECRET:
    "c0362d41634a71798d96db45c8f0abf80b77b3bc69f8dee29558c5b151dbb595",
  EMAIL_ENCRYPT_SECRET: "mail-pilot-portfolio-demo-tokens",
  EMAIL_ENCRYPT_SALT: "mail-pilot-portfolio-demo-salt",
  INTERNAL_API_KEY: "mail-pilot-portfolio-demo-internal",
  GOOGLE_BASE_URL: `http://127.0.0.1:${DEMO_GOOGLE_PORT}`,
  GOOGLE_CLIENT_ID: "emulate-google-client.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "emulate-google-secret",
  GOOGLE_PUBSUB_TOPIC_NAME: "demo-emulator-topic",
  DEFAULT_LLMS: "openai-compatible:emulated",
  OPENAI_COMPATIBLE_BASE_URL: `http://127.0.0.1:${DEMO_LLM_PORT}/v1`,
  REDIS_HTTP_URL: `http://127.0.0.1:${DEMO_REDIS_PORT}`,
  REDIS_HTTP_TOKEN: "mail-pilot-portfolio-demo-redis",
};

if (isInMemoryDemo()) {
  for (const [name, value] of Object.entries(inMemoryDemoEnv)) {
    process.env[name] ??= value;
  }
}
