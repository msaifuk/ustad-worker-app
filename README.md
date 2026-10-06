# Ustad — Worker App

Mobile app for tradespeople on **Ustad**, a home-services marketplace for Pakistan. Workers go online, receive bookings, move each job through its stages with one tap, and watch their earnings and career level grow.

> Pakistan's skilled workers have no diploma or ladder to show for years of work. Ustad gives them one: five levels from **Hunarmand** to **Legend**, with lower commission and real rewards at each step.

## Demo

- Demo video: _add link here_
- Screenshots: _add `screenshots/dashboard.png`, `screenshots/register.png`_

## Features

- Worker registration with trade selection (electrician, plumber, painter, carpenter, AC technician and more)
- Online / offline toggle
- **Level card** with progress bar toward the next level, and the current commission rate
- **Earnings** for today, this week, this month, and pending commission
- Incoming bookings with one-tap status updates: Accept, On my way, Arrived, Start work, Complete
- Level and job count update automatically when a job is completed

## Worker level system

| Level | Name | Jobs | Commission |
|-------|------|------|-----------|
| 1 | Hunarmand | 0-50 | 12% |
| 2 | Maahir | 51-150 | 10% |
| 3 | Ustad | 151-350 | 8% |
| 4 | Grand Ustad | 351-700 | 7% |
| 5 | Legend | 700+ | 5% |

Commission falls as workers level up. The customer pays the worker in cash; the worker sends the commission to the platform.

## Tech stack

- React Native with Expo (SDK 54) and Expo Router
- Axios for API calls, React Context for auth state
- Node.js / Express / PostgreSQL backend deployed on Railway (separate repo, private)
- Built as an installable Android APK with EAS Build

## Project structure

```
app/
  _layout.tsx
  context/AuthContext.js
  utils/api.js          API base URL (the Railway backend)
  screens/
    LoginScreen.js
    RegisterScreen.js
    DashboardScreen.js
```

## Run locally

```bash
npm install
npx expo start --clear
```

Scan the QR code with Expo Go (SDK 54). The app talks to the production API configured in `app/utils/api.js`.

## Build an Android APK

```bash
eas build --platform android --profile preview
```

Package name: `com.msaifuk.ustadpartner`.

## Current limitations

- Verification is a manual flag set by an admin; there is no document upload flow yet
- No push notifications, so new bookings appear when the dashboard is refreshed
- No live location sharing or map
- Certificates and level rewards (printed certificate, bonuses, insurance) are designed but not built
- Only tested on Android

## Related repositories

- [ustad-customer-app](https://github.com/msaifuk/ustad-customer-app) — app for customers
- [ustad-admin-dashboard](https://github.com/msaifuk/ustad-admin-dashboard) — admin web dashboard
- ustad-backend — Node.js API (private; available on request)

Built by [@msaifuk](https://github.com/msaifuk).
