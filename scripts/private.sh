#!/bin/bash

# /private command - Detach repository from upstream and prevent GitHub pushes

echo "🔒 Activating private mode for this repository..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Remove all remotes
echo "🔗 Removing all remote connections..."
for remote in $(git remote); do
    git remote remove "$remote"
    echo "   ✓ Removed remote: $remote"
done

# Create a pre-push hook to prevent accidental pushes
HOOK_PATH=".git/hooks/pre-push"
echo "🚫 Creating pre-push hook to prevent GitHub pushes..."

cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
echo "❌ PUSH BLOCKED: This repository is in private mode!"
echo "   To push changes, you must first remove private mode."
echo "   Delete .git/hooks/pre-push to restore push capability."
exit 1
EOF

chmod +x "$HOOK_PATH"

# Create a marker file to indicate private mode
echo "PRIVATE_MODE_ACTIVE" > .git/PRIVATE_MODE

# Update git config to remind about private mode
git config core.privateModeActive true

echo ""
echo "✅ Private mode activated successfully!"
echo ""
echo "📋 What this means:"
echo "   • All remote connections have been removed"
echo "   • Git push commands are now blocked"
echo "   • Your work stays local only"
echo ""
echo "🔓 To restore normal mode:"
echo "   1. Delete .git/hooks/pre-push"
echo "   2. Add remote: git remote add origin <your-repo-url>"
echo "   3. Delete .git/PRIVATE_MODE"
echo ""