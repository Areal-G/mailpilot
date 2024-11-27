import { z } from "zod";
import { zodPeriod } from "@mailpilot/tinybird";

export const statsByPeriodQuerySchema = z.object({
  period: zodPeriod,
  fromDate: z.coerce.number().nullish(),
  toDate: z.coerce.number().nullish(),
});
export type StatsByPeriodQuery = z.infer<typeof statsByPeriodQuerySchema>;
