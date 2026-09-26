# BuzNeet — React Native / Expo

The repository now contains a native Expo React Native application without removing the existing web implementation.

## Native entry

- Expo config: app.json
- Routes: app/
- Native shared UI: native/
- Existing question/data model: src/data/neet.ts
- Native persistence: AsyncStorage
- Navigation: Expo Router

## Run

Install dependencies, then:

npm install
npx expo start

Press A for Android or scan the QR code with Expo Go/development tooling.

## Android APK

The repository includes eas.json with a preview profile configured as an installable APK.

npx eas-cli@latest build --platform android --profile preview

A production store build can use:

npx eas-cli@latest build --platform android --profile production

An Expo account is required for EAS builds.

## Important

The existing web application source remains in src/routes and related web components. The native app is implemented separately under app/ and native/ so the existing web UI and functionality are not destroyed during the platform migration.

The native UI intentionally follows the existing BuzNeet screen hierarchy, colors, spacing, card treatment, navigation structure, onboarding flow, practice flow, tests, mistake notebook, profile, and local study state.
