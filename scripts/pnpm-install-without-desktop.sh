#!/bin/sh
# Workspace install for web/worker/server images and CI.
# Keeps @mailpilot/desktop in the lockfile (package.json is still copied) but
# does not install Electron.
set -eu
cd "$(dirname "$0")/.."
exec pnpm install --filter '!@mailpilot/desktop' "$@"
