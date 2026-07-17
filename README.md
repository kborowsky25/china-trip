# Xenia in China 🐼

A private trip companion for our Aug–Sep 2026 China trip
(London → Beijing → Chengdu → Chongqing → Zhangjiajie → Shanghai → Taipei → Hong Kong → London).

Map-first iPhone app: a live route map, the itinerary, a timeline, hotels, per‑person
flights, a budget + live FX converter, and per‑stop notes / reels / added hotels that
**sync across the group**. Pick who you are on entry — no login.

## Structure

| Path       | What                                                                    |
|------------|-------------------------------------------------------------------------|
| `mobile/`  | Expo (SDK 54) / React Native app — expo-router, reanimated, Leaflet map |
| `server/`  | Fastify + SQLite sync backend (notes, reels, added hotels/spots)        |
| `scripts/` | Asset + data generators (panda icon, hero images, trip data)            |

## Run it

**App**

```bash
cd mobile
npm install
EXPO_PUBLIC_API_BASE=http://localhost:4000 npx expo start
```

**Sync backend**

```bash
cd server
npm install
npm run dev      # http://localhost:4000
```

## Build (EAS)

```bash
cd mobile
eas build --profile development --platform ios   # dev build for a device
```

Owner: `kilianjaymesborowsky` (Expo) · App Store Connect app `6791805931`.

---
🤖 Built with [Claude Code](https://claude.com/claude-code)
