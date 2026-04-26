#!/bin/bash
echo "🚀 Deploying Exam Papers Management System to Vercel..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/server.js" ]; then
    echo "❌ Error: Please run this from the exam-papers-system directory"
    exit 1
fi

echo "✅ Directory confirmed"
echo ""

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Your project will be available at:"
echo "📱 https://exam-papers-system.vercel.app"
echo "🔧 https://exam-papers-system.vercel.app/api"
echo ""
echo "📋 Next steps:"
echo "1. Set up database in Vercel dashboard"
echo "2. Add environment variables"
echo "3. Redeploy with database connection"
