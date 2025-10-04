# 📚 Complete Setup Guide - ExamQuest Platform

This guide will walk you through setting up the ExamQuest exam platform from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Creating Your First Admin User](#creating-your-first-admin-user)
5. [Adding Sample Questions](#adding-sample-questions)
6. [Deployment to Firebase Hosting](#deployment-to-firebase-hosting)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **A Google account** for Firebase
- **A modern web browser** (Chrome, Firefox, Safari, or Edge)

---

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., `exam-quest-app`)
4. (Optional) Disable Google Analytics or configure it
5. Click **"Create project"** and wait for it to be created
6. Click **"Continue"** when done

### Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) under "Get started by adding Firebase to your app"
2. Enter an app nickname (e.g., `ExamQuest Web`)
3. Check **"Also set up Firebase Hosting"** (optional but recommended)
4. Click **"Register app"**
5. **Copy the Firebase configuration object** - you'll need this later
6. Click **"Continue to console"**

### Step 3: Enable Google Authentication

1. In the Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Click on **"Google"**
5. Toggle the **"Enable"** switch
6. Select a support email from the dropdown
7. Click **"Save"**

### Step 4: Create Firestore Database

1. In the Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules next)
4. Choose a location closest to your users (e.g., `us-central1`)
5. Click **"Enable"**

### Step 5: Configure Firestore Security Rules

1. Once your database is created, go to the **"Rules"** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Questions collection
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Exams collection
    match /exams/{examId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Exam Results collection
    match /examResults/{resultId} {
      allow read: if request.auth != null && 
                  (resource.data.studentId == request.auth.uid || isAdmin());
      allow create: if request.auth != null && 
                     request.resource.data.studentId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

### Step 6: Enable Firebase Storage

1. In the Firebase Console, click **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Click **"Next"** (keep production mode)
4. Choose the same location as your Firestore database
5. Click **"Done"**

### Step 7: Configure Storage Security Rules

1. Go to the **"Rules"** tab in Storage
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /questions/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/exam-platform.git
cd exam-platform
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including React, Firebase, Tailwind CSS, and more.

### Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` in a text editor and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Where to find these values:**
- Go to Firebase Console → Project Settings (gear icon)
- Scroll down to "Your apps"
- Click on your web app
- Copy each value from the `firebaseConfig` object

### Step 4: Start Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

---

## Creating Your First Admin User

By default, all new users are created as **students**. To create an admin:

### Step 1: Sign In

1. Open `http://localhost:5173` in your browser
2. Click **"Sign in with Google"**
3. Choose your Google account
4. You'll be redirected to the student dashboard

### Step 2: Change Role to Admin

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **"Firestore Database"** in the left sidebar
4. Click on the **"users"** collection
5. Find your user document (it will have your UID)
6. Click on the document
7. Find the **"role"** field
8. Click the pencil icon to edit
9. Change the value from `"student"` to `"admin"`
10. Click **"Update"**

### Step 3: Verify Admin Access

1. Go back to your app
2. Refresh the page (F5)
3. You should now see the **Admin Dashboard** with a purple/blue sidebar
4. You now have access to:
   - Questions management
   - Categories management
   - Exams creation
   - Student analytics

---

## Adding Sample Questions

### Method 1: Import Sample JSON

1. Go to **Admin Dashboard → Questions**
2. Click **"Import JSON"**
3. Upload the file `src/utils/sampleQuestions.json`
4. Click **"Import Questions"**
5. You should see 10 sample questions imported

### Method 2: Create Questions Manually

1. Go to **Admin Dashboard → Categories**
2. Create some categories first (e.g., Mathematics, Science, English)
3. Go to **Questions**
4. Click **"Add Question"**
5. Fill in the form:
   - Select question type
   - Choose category
   - Enter question text
   - Add options (for MCQ)
   - Set correct answer
   - Add points and difficulty
   - (Optional) Upload an image
   - (Optional) Add explanation
6. Click **"Create Question"**

### Question Types Available

1. **Multiple Choice (MCQ)**
   - Add 2-6 options
   - Select one correct answer

2. **True/False**
   - Simple binary choice
   - Select true or false as correct answer

3. **Short Answer**
   - Students type their answer
   - Case-insensitive matching

4. **Drag & Drop**
   - Create item-match pairs
   - Students drag items to correct matches

5. **Reading Comprehension**
   - Add a reading passage
   - Create questions about the passage
   - Multiple choice format

### Creating Your First Exam

1. Go to **Admin Dashboard → Exams**
2. Click **"Create Exam"**
3. Fill in exam details:
   - Title (e.g., "Mathematics Quiz 1")
   - Description
   - Category
   - Duration in minutes
   - Passing score percentage
4. Select questions to include
5. Set exam as **Active**
6. Click **"Create Exam"**

---

## Deployment to Firebase Hosting

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

### Step 3: Initialize Firebase Hosting

```bash
firebase init hosting
```

Answer the prompts:
- **"Please select an option:"** → Use an existing project
- **"Select a default Firebase project:"** → Choose your project
- **"What do you want to use as your public directory?"** → `dist`
- **"Configure as a single-page app?"** → `Yes`
- **"Set up automatic builds with GitHub?"** → `No` (for now)
- **"File dist/index.html already exists. Overwrite?"** → `No`

### Step 4: Build the Project

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Step 5: Deploy to Firebase

```bash
firebase deploy --only hosting
```

Wait for deployment to complete. You'll see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id/overview
Hosting URL: https://your-project-id.web.app
```

### Step 6: Update Authorized Domains

1. Go to Firebase Console → Authentication
2. Click **"Settings"** tab
3. Scroll to **"Authorized domains"**
4. Your hosting domain should already be there
5. If not, click **"Add domain"** and add `your-project-id.web.app`

Your app is now live! 🎉

---

## Troubleshooting

### Issue: "Firebase: Error (auth/unauthorized-domain)"

**Solution:**
1. Go to Firebase Console → Authentication → Settings
2. Add your domain to "Authorized domains"
3. For local development, `localhost` should already be there

### Issue: "Permission denied" when accessing Firestore

**Solution:**
1. Check that you're signed in
2. Verify Firestore rules are correctly set
3. For admin operations, ensure your user has `role: "admin"` in Firestore

### Issue: Build fails with "Cannot find module"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Images not uploading

**Solution:**
1. Check Storage rules are set correctly
2. Verify Storage is enabled in Firebase Console
3. Check browser console for specific error messages

### Issue: "Module not found" errors

**Solution:**
- Make sure all dependencies are installed: `npm install`
- Check that file paths in imports are correct
- Restart the dev server: `npm run dev`

### Issue: Styles not loading

**Solution:**
1. Ensure Tailwind CSS is properly configured
2. Check that `index.css` is imported in `main.jsx`
3. Clear browser cache and restart dev server

### Issue: Firebase quota exceeded (free tier)

**Solution:**
- Firebase free tier limits:
  - 50K reads/day
  - 20K writes/day
  - 1GB storage
- Upgrade to Blaze (pay-as-you-go) plan if needed
- Optimize queries to reduce reads

---

## Additional Configuration

### Adding More Admins

Repeat the process in "Creating Your First Admin User" for each admin account.

### Customizing the App

1. **Change Colors**: Edit `tailwind.config.js`
2. **Modify Gamification**: Edit point values in `src/pages/student/TakeExam.jsx`
3. **Add More Question Types**: Extend `QuestionModal.jsx` and `TakeExam.jsx`

### Backup Your Data

Export Firestore data regularly:
```bash
firebase firestore:export gs://your-bucket-name/backups
```

---

## Next Steps

1. ✅ Create categories for your subject areas
2. ✅ Add questions (manually or via JSON import)
3. ✅ Create your first exam
4. ✅ Test the student experience
5. ✅ Invite students to sign up
6. ✅ Monitor results and analytics

---

## Support

If you encounter any issues:
1. Check this guide thoroughly
2. Review Firebase Console for error logs
3. Check browser console for JavaScript errors
4. Verify all environment variables are set correctly

---

**Congratulations!** 🎉 Your ExamQuest platform is now ready to use!
