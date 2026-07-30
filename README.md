# Glossway — Project Report

**A Calm, Non-Punitive Language Learning Application**

Prepared by: Aishwarya S
Repository: https://github.com/aishwaryaS02-glitch/Glossway

---

## 1. Abstract

Glossway is a web-based language learning application designed around a
core principle: learning a new language should not feel like being graded.
Most mainstream language apps rely on streaks, hearts, scores, and visual
error markers (red X's, "incorrect" labels) to drive engagement — a design
pattern that can increase anxiety and discourage learners from attempting
unfamiliar words or phrases. Glossway instead uses an AI-driven conversational
tutor and a native-accent pronunciation coach, both designed to give gentle,
specific, encouraging feedback rather than pass/fail judgments. The
application is built using React and Vite on the frontend, Firebase for
authentication and backend services, the Web Speech API for pronunciation
capture, and a large language model (Claude/Gemini) for generating
contextual, natural-language feedback.

---

## 2. Introduction

### 2.1 Motivation
Language learning apps often unintentionally punish experimentation. A
beginner who mispronounces a word or makes a grammatical error is frequently
met with a red mark, a "wrong" label, or a broken streak — feedback that
optimizes for retention metrics rather than genuine learning comfort. Glossway
was conceived to test an alternative: can a language app be built around
psychological safety without sacrificing the specificity of feedback needed
to actually improve?

### 2.2 Problem Statement
Design and build a language-learning web application that:
- Provides conversational practice in a target language.
- Offers pronunciation feedback using speech recognition.
- Communicates feedback in a way that is specific and useful, but never
  punitive, scored, or shaming.

### 2.3 Objectives
1. Build a conversational AI tutor that responds naturally in the target
   language and models corrections without interrupting the learner.
2. Build a "Native Accent Coach" feature that gives spoken pronunciation
   feedback using an AI persona and the Web Speech API.
3. Design a calm, distraction-free UI/UX free of punitive visual cues.
4. Deploy the application publicly via Firebase Hosting so it is accessible
   to real users, not just a local demo.

---

## 3. System Overview

### 3.1 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend / Auth / DB | Firebase (Authentication, Firestore, Cloud Functions) |
| Speech input/output | Web Speech API |
| AI reasoning layer | Claude (Anthropic API) / Gemini API |
| Hosting | Firebase Hosting |
| Version control | GitHub (aishwaryaS02-glitch/Glossway) |

### 3.2 Architecture

```
User (browser)
   │
   ├── React frontend (Vite)
   │      ├── Chat UI (TutorChat.jsx)
   │      ├── Web Speech API (mic input / transcript)
   │      └── Firebase Auth (sign in / sign up)
   │
   ▼
Firebase Cloud Function (server-side proxy)
   │
   ├── Holds AI API key securely (never exposed to frontend)
   ├── Applies system prompt (Tutor persona OR Accent Coach persona)
   └── Calls Claude / Gemini API, returns natural-language response
   │
   ▼
Firestore (stores user progress, chat history, target language/level)
```

The key architectural decision is that **all AI API keys live server-side**,
inside a Firebase Cloud Function, never in the React bundle or a `.env`
file exposed to the client. The frontend calls the Cloud Function, which
calls the AI provider and returns only the generated text.

---

## 4. Core Features

### 4.1 Conversational AI Tutor
A chat-based practice partner that:
- Speaks primarily in the user's target language, calibrated to their level.
- Uses "recasting" — if the user makes a mistake, the tutor doesn't flag
  it directly, but naturally rephrases the correct form in its own reply.
- Introduces new vocabulary sparingly and in context, rather than as a
  vocabulary drill.

### 4.2 Native Accent Coach
An AI persona (e.g. "Priya Hegde," a native-speaker coach) that:
- Receives the target word/phrase, its phonetic guide, and the user's
  spoken transcript (captured via Web Speech API).
- Gives short, warm, descriptive pronunciation feedback (e.g. describing
  mouth shape or rhythm in plain language) instead of a numeric score.
- Never uses "wrong," "incorrect," or pass/fail language, even when
  speech recognition confidence is low.

### 4.3 Authentication
Firebase Authentication (email/password) manages user accounts, with
friendly, non-technical error handling for common cases (e.g. an
already-registered email prompts the user to log in instead, rather than
showing a raw Firebase error).

### 4.4 Deployment
The application is deployed via Firebase Hosting, connected to a GitHub
repository, with an optional GitHub Actions workflow for automatic
redeployment on merge to the main branch.

---

## 5. Design Philosophy: Non-Punitive UX

A deliberate design constraint threaded through every feature:
- **No red error states.** Color palette avoids red/orange as primary
  colors; feedback uses warm, muted tones instead (see Section 6).
- **No scores or streak pressure.** Progress is framed as accumulation,
  not as a performance metric that can be "broken."
- **Language matters.** All AI-generated feedback text is explicitly
  instructed (via system prompt) to avoid punitive or clinical wording.

---

## 6. Visual Design

The app uses a **"Sage calm"** color palette — teal/green tones associated
with growth and calm, avoiding the alarm-like connotations of bright red
or orange commonly used for "incorrect" states in other apps.

| Role | Color |
|---|---|
| Background | `#E1F5EE` |
| Accent | `#5DCAA5` |
| Text (dark) | `#085041` |
| Warm highlight | `#F5C4B3` |

---

## 7. Implementation Status (as of this report)

| Component | Status |
|---|---|
| React/Vite frontend scaffold | ✅ Complete |
| Firebase Authentication | ✅ Working (email/password) |
| Firestore integration | 🔄 In progress |
| AI Tutor Cloud Function | ✅ Implemented |
| Native Accent Coach persona | ✅ Prompt designed, integration in progress |
| Web Speech API integration | 🔄 In progress |
| Public deployment (Firebase Hosting) | 🔄 In progress |
| GitHub CI/CD (Actions) | 🔄 In progress |
| README / documentation | ✅ Complete |

---

## 8. Challenges Encountered

- **Environment variable configuration:** Early setup issues with `.env`
  not being read by the dev server (`dotenvx` reporting 0 injected
  variables), traced to file placement and encoding issues on Windows.
- **API key security:** Initial Gemini API key was exposed in a
  `.env` file intended for AI Studio's auto-injection; required rotating
  the key and moving AI calls to a server-side Cloud Function to prevent
  frontend exposure.
- **Firebase Auth edge cases:** Handling `auth/email-already-in-use`
  gracefully for both testing (deleting test users) and production
  (friendly fallback messaging).
- **Deployment tooling:** Working through `firebase init hosting`
  configuration (public directory, single-page app rewrites) and
  optional GitHub Actions integration for CI/CD.

---

## 9. Future Work

- Complete Firestore-based progress tracking (streak-free, but able to
  show learning history).
- Expand the Accent Coach to support multiple native-speaker personas
  across different target languages.
- Add offline/PWA support for practicing without a constant connection.
- Conduct user testing to validate the non-punitive UX hypothesis against
  a traditional gamified control group.

---

## 10. Conclusion

Glossway demonstrates that a language-learning application can be built
around encouragement and psychological safety without giving up specific,
actionable feedback. By combining a conversational AI tutor with a
persona-driven pronunciation coach, and by deliberately avoiding punitive
visual and linguistic patterns common in the category, the app offers a
calmer alternative for learners who may be discouraged by traditional
gamified apps. The technical implementation — React/Vite frontend, Firebase
backend, and a secured AI proxy layer — provides a solid foundation for
continued development toward a full public release.

---

## Appendix: Repository & Links

- GitHub: https://github.com/aishwaryaS02-glitch/Glossway
- Hosting: Firebase Hosting (URL pending final deployment)
