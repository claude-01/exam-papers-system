# 🚀 Deployment Guide - Exam Papers Management System

## 📋 Free Hosting Options

### 1. **Vercel** (Recommended)
- **Cost:** Free
- **Database:** Vercel Postgres (Free tier)
- **Domain:** `exam-papers-system.vercel.app`
- **Setup:**
  ```bash
  # Install Vercel CLI
  npm i -g vercel
  
  # Deploy
  vercel --prod
  ```

### 2. **Render** 
- **Cost:** Free
- **Database:** PostgreSQL (Free tier)
- **Domain:** `exam-papers-system.onrender.com`
- **Setup:**
  ```bash
  # Install Render CLI
  npm i -g render-cli
  
  # Deploy
  render deploy
  ```

### 3. **Heroku**
- **Cost:** Free
- **Database:** PostgreSQL (Free tier - 10k rows)
- **Domain:** `exam-papers-system.herokuapp.com`
- **Setup:**
  ```bash
  # Install Heroku CLI
  npm i -g heroku
  
  # Deploy
  heroku create exam-papers-system
  git push heroku master
  ```

### 4. **Netlify + Supabase**
- **Cost:** Free
- **Database:** Supabase (Free tier)
- **Domain:** `exam-papers-system.netlify.app`
- **Setup:**
  ```bash
  # Frontend to Netlify
  npm i -g netlify-cli
  netlify deploy --prod --dir=frontend/public
  
  # Backend to separate service with Supabase DB
  ```

## 🔧 Database Configuration

### Environment Variables Needed:
```env
NODE_ENV=production
DATABASE_URL=your_database_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

### Database Migration:
```bash
cd backend
npm run migrate
```

## 📁 Project Structure for Deployment

```
exam-papers-system/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── routes/
├── frontend/
│   └── public/
└── deployments/
    ├── vercel.json
    ├── render.yaml
    └── heroku.json
```

## 🚀 Quick Deploy Commands

### Vercel (Easiest):
```bash
vercel --prod
```

### Render:
```bash
render deploy
```

### Heroku:
```bash
heroku create exam-papers-system
git subtree push --prefix backend heroku master
```

## 📊 Free Tier Limitations

| Service | Database | Bandwidth | Storage | Custom Domain |
|---------|----------|-----------|----------|---------------|
| Vercel | 512MB | 100GB/mo | Yes |
| Render | 256MB | 750GB/mo | Yes |
| Heroku | 10k rows | 2TB/mo | Yes |
| Netlify | External | 100GB/mo | Yes |

## 🎯 Recommended: Vercel

**Why Vercel is recommended:**
- ✅ Easiest deployment
- ✅ Built-in PostgreSQL
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Great performance
- ✅ GitHub integration
