# Mail Pilot

> Tell your inbox what to do in plain English. Mail Pilot does the rest.

*Status: beta. Works well, still moving fast.*

Mail Pilot is an AI email assistant and a fast email client for Gmail and Outlook. Rules written in plain English decide what happens to each new email: label it, archive it, draft a reply, forward it, or mark it as cold outreach. It tracks threads that need your reply or are waiting on someone else, and it cleans up newsletters and old mail in bulk. The client is a split inbox for web and desktop (Electron).

## What you get

- Rules in plain English, with a default set: To Reply, Awaiting Reply, FYI, Newsletter, Marketing, Calendar, Receipt, Notification and Cold Email
- Drafts written from your email history and knowledge base, never sent on their own
- Reply tracking, a cold email blocker, and smart filing of attachments to Google Drive or OneDrive
- Bulk unsubscribe, bulk archive and email analytics
- A chat assistant, also available from Slack, Telegram and Microsoft Teams
- Split inbox with multiple Gmail and Outlook accounts, web and Electron desktop

## Requirements

- Node.js 24 and pnpm 11
- Docker with Compose, or native PostgreSQL 16 and Redis
- macOS or Linux (WSL on Windows)

## Install

1. `git clone <your-fork-url> mail-pilot && cd mail-pilot`
2. `pnpm install`
3. `pnpm local:start` (add `--port 3001` if 3000 is taken)
4. Open `http://localhost:3000/mail`

For real providers, run `pnpm setup` and then `pnpm dev`.

## Environment variables

| Variable | Required | Default | Example | Used by | Description | Notes |
|---|---|---|---|---|---|---|
| `DATABASE_URL` | Yes | | | web | PostgreSQL connection string | |
| `DIRECT_URL` | Yes | | | web | PostgreSQL connection string | |
| `NEXT_PUBLIC_BASE_URL` | Yes | | | web | Public URL of the web app | |
| `AUTH_SECRET` | Yes | | | web | Session signing secret | |
| `EMAIL_ENCRYPT_SECRET` | Yes | | | web | Encrypt stored OAuth tokens | |
| `EMAIL_ENCRYPT_SALT` | Yes | | | web | Encrypt stored OAuth tokens | |
| `INTERNAL_API_KEY` | Yes | | | | Internal calls | |
| `API_KEY_SALT` | Yes | | | | Public API keys | |
| `CRON_SECRET` | Yes | | | | Cron jobs | |
| `GOOGLE_CLIENT_ID` | For Gmail | | | | OAuth app | |
| `GOOGLE_CLIENT_SECRET` | For Gmail | | | | OAuth app | |
| `GOOGLE_PUBSUB_*` | For Gmail | | | | Pub/Sub topic for push notifications | |
| `MICROSOFT_CLIENT_ID` | For Outlook | | | | Azure app registration | |
| `MICROSOFT_CLIENT_SECRET` | For Outlook | | | | Azure app registration | |
| `REDIS_URL` | Yes | | | | Redis for cache and queues | or HTTP below |
| `REDIS_HTTP_URL` | | | | | Redis for cache and queues | |
| `REDIS_HTTP_TOKEN` | | | | | Redis for cache and queues | |
| `QUEUE_BACKEND` | No | | | worker | Queue driver | BullMQ or QStash |
| `QSTASH_*` | No | | | | | |
| `LLM_API_KEY` | Yes | | | | AI provider key | |
| `DEFAULT_LLMS` | Yes | | | | | `provider:model` |
| `ECONOMY_LLMS` | Yes | | | | | `provider:model` |
| `CHAT_LLMS` | Yes | | | | | `provider:model` |
| `NANO_LLMS` | Yes | | | | | `provider:model` |
| `DRAFT_LLMS` | Yes | | | | | `provider:model` |
| `SLACK_*` | No | | | | Chat integrations | |
| `TELEGRAM_*` | No | | | | Chat integrations | |
| `TEAMS_*` | No | | | | Chat integrations | |
| `STRIPE_*` | No | | | | Billing | |
| `NEXT_PUBLIC_DEMO_MODE` | No | | | | Guest "Try demo" sign-in | throwaway mailbox only |
| `DEMO_USER_EMAIL` | No | | | | Guest "Try demo" sign-in | |
| `NEXT_PUBLIC_BYPASS_PREMIUM_CHECKS` | No | | | | Unlock premium features when self-hosting | |

See `apps/web/.env.example` for the rest.

## Deployment

- Docker: `docker-compose.yml` runs the web app, worker, cron, PostgreSQL and Redis
- Production image: `docker/Dockerfile.prod`
- Kubernetes: Helm chart in `charts/`
- AWS: `pnpm setup-aws` (Copilot) or `pnpm setup-terraform`
- Vercel for the web app, with managed PostgreSQL, Upstash Redis and QStash

## Roadmap / TODO

- [x] Rules in plain English
- [x] Default rule set
- [x] Draft replies
- [x] Reply tracking (To Reply / Awaiting Reply)
- [x] Cold email blocker
- [x] Bulk unsubscribe
- [x] Bulk archive by sender category
- [x] Email analytics
- [x] Smart filing to Google Drive / OneDrive
- [x] Slack, Telegram and Teams chat
- [x] Meeting briefs before calls with outside guests
- [x] Split inbox client
- [x] Electron desktop app
- [x] Organizations, public API and Stripe billing
- [x] Per-task AI providers
- [x] Local mode with emulators
- [x] Guest demo
- [ ] Sample analytics and sender data in the local demo
- [ ] Populated Bulk Unsubscribe and Analytics pages out of the box
- [ ] Smarter draft replies that learn from sent mail
- [ ] More chat channels
- [ ] Richer actions from Slack and Teams
- [ ] Shared inboxes
- [ ] Team assignment in the client

## Deploying

You can deploy Mail Pilot with Docker (`docker-compose.yml` runs the web app, worker, cron, PostgreSQL and Redis), with the Helm chart in `charts/`, on AWS with `pnpm setup-aws` or `pnpm setup-terraform`, or on Vercel with managed PostgreSQL, Upstash Redis and QStash.

For production, create Google and Microsoft OAuth apps, set up Gmail Pub/Sub for push notifications, choose your LLM providers, and keep `NEXT_PUBLIC_DEMO_MODE` off.
