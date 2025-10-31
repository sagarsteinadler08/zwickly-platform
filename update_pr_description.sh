#!/bin/bash
# Update PR #1 description using GitHub CLI

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI not found. Installing..."
    echo "Run: brew install gh"
    echo "Then run: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Not authenticated. Run: gh auth login"
    exit 1
fi

# Update PR description
echo "Updating PR #1 description..."
gh pr edit 1 --body-file PR_DESCRIPTION.md

echo "✅ PR description updated!"
