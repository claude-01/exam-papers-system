# 🚀 Quick Deployment Guide - Exam Papers Management System

## 🎯 EASIEST: Vercel (Free Hosting)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel
```bash
vercel --prod
```

### Step 3: Follow Prompts
- **Link to existing project?** No
- **Project name:** exam-papers-system
- **Directory:** . (current directory)
- **Override settings?** No

### Step 4: Set Environment Variables
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables

Add these:
```
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

### Step 5: Set Up Database
1. In Vercel Dashboard → Storage → Create Database
2. Choose PostgreSQL
3. Copy connection string
4. Update DATABASE_URL environment variable

### Step 6: Redeploy
```bash
vercel --prod
```

## 🌐 Your Live Links

**After deployment, your project will be available at:**
- **Main App:** https://exam-papers-system.vercel.app
- **API:** https://exam-papers-system.vercel.app/api
- **GitHub:** https://github.com/claude-01/exam-papers-system

## 🔧 Alternative: Netlify + Supabase

### Step 1: Deploy Frontend to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=frontend/public
```

### Step 2: Set Up Supabase Database
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string
4. Run migration script

### Step 3: Deploy Backend Separately
Deploy backend to Render/Heroku with Supabase database

## 📋 What You Get Online

✅ **Complete Exam Papers Management System**
- Comment system with modal interface
- Bookmark functionality with visual indicators
- PDF viewer with integrated controls
- Admin and user dashboards
- Responsive modern design
- Database integration
- Free hosting with custom domain

## 🎉 Ready in 5 Minutes!

Just run: `vercel --prod` and follow the prompts!
