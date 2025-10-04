# 🚀 FREE Deployment Guide - ExamQuest Platform

This guide shows you how to deploy your ExamQuest platform for **FREE** using either GitHub Pages or Firebase Hosting.

---

## 🎯 Option 1: GitHub Pages (Automatic - EASIEST)

### ✅ Advantages
- **100% FREE** - No credit card needed
- **Automatic deployment** - Push code and it deploys automatically
- **Custom domain support** - Free SSL certificate
- **Unlimited bandwidth** for public repos

### 📝 Setup Steps

#### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/ammarss3333/exam-quest-platform
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Click **Save**

#### Step 2: Trigger Deployment

The deployment will start automatically! You can:
- **Option A:** Just wait (it's already configured)
- **Option B:** Go to **Actions** tab and click **"Run workflow"**

#### Step 3: Wait for Build (2-3 minutes)

1. Go to **Actions** tab in your repository
2. You'll see "Deploy to GitHub Pages" workflow running
3. Wait for the green checkmark ✅

#### Step 4: Access Your Site

Your site will be live at:
```
https://ammarss3333.github.io/exam-quest-platform/
```

**That's it!** 🎉 Every time you push code, it auto-deploys.

---

## 🔥 Option 2: Firebase Hosting (More Features)

### ✅ Advantages
- **100% FREE** - 10GB storage, 360MB/day bandwidth
- **Custom domain** with free SSL
- **Better performance** - Global CDN
- **Preview channels** - Test before going live

### 📝 Setup Steps

#### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Name it: `exam-quest` (or any name)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

#### Step 2: Set Up Firebase Services

**Enable Authentication:**
1. Click **Authentication** → **Get started**
2. Enable **Google** sign-in method
3. Add support email

**Create Firestore Database:**
1. Click **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose location (e.g., us-central1)

**Enable Storage:**
1. Click **Storage** → **Get started**
2. Start in **production mode**
3. Same location as Firestore

**Add Security Rules** (see SETUP.md for rules)

#### Step 3: Get Firebase Config

1. Click **Project Settings** (gear icon)
2. Scroll to **Your apps**
3. Click **Web** icon (`</>`)
4. Register app: "ExamQuest Web"
5. Copy the config values

#### Step 4: Configure Environment Variables

Create `.env` file in project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

#### Step 5: Deploy to Firebase

**Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

**Login:**
```bash
firebase login
```

**Initialize (if not done):**
```bash
firebase init hosting
```
- Choose your project
- Public directory: `dist`
- Single-page app: `Yes`
- Don't overwrite index.html

**Build and Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

**Your site is live!** 🎉
```
https://your-project-id.web.app
```

---

## 🆚 Which One Should I Use?

| Feature | GitHub Pages | Firebase Hosting |
|---------|--------------|------------------|
| **Cost** | FREE ✅ | FREE ✅ |
| **Setup Time** | 2 minutes | 10 minutes |
| **Auto Deploy** | Yes ✅ | Manual |
| **Custom Domain** | Yes ✅ | Yes ✅ |
| **SSL Certificate** | Free ✅ | Free ✅ |
| **Backend Services** | No ❌ | Yes ✅ (Auth, DB) |
| **Performance** | Good | Excellent |
| **Best For** | Quick demo | Production app |

### 💡 Recommendation

**For Testing/Demo:** Use **GitHub Pages** (it's already set up!)

**For Production:** Use **Firebase Hosting** (better integration with Firebase services)

**Best Approach:** Use **BOTH**!
- GitHub Pages for quick previews
- Firebase for your main production site

---

## 🔧 Troubleshooting

### GitHub Pages: "Page not found"

1. Check Settings → Pages → Source is set to "GitHub Actions"
2. Go to Actions tab and re-run the workflow
3. Wait 2-3 minutes after deployment

### GitHub Pages: Blank page

1. Check browser console for errors
2. Ensure `vite.config.js` has correct base path:
   ```javascript
   base: '/exam-quest-platform/'
   ```

### Firebase: "Permission denied"

1. Make sure you're logged in: `firebase login`
2. Check you selected the right project
3. Verify Firestore/Storage rules are set

### Firebase: Build fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
firebase deploy
```

---

## 📱 After Deployment

### Create Your First Admin User

1. Visit your deployed site
2. Sign in with Google
3. Go to Firebase Console → Firestore Database
4. Find your user in `users` collection
5. Change `role` from `"student"` to `"admin"`
6. Refresh the site

### Add Sample Questions

1. Login as admin
2. Go to Questions → Import JSON
3. Upload `src/utils/sampleQuestions.json`
4. Create some exams
5. Test as a student!

---

## 🎉 You're Live!

Your ExamQuest platform is now accessible to anyone on the internet, completely FREE!

**Next Steps:**
1. ✅ Share your URL with students
2. ✅ Add your questions and exams
3. ✅ Monitor usage in Firebase Console
4. ✅ Customize the design (optional)

**GitHub Pages URL:**
```
https://ammarss3333.github.io/exam-quest-platform/
```

**Firebase URL (after setup):**
```
https://your-project-id.web.app
```

---

## 💰 Cost Breakdown

### GitHub Pages
- **Storage:** Unlimited
- **Bandwidth:** Unlimited (for public repos)
- **Build minutes:** 2,000 minutes/month FREE
- **Total cost:** $0.00 per month

### Firebase Free Tier
- **Authentication:** Unlimited users
- **Firestore:** 50K reads/day, 20K writes/day
- **Storage:** 1GB, 10GB/month downloads
- **Hosting:** 10GB storage, 360MB/day bandwidth
- **Total cost:** $0.00 per month

**Perfect for:**
- Up to 500 active students
- 100+ exams per day
- Thousands of questions
- All features included

---

## 🔐 Security Note

**Important:** Never commit your `.env` file to GitHub!

The `.gitignore` file already excludes it, but double-check:
```bash
# Make sure .env is in .gitignore
cat .gitignore | grep .env
```

---

## 📞 Need Help?

- **GitHub Pages Issues:** Check Actions tab for error logs
- **Firebase Issues:** Check Firebase Console → Logs
- **General Issues:** Review SETUP.md

---

**Congratulations!** 🎊 Your platform is now live and accessible worldwide, completely FREE!
