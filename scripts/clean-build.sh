#!/bin/bash

echo "🧹 Cleaning build caches (keeps node_modules)..."

# Clean Android build
if [ -d "android" ]; then
  echo "Cleaning Android Gradle cache..."
  cd android && ./gradlew clean && cd ..
fi

# Clear Metro bundler cache
echo "Clearing Metro cache..."
rm -rf .expo
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Clear watchman (if installed)
if command -v watchman &> /dev/null; then
  echo "Clearing Watchman cache..."
  watchman watch-del-all
fi

echo "✅ Build cleanup complete!"
echo ""
echo "💡 Use this for most build issues"
echo ""
echo "If you still have problems, try:"
echo "  npm run clean:full  (removes node_modules - use only for dependency issues)"
