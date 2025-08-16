#!/bin/bash

# LaunchBoost Production Deployment Script
# Run this after setting up your environment variables

echo "🚀 LaunchBoost Production Deployment"
echo "===================================="

# Check if required files exist
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "📝 Please copy .env.production.template to .env.production and fill in your values"
    exit 1
fi

echo "✅ Environment file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ Type check failed! Please fix TypeScript errors first."
    exit 1
fi

echo "✅ Type check passed"

# Build for production
echo "🏗️  Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build successful"

# Optional: Run tests if they exist
if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "🧪 Running tests..."
    npm test
fi

echo ""
echo "🎉 Production build complete!"
echo ""
echo "Next steps:"
echo "1. 📤 Push to GitHub: git add . && git commit -m 'Production ready' && git push"
echo "2. 🌐 Deploy to Vercel: Connect your repo at vercel.com"
echo "3. ⚙️  Add environment variables in Vercel dashboard"
echo "4. 🔧 Configure Stripe webhooks to point to your domain"
echo "5. 💰 Start making money!"
echo ""
echo "📖 Full guide: See PRODUCTION-GUIDE.md"
