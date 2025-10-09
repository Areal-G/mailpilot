# Mail Pilot API CLI Reference

## Install

Use one of:

- `npm install -g @mailpilot/api`
- `npx @mailpilot/api --help`

The executable name is `mail-pilot-api`.

## Authentication and config

- `MAIL_PILOT_API_KEY` is required for authenticated commands such as `rules` and `stats`.
- `MAIL_PILOT_BASE_URL` is optional for self-hosted or custom deployments.
- Config precedence is: flags, environment variables, `~/.mail-pilot-api/config.json`.

Examples:

```bash
mail-pilot-api config list
mail-pilot-api config get base-url
mail-pilot-api config set base-url https://your-domain.com
```

## Read operations

```bash
mail-pilot-api openapi --json
mail-pilot-api rules list --json
mail-pilot-api rules get rule_123 --json
mail-pilot-api stats by-period --period month --json
mail-pilot-api stats response-time --json
```

## Safe rule mutation flow

1. Inspect the live schema:

```bash
mail-pilot-api openapi --json
```

2. Read the current rule when editing an existing one:

```bash
mail-pilot-api rules get rule_123 --json > rule.json
```

3. Edit `rule.json` in the workspace.

4. Apply the full replacement:

```bash
mail-pilot-api rules update rule_123 --file rule.json --json
```

Create from a file:

```bash
mail-pilot-api rules create --file rule.json --json
```

Create or update from stdin:

```bash
cat rule.json | mail-pilot-api rules create --file - --json
cat rule.json | mail-pilot-api rules update rule_123 --file - --json
```

Delete a rule:

```bash
mail-pilot-api rules delete rule_123
```

## Notes

- `rules update` replaces the rule body rather than patching individual fields.
- Prefer temporary workspace files over inline JSON for larger payloads.
- Stats commands are always scoped to the inbox account attached to the API key.
