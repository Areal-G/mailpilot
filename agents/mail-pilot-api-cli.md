---
name: mail-pilot-api-cli
description: Inspect or update Mail Pilot rules and analytics through the public API CLI. Use when tasks involve rules, stats, or API-driven automation.
---

# Mail Pilot API CLI

Use `mail-pilot-api` with `--json` for stable output. Require `MAIL_PILOT_API_KEY` for authenticated commands.

1. Discover schema: `mail-pilot-api openapi --json`
2. Read before replace: `mail-pilot-api rules get <id> --json`
3. Apply full body: `mail-pilot-api rules update <id> --file rule.json --json`

Install: `npm install -g @mailpilot/api`. See the **mail-pilot-api** skill (`skills/mail-pilot-api/references/cli-reference.md`) for the full mutation flow.
