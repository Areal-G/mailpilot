#!/bin/sh
set -e

# This script runs at container startup.
# It replaces the build-time placeholders with runtime environment variables.

echo "🚀 Starting Mail Pilot..."

# Define the variables to replace
# Add more NEXT_PUBLIC_ variables here as needed
if [ -n "$NEXT_PUBLIC_BASE_URL" ]; then
    /app/docker/scripts/replace-placeholder.sh "http://NEXT_PUBLIC_BASE_URL_PLACEHOLDER" "$NEXT_PUBLIC_BASE_URL"
fi

if [ -n "$DATABASE_URL" ]; then
    echo "🔄 Running database migrations..."
    if timeout 320 prisma migrate deploy --schema=./apps/web/prisma/schema.prisma; then
        echo "✅ Database migrations completed successfully"
    else
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ]; then
            echo "⚠️  Migration timeout (320s) exceeded"
        else
            echo "⚠️  Migration failed with exit code $EXIT_CODE"
        fi
        echo "⚠️  Continuing startup (database might be unavailable or migrations already applied)"
    fi
fi

# Start the Next.js application
echo "✅ Configuration complete. Starting server..."
exec node apps/web/server.js
