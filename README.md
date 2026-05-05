# 🎓 NESA Exam Papers Portal - Enhanced Version

An advanced exam papers portal system for Rwanda National Examinations with modern features including real-time search, comments system, and trending papers discovery.

## ✨ Enhanced Features

### 💬 **Comments System**
- Complete comment functionality using existing database table
- Anonymous comment submission with optional name/email
- Real-time comment loading without page refresh
- Admin reply capabilities
- Timestamp display for all comments

### 🔍 **Advanced Search (YouTube-style)**
- Real-time search with 300ms debouncing
- Advanced ranking algorithm:
  - Exact matches: 100 points
  - Partial matches: 80 points  
  - Related matches: 60 points
- Search suggestions dropdown
- Partial matching support (e.g., "math" matches "mathematics")
- Performance optimized with query limits

### 🔥 **Trending Papers Section**
- Dynamic trending papers based on download analytics
- Top 5-10 most downloaded papers
- Beautiful grid layout with fire emoji indicators
- Real-time updates from backend
- Mobile responsive design

### 🔗 **Related Papers Enhancement**
- Enhanced related papers algorithm
- Shows 4-8 related papers based on:
  - Same subject (highest priority)
  - Same level
  - Closest year
- Dynamic loading without page refresh

## 🚀 **Technical Stack**

### **Backend**
- **Node.js** with Express.js
- **MySQL** database with optimized queries
- **JWT** authentication for admin features
- **Multer** for file uploads
- **CORS** enabled for frontend integration

### **Frontend**
- **Vanilla JavaScript** (no framework dependencies)
- **Responsive CSS** with modern design
- **PDF.js** for document preview
- **Font Awesome** icons
- **Mobile-first** responsive design

### **Database**
- **MySQL/MariaDB** with existing schema
- **Comments table** (used as-is, no schema changes)
- **Downloads tracking** for analytics
- **Optimized queries** with proper indexing

## 📱 **Mobile Responsiveness**
- Fully responsive design for all devices
- Touch-friendly interface
- Optimized layouts for mobile screens
- Fast loading times

## ⚡ **Performance Optimizations**
- Debounced search input (300ms delay)
- Efficient database queries with limits
- AJAX-based interactions (no page reloads)
- Optimized API calls
- Proper caching strategies

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js (v14 or higher)
- MySQL/MariaDB database
- Modern web browser

### **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start the server
npm start
```

### **Database Setup**
```bash
# Import the database schema
mysql -u root -p exam_system < exam-system.sql
```

### **Frontend Setup**
```bash
# Frontend files are served statically by the backend
# No additional setup required
```

## 🌐 **Access Points**

- **Public Portal**: `http://localhost:5000/public/index.html`
- **Admin Dashboard**: `http://localhost:5000/admin/login.html`
- **API Status**: `http://localhost:5000/api/status`

## 📊 **API Endpoints**

### **Public Endpoints**
- `GET /api/papers/public` - Get all active papers
- `GET /api/papers/public/search` - Advanced search with ranking
- `GET /api/papers/public/trending` - Get trending papers
- `GET /api/papers/public/:id/related` - Get related papers
- `GET /api/papers/public/:id/comments` - Get paper comments
- `POST /api/papers/public/:id/comments` - Add comment

### **Admin Endpoints** (Authentication Required)
- `GET /api/papers/admin` - Get all papers
- `POST /api/papers/admin` - Add new paper
- `PUT /api/papers/admin/:id` - Update paper
- `DELETE /api/papers/admin/:id` - Delete paper

## 🔐 **Admin Access**

Default admin credentials (change after first login):
- **Username**: admin
- **Password**: admin123

## 📝 **Features Summary**

| Feature | Status | Description |
|---------|--------|-------------|
| Comments System | ✅ Complete | Anonymous comments with admin replies |
| Advanced Search | ✅ Complete | Real-time search with ranking algorithm |
| Trending Papers | ✅ Complete | Based on download analytics |
| Related Papers | ✅ Enhanced | Improved algorithm for better recommendations |
| Mobile Responsive | ✅ Complete | Works on all devices |
| PDF Preview | ✅ Complete | In-browser PDF viewing |
| Download Tracking | ✅ Complete | Analytics for trending papers |

## 🎯 **Project Rules Followed**

✅ **No folder structure changes**  
✅ **No UI/UX redesign** - Only enhanced functionality  
✅ **No database schema modifications** - Used existing comments table  
✅ **No existing features removed** - All original features preserved  
✅ **No demo/mock data** - Clean implementation  
✅ **Mobile responsiveness maintained**  
✅ **Fast interactions** - No unnecessary page reloads  

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏢 **About**

Developed for the **National Examination and School Inspection Authority (NESA)** - Rwanda.

This enhanced version maintains the original system's integrity while adding modern features for better user experience and functionality.
