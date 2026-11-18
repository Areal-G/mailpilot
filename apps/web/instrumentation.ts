// Error reporting to Sentry is disabled.
export async function register() {
  // The portfolio demo boots its in-memory backend before taking requests.
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.DEMO_IN_MEMORY === "true"
  ) {
    const { startInMemoryDemo } = await import("@/utils/demo-runtime");
    await startInMemoryDemo();
  }
}
