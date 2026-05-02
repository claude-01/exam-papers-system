# 🚀 Complete Deployment Guide: Netlify + Render + PostgreSQL

## Current Status
- ✅ PostgreSQL migration completed
- ✅ Backend configured for Render
- ✅ Frontend configured for Netlify
- ❌ Backend not deployed yet (503 error)
- ❌ Frontend deployed but can't connect to backend

## Step-by-Step Deployment

### 1. Backend Deployment (Render)

#### Option A: Using Render Dashboard (Recommended)
1. **Go to Render.com** and sign in
2. **Connect your GitHub repository**:
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select the `exam-papers-system` repository

3. **Configure the Web Service**:
   - **Name**: `exam-papers-api`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://nesa_c60h_user:Umuswa1@@dpg-d7qns7v7f7vs73cdg1lg-a:5432/nesa_c60h
   JWT_SECRET=nesa_portal_jwt_secret_2024_secure_key_change_this
   ```

5. **Create PostgreSQL Database** (if not already created):
   - Go to Render Dashboard → "New" → "PostgreSQL"
   - Name: `exam-papers-db`
   - Copy the `DATABASE_URL` to your web service

6. **Deploy**: Click "Create Web Service"

### 2. Database Initialization
After backend is deployed, initialize the database:

1. **SSH into Render service** or use the shell in Render dashboard
2. **Run initialization**:
   ```bash
   cd backend
   npm run init-db
   ```

### 3. Frontend Deployment (Netlify)

#### Option A: Using Netlify Dashboard
1. **Go to Netlify.com** and sign in
2. **Connect your GitHub repository**:
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select `exam-papers-system`

3. **Configure Build Settings**:
   - **Base directory**: (leave empty)
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/public`

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   ```

5. **Deploy**: Click "Deploy site"

#### Option B: Using netlify-cli
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=frontend/public
```

### 4. Update Frontend Configuration

After backend is deployed, update `frontend/config.js` with the actual Render URL:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://YOUR-RENDER-APP-NAME.onrender.com';
```

### 5. Testing

Test these URLs after deployment:
- **Backend API**: `https://YOUR-RENDER-APP-NAME.onrender.com/api/status`
- **Frontend**: `https://YOUR-NETLIFY-SITE-NAME.netlify.app`
- **Papers API**: `https://YOUR-RENDER-APP-NAME.onrender.com/api/papers`

## Troubleshooting

### Backend Issues
- **503 Error**: Check Render logs, ensure DATABASE_URL is correct
- **Database Connection**: Run `npm run init-db` in Render shell
- **CORS Issues**: Check allowed origins in `server.js`

### Frontend Issues
- **API Connection Failed**: Verify the API_BASE_URL in `config.js`
- **Build Errors**: Ensure `npm run build` works locally

### Database Issues
- **Connection Failed**: Check DATABASE_URL format
- **Tables Missing**: Run `npm run init-db`
- **SSL Issues**: Ensure `ssl: true` in database config

## Free Tier Limits
- **Render**: 750 hours/month free
- **Netlify**: 100GB bandwidth/month free
- **PostgreSQL**: 1GB storage free

## Security Notes
- Change the JWT_SECRET to a secure random string
- Never commit sensitive credentials to GitHub
- Use environment variables for all secrets