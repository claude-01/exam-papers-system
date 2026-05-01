# Production Deployment Configuration

## Updated Files for Production Deployment

### Backend Changes
1. **backend/.env** - Updated with InfinityFree database credentials
   - DB_HOST: sqlXXX.infinityfree.com (replace XXX with your server number)
   - DB_USER: if0_41804406
   - DB_PASSWORD: Umuswa123
   - DB_NAME: if0_41804406_exam_system

2. **backend/server.js** - Updated CORS configuration
   - Added support for multiple origins including Render and Netlify
   - Allows requests from:
     - https://exam-papers-system.onrender.com
     - https://exam-papers-system-1.onrender.com
     - https://nesapastnationalexam.netlify.app

3. **backend/config/database.js** - Added DB_PORT support
   - Now supports custom port from .env (default 3306)

### Frontend Changes
1. **frontend/config.js** - New API configuration file
   - Automatically detects environment (localhost vs production)
   - Sets API_BASE_URL for all API calls
   - Provides getApiUrl() function for building API endpoints

2. **HTML Files Updated** (added config.js script tag):
   - frontend/public/index.html
   - frontend/admin/login.html
   - frontend/admin/analytics.html
   - frontend/admin/dashboard.html
   - frontend/admin/manage-papers.html

3. **JavaScript Files Updated** (using getApiUrl() for API calls):
   - frontend/js/auth.js
   - frontend/public/js/public.js
   - frontend/admin/js/dashboard.js
   - frontend/admin/js/manage-papers.js

## Deployment Instructions

### 1. Update .env with your InfinityFree credentials
```bash
Replace "sqlXXX" in DB_HOST with your actual server number (e.g., sql123)
```

### 2. Push to Render (Backend)
```bash
git add .
git commit -m "Update production configuration for deployment"
git push origin main
```

### 3. Deploy to Netlify (Frontend)
```bash
netlify deploy --prod
```

### 4. Initialize InfinityFree Database
- Log in to InfinityFree control panel
- Use phpMyAdmin to:
  - Create the database: `if0_41804406_exam_system`
  - Import the schema from `backend/exam_system.sql`
  - Or run the init script: `npm run init-db` against the remote database

## Production URLs
- **Backend API**: https://exam-papers-system.onrender.com/api/
- **Backend Backup**: https://exam-papers-system-1.onrender.com/api/
- **Frontend**: https://nesapastnationalexam.netlify.app/
- **Admin Panel**: https://nesapastnationalexam.netlify.app/admin/login.html

## Testing
1. Access the frontend at https://nesapastnationalexam.netlify.app/
2. Try loading papers (should fetch from Render backend)
3. Test admin login at /admin/login.html
4. Verify all API calls are working properly in browser DevTools

## Troubleshooting
- If API calls fail, check CORS headers in browser DevTools
- Verify InfinityFree database is created and accessible
- Check Render deployment logs for errors
- Ensure environment variables are properly set
