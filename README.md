# Wicki – lär dig trading (Expo / React Native)

Duolingo-liknande tradingkurs med maskoten Wicki. iPhone och Android, fyra språk (sv, en, fr, ar).

## Kom igång
```bash
./setup.sh        # installerar paket för rätt Expo SDK
npx expo start    # öppna i Expo Go eller simulator
```

## Bygga
```bash
npx eas-cli login
npx eas-cli init          # kopplar till ditt Expo-projekt
npx eas-cli build -p android --profile preview   # APK att testa
npx eas-cli build -p ios --profile preview       # iOS-simulator
npx eas-cli build -p all --profile production    # för butikerna
```

## Struktur
- `app/` skärmar (expo-router): stigen, öva, bibliotek, profil, lektion, introduktion, paus
- `src/engine/` lektionsmotor, övningar, grafer, repetition med mellanrum
- `src/data/` lektionsinnehåll, mönster, översättningar, barnförklaringar
- `src/ui/` Wicki, grafer, ark och knappar

Allt innehåll är utbildning, inte investeringsråd.

## Konton (Supabase)
Inloggning och synk av framsteg går via Supabase-projektet som delas med Presento (`src/account/`).
Framstegen sparas i tabellen `wicki_progress` (en rad per konto, RLS: bara egen rad).
Bekräftelse- och återställningsmejl använder projektets Site URL, ändra den under Authentication › URL Configuration om länkarna ska gå till Wicki.

## Juridik
Användarvillkor och integritetspolicy finns i `src/data/legal.ts` (svenska + engelska) och visas under Profil › Juridik och data.
"Radera mitt konto" anropar databasfunktionen `delete_my_account()` (Supabase), som tar bort användarens rad i `wicki_progress` och själva inloggningen.
