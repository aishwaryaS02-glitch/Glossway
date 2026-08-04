# Glossway - Language Learning Platform

Glossway is a modern, interactive language learning platform designed to help users master new languages through engaging tools, spaced repetition, and real-time AI assistance.

## Features

- **Interactive Learning Portal**: Access comprehensive multilingual resources, grammar rules, and vocabulary.
- **AI Learning Agent**: Chat with an intelligent tutor to practice conversational skills and get instant feedback.
- **Spaced Repetition System (SRS)**: Optimize your memory retention with smart flashcard reviews.
- **Daily Challenges & Quizzes**: Test your knowledge and maintain your learning streak.
- **Progress Tracking**: Monitor your XP, levels, and learning statistics over time.
- **Authentication & Profiles**: Secure user accounts with Firebase Authentication and persistent progress tracking via Firestore.
- **Responsive Design**: A beautiful, fully responsive UI built with Tailwind CSS and Framer Motion.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Backend/BaaS**: Firebase (Authentication, Firestore)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/glossway.git
   cd glossway
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
