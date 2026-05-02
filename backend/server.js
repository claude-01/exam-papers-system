const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const papersRoutes = require('./routes/papers');
const publicPapersRoutes = require('./routes/public/papers');
const adminPapersRoutes = require('./routes/admin/papers');
const analyticsRoutes = require('./routes/analytics');
const commentsRoutes = require('./routes/comments');
const { authenticateToken, preventCache } = require('./middleware/auth');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration for local development
const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(uploadsPath));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));

// Apply cache prevention to admin routes
app.use('/api/admin/papers', preventCache);
app.use('/api/analytics', preventCache);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/papers', publicPapersRoutes);  // Public papers routes
app.use('/api/admin/papers', adminPapersRoutes);  // Admin papers routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/comments', commentsRoutes);

// Root route
app.get('/', (req, res) => {
    res.redirect('/public/index.html');
});

// API status
app.get('/api/status', (req, res) => {
    res.json({ 
        success: true,
        status: 'local',
        message: 'NESA Portal API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for API routes - FIXED: removed the /* pattern
app.use((req, res) => {
    // Only handle API routes that weren't matched
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            success: false,
            message: 'API endpoint not found' 
        });
    }
    // For non-API routes, send 404 page
    res.status(404).sendFile(path.join(__dirname, '../frontend/public/404.html'), (err) => {
        if (err) {
            res.status(404).send('404 - Page Not Found');
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 NESA PORTAL SERVER STARTED');
    console.log('=================================');
    console.log(`📡 Port: ${PORT}`);
    console.log(`📍 Public: http://localhost:${PORT}/public/index.html`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin/login.html`);
    console.log(`📊 API: http://localhost:${PORT}/api/status`);
    console.log('=================================\n');
});