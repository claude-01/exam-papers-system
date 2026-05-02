# 🎓 Exam Papers Management System

A comprehensive web-based platform for managing and accessing NESA (National Examination and School Inspection Authority) past examination papers with advanced commenting and bookmarking features.

## ✨ Features

### 📚 Core Functionality
- **Paper Management**: Upload, organize, and manage exam papers by year, level, and subject
- **Advanced Search**: Filter papers by year, level, category, subject, and trade/combination
- **PDF Viewer**: Built-in PDF viewer with integrated controls
- **Download Support**: Direct download functionality for all papers

### 💬 Comment System
- **User Comments**: Students can comment on papers and ask questions
- **Admin Replies**: Administrators can reply to user comments and provide guidance
- **Moderation**: Admin can delete inappropriate comments
- **Real-time Updates**: Comments appear instantly without page refresh

### 🔖 Bookmark System
- **Visual Bookmarks**: Prominent bookmark buttons with filled/outline states
- **Quick Access**: Bookmark papers for easy access later
- **Bookmark Count**: Track total number of bookmarked papers

### 👥 User Roles
- **Public Portal**: Accessible to all users for browsing and downloading papers
- **Admin Dashboard**: Full administrative control over papers and comments
- **Analytics**: Track downloads, views, and user engagement

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with smooth animations
- **Accessibility**: WCAG compliant with proper contrast and navigation
- **Fast Performance**: Optimized loading and caching

## 🏗️ Technical Architecture

### Backend (Node.js + Express)
```
backend/
├── server.js              # Main application server
├── config/
│   └── database.js        # PostgreSQL database configuration
├── routes/
│   ├── papers.js          # Paper management endpoints
│   ├── comments.js        # Comment system endpoints
│   └── auth.js            # Authentication endpoints
├── models/                # Database models
├── middleware/            # Authentication and validation
└── uploads/               # PDF file storage
```

### Frontend (HTML + CSS + JavaScript)
```
frontend/
├── public/                # Public-facing portal
│   ├── index.html         # Main landing page
│   ├── css/
│   │   └── public.css      # Public portal styles
│   └── js/
│       └── public.js       # Public portal functionality
├── admin/                 # Admin dashboard
│   ├── dashboard.html     # Admin main page
│   ├── manage-papers.html # Paper management
│   ├── analytics.html     # Analytics dashboard
│   └── js/
│       └── manage-papers.js # Admin functionality
└── css/
    ├── admin.css          # Admin dashboard styles
    └── style.css          # Global styles
```

### Database Schema
- **exam_papers**: Paper information and metadata
- **comments**: User comments and admin replies
- **downloads**: Download tracking and analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 14.0 or higher
- PostgreSQL 12 or higher
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/claude-01/exam-papers-system.git
cd exam-papers-system
```

2. **Install dependencies**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies (if using build tools)
cd ../frontend
npm install
```

3. **Database Setup**
```bash
# Initialize the PostgreSQL schema from backend/init-db.js
cd backend
npm install
npm run init-db
```

4. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials or use DATABASE_URL
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/exam_system
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=exam_system
PORT=5000
```

5. **Start the application**
```bash
# Start backend server
cd backend
npm start

# Or for development with auto-reload
npm run dev
```

6. **Access the application**
- **Public Portal**: http://localhost:5000/public/index.html
- **Admin Dashboard**: http://localhost:5000/admin/dashboard.html
- **API Documentation**: http://localhost:5000/api/

## 📁 Project Structure

```
exam-papers-system/
├── backend/                 # Node.js backend server
│   ├── server.js           # Main application entry point
│   ├── package.json        # Backend dependencies
│   ├── config/             # Configuration files
│   ├── routes/             # API route handlers
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   └── uploads/            # PDF file uploads
├── frontend/               # Frontend application
│   ├── public/             # Public-facing portal
│   │   ├── index.html     # Main landing page
│   │   ├── css/            # Public portal styles
│   │   └── js/             # Public portal scripts
│   ├── admin/              # Admin dashboard
│   │   ├── dashboard.html
│   │   ├── manage-papers.html
│   │   ├── analytics.html
│   │   └── js/             # Admin scripts
│   └── css/                # Global styles
├── deployments/            # Deployment configurations
│   ├── vercel.json         # Vercel deployment
│   ├── render.yaml         # Render deployment
│   └── heroku.json         # Heroku deployment
├── DEPLOY.md               # Deployment guide
├── README.md               # This file
└── .gitignore              # Git ignore rules
```

## 🔧 API Endpoints

### Papers Management
- `GET /api/papers/public` - Get all public papers
- `GET /api/papers/admin` - Get all papers (admin only)
- `POST /api/papers` - Upload new paper
- `PUT /api/papers/:id` - Update paper
- `DELETE /api/papers/:id` - Delete paper

### Comments System
- `GET /api/comments/paper/:paperId` - Get comments for a paper
- `POST /api/comments` - Add new comment or reply
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `GET /api/comments/stats/summary` - Get comment statistics

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

## 🎨 Customization

### Adding New Paper Categories
1. Update the database schema in `backend/exam_system.sql`
2. Modify the frontend form options in `frontend/admin/manage-papers.html`
3. Update the filter options in `frontend/public/js/public.js`

### Styling Customization
- Edit `frontend/css/public.css` for public portal styles
- Edit `frontend/css/admin.css` for admin dashboard styles
- Edit `frontend/css/style.css` for global styles

### API Extensions
- Add new routes in `backend/routes/`
- Update middleware in `backend/middleware/`
- Modify database models as needed

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Render
```bash
npm install -g render-cli
render deploy
```

### Heroku
```bash
heroku create exam-papers-system
git subtree push --prefix backend heroku master
```

## 📊 Features in Detail

### Comment System
- **Threaded Comments**: Support for nested replies
- **Admin Badges**: Visual distinction for admin responses
- **Real-time Updates**: Comments appear without page refresh
- **Moderation Tools**: Delete inappropriate content
- **Character Limits**: Prevent spam with 3-1000 character limits

### Bookmark System
- **Visual Indicators**: Filled/outline bookmark states
- **Hover Effects**: Smooth animations and transitions
- **Persistent Storage**: Bookmarks saved in localStorage
- **Quick Access**: Filter papers by bookmarks only

### File Management
- **PDF Upload**: Secure file upload with validation
- **File Size Limits**: 10MB maximum file size
- **Automatic Naming**: Timestamp-based file naming
- **Download Tracking**: Analytics for paper downloads

## 🔒 Security Features

- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: File type and size validation
- **Authentication**: Secure admin login system
- **CORS Protection**: Cross-origin request security

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Perfect tablet experience
- **Desktop Enhancement**: Enhanced desktop features
- **Touch Gestures**: Mobile-friendly interactions

## 🎯 Performance Optimizations

- **Lazy Loading**: Papers load as needed
- **Image Optimization**: Optimized PDF previews
- **Caching**: Browser caching for better performance
- **Minified Assets**: Optimized CSS and JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NESA Rwanda for the examination paper content
- Font Awesome for the icon library
- Bootstrap for UI components inspiration
- Node.js and Express.js communities

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for NESA Rwanda**