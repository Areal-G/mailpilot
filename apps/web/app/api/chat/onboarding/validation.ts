import { z } from "zod";

// What each onboarding rule does with matching mail. Microsoft accounts can
// also move mail into a folder instead of labelling it.
export const onboardingRuleActionSchema = z.enum([
  "label",
  "label_archive",
  "move_folder",
]);
export type OnboardingRuleAction = z.infer<typeof onboardingRuleActionSchema>;

// The rule set the onboarding chat proposes and the user edits before it
// goes live. `key` links a rule to its category in utils/category-config.
export const onboardingSetupSchema = z.object({
  status: z.enum(["draft", "enabling", "live", "error"]),
  rules: z.array(
    z.object({
      name: z.string().trim().min(1),
      key: z.string().nullish(),
      enabled: z.boolean(),
      action: onboardingRuleActionSchema,
      addedByAssistant: z.boolean().optional(),
    }),
  ),
});
export type OnboardingSetup = z.infer<typeof onboardingSetupSchema>;
