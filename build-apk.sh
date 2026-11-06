#!/bin/bash
# Automatisiertes Build-Skript für die FISI Praktikum Radar Android APK
echo "==> Baue Web-Applikation..."
npm run build

echo "==> Prüfe Capacitor Installation..."
if ! [ -x "$(command -v npx)" ]; then
  echo "Fehler: npx ist nicht installiert." >&2
  exit 1
fi

echo "==> Synchronisiere Android-Projekt..."
npx cap sync android

echo "==> Kompiliere APK (assembleDebug)..."
if [ -d "android" ]; then
  cd android
  ./gradlew assembleDebug
  echo "==> Fertig! APK erstellt unter: android/app/build/outputs/apk/debug/app-debug.apk"
else
  echo "==> Android-Plattform wird initialisiert..."
  npx cap add android
  npx cap sync android
  echo "==> Android-Ordner wurde erstellt. Öffne Android Studio oder führe ./gradlew assembleDebug im android-Ordner aus."
fi
