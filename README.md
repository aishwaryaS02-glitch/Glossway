# Glossway
Glossway 🌿

A calm, non-punitive language learning app that helps you practice speaking, listening, and conversation without the pressure of streaks, scores, or red error marks.

Why Glossway?

Most language apps gamify learning with streaks, hearts, and harsh red "X" marks for mistakes. Glossway takes a different approach: mistakes are treated as a normal part of learning, feedback is gentle and specific, and the whole experience is designed to feel like practicing with a patient friend — not being graded by a machine.

Features
AI conversation tutor — Practice real conversations in your target language. The tutor responds naturally, gently modeling corrections instead of interrupting or flagging mistakes.
Native Accent Coach — Get pronunciation feedback from an AI persona styled as a native speaker, using the Web Speech API to listen and give warm, specific coaching (no pass/fail scoring).
Calm, distraction-free UX — No streak pressure, no punitive scoring, no red error states.
Tech stack
Frontend: React + Vite
Backend: Firebase (Authentication, Firestore, Cloud Functions)
Speech: Web Speech API (speech recognition + synthesis)
AI: Claude / Gemini API (via a secure Cloud Function proxy — API keys never live in the frontend)
Getting started
Prerequisites
Node.js (LTS version recommended)
A Firebase project (Authentication + Firestore + Functions enabled)
An Anthropic or Gemini API key
Installation
bash
git clone https://github.com/aishwaryaS02-glitch/Glossway.git
cd Glossway
npm install
Environment variables

Create a .env file in the project root:

dotenv
# Firebase config (safe to expose in frontend, prefix with VITE_)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

AI API keys (Claude/Gemini) are not stored here — they live in Firebase Cloud Functions config, kept server-side only. See SETUP.md for details.

Run locally
bash
npm run dev

App will be available at http://localhost:3000.

Deploy
bash
npm run build
firebase deploy --only hosting
Project structure
Glossway/
├── src/                  # React frontend
│   ├── useTutorAgent.js  # Hook for talking to the AI tutor
│   ├── TutorChat.jsx     # Chat UI component
│   └── ...
├── functions/            # Firebase Cloud Functions
│   └── index.js          # AI tutor + accent coach backend logic
├── server.ts             # Local dev server
└── firebase.json         # Firebase Hosting config
Contributing

This project is currently maintained by Aishwarya S as a personal/portfolio project. Issues and suggestions are welcome.

License

Add your preferred license here (e.g. MIT).
