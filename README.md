# 🧠 NER NeuroSmriti

**AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)**

> A Smart India Hackathon project by the Ministry of Development of North Eastern Region (MDoNER)

---

## 🌟 Overview

NER NeuroSmriti is an AI-powered cognitive gaming and memory assistance platform designed specifically for elderly dementia patients in India's North Eastern Region. It addresses the critical gap in accessible, culturally-inclusive digital therapeutic solutions for cognitive health.

### Key Features

- 🎮 **6 Adaptive Cognitive Games** — Memory Match, Pattern Recognition, Daily Routine Recall, Object Recognition, Attention & Focus, Emotional Engagement
- 🧠 **AI-Powered Difficulty** — TensorFlow Lite adaptive engine that adjusts game difficulty based on patient performance
- 🌐 **Multilingual Support** — English, Assamese, and Hindi with voice assistance
- 🎤 **Voice Navigation** — Bhashini API integration for hands-free interaction
- ⏰ **Smart Reminders** — Medicine, hydration, daily activities, and appointments
- 📊 **Caregiver Dashboard** — Real-time progress monitoring and alerts
- 📴 **Offline-First** — Full functionality without internet, sync when connected
- 🔒 **Secure** — AES-256 encryption for all patient data
- 🎨 **Culturally NER** — Tea gardens, rhinos, Bihu, Hornbill, local music themes
- ♿ **Elderly-Friendly** — 60px+ touch targets, 24px+ fonts, high contrast mode

---

## 🏗️ Architecture

```
ner-cognicare/
├── mobile/                    # React Native + Expo (Patient App)
│   ├── src/
│   │   ├── components/ui/     # Elderly-friendly UI components
│   │   ├── games/             # 6 Cognitive game engines
│   │   ├── screens/           # App screens
│   │   ├── ai/                # Adaptive difficulty engine
│   │   ├── services/          # Storage, encryption, voice, sync
│   │   ├── store/             # Zustand state management
│   │   ├── i18n/              # English, Assamese, Hindi
│   │   └── config/            # Theme, constants
│   └── App.tsx
│
├── dashboard/                  # Next.js (Caregiver Web Dashboard)
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   ├── components/        # Dashboard UI components
│   │   └── lib/               # Firebase, data helpers
│   └── package.json
│
└── shared/                     # Shared types
```

---

## 🚀 Quick Start

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

### Caregiver Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Visit `http://localhost:3000` for the dashboard.

---

## 🎮 Cognitive Games

| Game | Description | Skills Targeted |
|------|-------------|-----------------|
| 🧠 Memory Match | Flip and match card pairs with NER cultural images | Short-term memory, visual recall |
| 🔍 Pattern Recognition | Complete pattern sequences with shapes and colors | Logic, sequence memory |
| 📅 Daily Routine Recall | Order daily activities in correct sequence | Procedural memory, daily living skills |
| 👁️ Object Recognition | Identify objects from images | Visual recognition, naming |
| 🎯 Attention & Focus | Find the different item in a grid | Sustained attention, visual scanning |
| ❤️ Emotional Engagement | Match emotions to faces and scenarios | Emotional intelligence, empathy |

---

## 🧠 AI Adaptive Difficulty

The platform uses a rule-based AI engine that:

1. **Tracks performance** across 10 recent sessions per game type
2. **Analyzes metrics**: accuracy, response time, completion rate
3. **Adjusts difficulty** when 3+ consecutive high/low scores are detected
4. **Provides cognitive health scoring** combining all game types

Difficulty levels: **Easy** → **Medium** → **Hard**

---

## 🌐 Multilingual Support

| Language | Coverage | Voice Support |
|----------|----------|---------------|
| English | Full UI + all games | ✅ |
| Assamese | Full UI + game narration | ✅ (Bhashini API) |
| Hindi | Full UI + game narration | ✅ (Bhashini API) |

---

## 📱 Technology Stack

| Layer | Technology |
|-------|-----------|
| Mobile Framework | React Native + Expo |
| State Management | Zustand |
| Local Database | SQLite (expo-sqlite) |
| Encryption | AES-256 (expo-crypto) |
| Voice/Bhashini | REST API |
| ML/Adaptive | TensorFlow Lite (planned) |
| Notifications | expo-notifications |
| Dashboard | Next.js 14 + Tailwind CSS |
| Charts | Recharts |
| Cloud Backend | Firebase (Auth, Firestore) |
| i18n | i18next |

---

## Local configuration

The dashboard uses Firebase Authentication for caregiver accounts. Copy the
variable names from `dashboard/.env.example` into `dashboard/.env.local`, create
the Firebase web app, and enable Email/Password sign-in in the Firebase console.

The mobile app reads `BHASHINI_API_URL` and `BHASHINI_API_KEY` from the Expo
environment through `mobile/app.config.ts`. Copy `mobile/.env.example` to
`mobile/.env` and provide the credentials issued for the SIH project. Keys are
intentionally not committed to this repository.

Without those values, caregiver authentication and Bhashini voice calls fail
with a clear configuration error or use the device voice fallback; demo data is
not silently treated as a real account or successful API response.

---

## 🔒 Security

- AES-256 encryption for all local patient data
- Firebase Authentication for caregiver dashboard
- Data never leaves device without encryption
- Offline-first architecture minimizes data exposure

---

## 🎨 Design Principles

- **60px+ touch targets** for elderly users
- **24px+ font sizes** with adjustable scaling
- **High contrast mode** for visual impairment
- **Voice-first navigation** for illiterate users
- **Cultural NER themes** (tea gardens, rhinos, Bihu, Hornbill)
- **Warm color palette** with forest greens and festival golds

---

## 📊 Caregiver Dashboard Features

- **Patient Overview** — Score, streak, last active
- **Progress Charts** — Cognitive scores over time
- **Game Statistics** — Per-game accuracy and sessions
- **Alert System** — Low performance, missed reminders, inactivity
- **Activity Timeline** — Recent game sessions

---

## 🏛️ Organization

- **Ministry**: Ministry of Development of North Eastern Region (MDoNER)
- **Theme**: Space Technology
- **Category**: Software

---

## 📝 License

This project was developed for the Smart India Hackathon. All rights reserved.

---

*Built with ❤️ for the elderly of North East India*
# smriti-dash
# smriti
# smriti
# neuro-smriti
# neuro-smriti-
