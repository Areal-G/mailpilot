const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfUtcDay(date: Date) {
  return new Date(Math.floor(date.getTime() / DAY_MS) * DAY_MS);
}

// Moves the sample mailbox forward by whole days so its newest message lands
// on the previous UTC day. The result depends only on the UTC date, so every
// serverless instance started that day seeds identical mail, and nothing is
// dated in the future.
export function anchorMessageDates<T extends { internal_date: string }>(
  messages: T[],
  now: Date,
): T[] {
  if (messages.length === 0) return messages;

  const newest = Math.max(
    ...messages.map((message) => Number(message.internal_date)),
  );
  const yesterday = startOfUtcDay(now).getTime() - DAY_MS;
  const shiftMs = yesterday - startOfUtcDay(new Date(newest)).getTime();

  return messages.map((message) => ({
    ...message,
    internal_date: String(Number(message.internal_date) + shiftMs),
  }));
}
