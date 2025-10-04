# 🎓 ExamQuest - Gamified Exam Platform

A modern, gamified exam platform built with React, Vite, and Firebase.

## ✨ Key Features

### Admin Features
- Create/Edit/Delete questions (MCQ, T/F, Short Answer, Drag & Drop, Reading Comprehension)
- Attach images to questions
- Add reading passages for comprehension questions
- Import/Export questions via JSON
- Manage categories and exams
- View student analytics

### Student Features
- Google Sign-In authentication
- Gamified experience with points, levels, badges
- Take timed exams
- View results and history
- Leaderboard rankings
- Responsive design

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd exam-platform
npm install
```

### 2. Firebase Setup
1. Create project at https://console.firebase.google.com
2. Enable Authentication (Google), Firestore, and Storage
3. Copy Firebase config to `.env` file

### 3. Run Development Server
```bash
npm run dev
```

### 4. Create Admin User
1. Sign in with Google
2. Go to Firestore → users collection
3. Change your user's `role` field to `"admin"`

## 📦 Deployment

### Build
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase login
firebase init hosting
firebase deploy
```

## 📖 Documentation

See full setup guide in SETUP.md

## 🛠️ Tech Stack
- React 18 + Vite
- Tailwind CSS + Framer Motion
- Firebase (Auth, Firestore, Storage)
- React Router + React DnD

