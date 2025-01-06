#!/bin/bash

pnpm install && (cp "$CONDUCTOR_ROOT_PATH/apps/web/.env.local" apps/web/.env.local 2>/dev/null || cp ~/.config/mailpilot/.env.local apps/web/.env.local 2>/dev/null || echo 'WARNING: No .env.local found. Copy your env file to ~/.config/mailpilot/.env.local')
