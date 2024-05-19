#!/bin/bash
set -e

echo "🔧 Setting up private marketing content..."

# Check if GitHub token is available
if [ -z "${GITHUB_ACCESS_TOKEN}" ]; then
    echo "⚠️  No GITHUB_ACCESS_TOKEN found - skipping private marketing setup"
    echo "ℹ️  This is normal for contributors and forks"
    echo "✅ Continuing with standard installation..."
    exit 0
fi

echo "🔑 GitHub token found, setting up marketing content..."

# Create .gitmodules with authenticated URL
echo "📝 Creating .gitmodules with authenticated URL..."
cat > .gitmodules << EOF
[submodule "apps/web/app/(marketing)"]
	path = apps/web/app/(marketing)
	url = https://${GITHUB_ACCESS_TOKEN}@github.com/mailpilot/marketing.git
EOF

# Initialize and update the submodule
echo "🔄 Initializing marketing submodule..."
git submodule update --init --recursive

# Clean up .gitmodules after cloning
echo "🧹 Cleaning up .gitmodules..."
rm -f .gitmodules

echo "✅ Private marketing setup complete!" 