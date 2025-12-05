# Generate the Android project(first time set up)

npx expo prebuild

# Build release APK(build locally)

npm run build:apk

<!-- android/app/build/outputs/apk/release/app-release.apk -->

# Clean and try again(if build fails)

npm run clean
npm run build:local

# Start emulator

npm run build:local

# Build with Gradle directly (alternative method)

cd android
./gradlew assembleRelease
cd ..
