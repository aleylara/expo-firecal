#!/bin/bash

echo "⚠️  FULL CLEAN - This will remove node_modules and native projects"
echo "Only use this for:"
echo "  - Dependency conflicts"
echo "  - After updating Expo SDK"
echo "  - Corrupted node_modules"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 1
fi

echo "🧹 Removing all build artifacts and dependencies..."

# Remove build folders
rm -rf android
rm -rf ios
rm -rf .expo
rm -rf node_modules

# Clear caches
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*

# Clear watchman (if installed)
if command -v watchman &> /dev/null; then
  watchman watch-del-all
fi

echo "📦 Reinstalling dependencies..."
npm install

echo "🔨 Regenerating native projects..."
npx expo prebuild --clean

echo "✅ Full clean complete! Ready to build."
