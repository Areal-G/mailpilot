#!/bin/sh
set -e

echo "🚀 Starting Mail Pilot worker..."
exec node /app/apps/worker/src/index.mjs
