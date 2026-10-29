#!/usr/bin/env bash
# Installerar alla paket i versioner som matchar Expo SDK.
set -e
npm install expo@latest
npx expo install expo-router expo-font expo-splash-screen expo-status-bar expo-haptics expo-speech expo-linking expo-constants \
  react react-dom react-native react-native-web react-native-svg react-native-safe-area-context react-native-screens \
  @react-native-async-storage/async-storage @expo/vector-icons @supabase/supabase-js react-native-url-polyfill \
  @expo-google-fonts/rubik @expo-google-fonts/lexend @expo-google-fonts/ibm-plex-sans-arabic
npx expo install -- --save-dev typescript @types/react
