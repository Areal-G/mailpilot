---
name: mail-pilot-api
description: Use the Mail Pilot API CLI to inspect the live API schema, list and manage automation rules, and read inbox analytics through the public API. Use this when a task involves Mail Pilot rules, stats, or API-driven automation and can be solved through the CLI instead of browser interaction.
homepage: https://www.mailpilot.app/api-reference/cli
metadata: { "openclaw": { "skillKey": "mailPilotApi", "requires": { "bins": ["mail-pilot-api"], "env": ["MAIL_PILOT_API_KEY"] }, "primaryEnv": "MAIL_PILOT_API_KEY", "install": [ { "id": "node", "kind": "node", "package": "@mailpilot/api", "bins": ["mail-pilot-api"], "label": "Install Mail Pilot API CLI (npm)" } ] } }
---

# Mail Pilot API CLI

Use this skill when the task is to inspect or change Mail Pilot state through the public API.

## Workflow

1. Prefer `--json` so the output is stable and machine-readable.
2. For authenticated commands (`rules`, `stats`, etc.), keep credentials in `MAIL_PILOT_API_KEY` or OpenClaw skill config. Avoid passing API keys as CLI flags unless there is no alternative.
3. Before creating or replacing a rule body, fetch the live schema with `mail-pilot-api openapi --json` (no API key required).
4. For create and update flows, write JSON into a workspace file or pipe it on stdin.
5. Treat `rules update` as a full replacement. Read the current rule first if you only intend to change part of it.

## Quick Start

```bash
mail-pilot-api rules list --json
mail-pilot-api stats by-period --period week --json
mail-pilot-api openapi --json
```

If the CLI is not installed yet, install it with the OpenClaw installer or run `npm install -g @mailpilot/api`.

## Cursor

Set `MAIL_PILOT_API_KEY` when using authenticated commands (`rules`, `stats`, etc.); `openapi --json` works without a key. Use shell profile, Cursor env, or a local env file—never commit keys. Install: `npm install -g @mailpilot/api` or `npx @mailpilot/api`.

## OpenClaw Config

Set the API key in `~/.openclaw/openclaw.json` under `skills.entries.mailPilotApi.apiKey`, or export `MAIL_PILOT_API_KEY` in the host environment.

Use `MAIL_PILOT_BASE_URL` or `mail-pilot-api config set base-url <url>` only for self-hosted or nonstandard deployments.

## Reference

For exact command patterns and a safe mutation flow, read `references/cli-reference.md`.
