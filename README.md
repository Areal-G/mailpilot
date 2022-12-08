# Mail Pilot

> Tell your inbox what to do in plain English. Mail Pilot labels, archives and drafts replies for you.

*Status: early, things will change.*

Mail Pilot is an AI email assistant for Gmail and Outlook. You write rules like "Emails I need to respond to", and it labels and archives new mail, drafts replies in your voice and keeps track of what still needs an answer. It also comes with a fast split-inbox client for web and desktop.

You can self-host the whole thing.

## Requirements

- Node.js 24 and pnpm 11 (`corepack enable` installs it)
- Docker with Compose, or native PostgreSQL 16 and Redis
- macOS or Linux (on Windows, use WSL)

## Install

1. Clone the repo:

   ```bash
   git clone <your-fork-url> mail-pilot
   cd mail-pilot
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start everything locally with emulators (no OAuth apps or API keys needed):

   ```bash
   pnpm local:start
   ```

4. Open `http://localhost:3000/mail`.

Want to connect a real Gmail or Outlook account? Run `pnpm setup` to write `apps/web/.env`, then `pnpm dev`.
