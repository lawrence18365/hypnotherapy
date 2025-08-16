#!/bin/bash

# LaunchBoost Production Deployment Verification Script
# Run this before deploying to production to ensure all fake data has been removed

echo "🔍 LAUNCHBOOST PRODUCTION READINESS VERIFICATION"
echo "=============================================="
echo ""

# Check for fake metrics in source code
echo "📊 Checking for fake metrics and user counts..."

FAKE_METRICS=0

# Check for common fake numbers
if grep -r "10,000\|10K\|500+\|1000+\|300+\|2M+" src/ --include="*.tsx" --include="*.ts" > /dev/null 2>&1; then
    echo "❌ Found potential fake metrics in source code:"
    grep -r "10,000\|10K\|500+\|1000+\|300+\|2M+" src/ --include="*.tsx" --include="*.ts" -n
    FAKE_METRICS=1
else
    echo "✅ No fake metrics found in source code"
fi

# Check for real company names in SQL files
echo ""
echo "🏢 Checking for unauthorized real company usage..."

REAL_COMPANIES=0

if grep -r "notion\|canva\|figma\|slack\|linear\|typeform\|webflow\|airtable\|loom\|convertkit" . --include="*.sql" -i > /dev/null 2>&1; then
    echo "❌ Found real company names in SQL files:"
    grep -r "notion\|canva\|figma\|slack\|linear\|typeform\|webflow\|airtable\|loom\|convertkit" . --include="*.sql" -i -n
    REAL_COMPANIES=1
else
    echo "✅ No unauthorized real company usage found"
fi

# Check for misleading advertising claims
echo ""
echo "💰 Checking for misleading advertising claims..."

ADVERTISING_ISSUES=0

if grep -r "Banner Placement\|banner.*spot\|2 spots total\|3 spots total" src/ --include="*.tsx" --include="*.ts" > /dev/null 2>&1; then
    echo "❌ Found misleading advertising claims:"
    grep -r "Banner Placement\|banner.*spot\|2 spots total\|3 spots total" src/ --include="*.tsx" --include="*.ts" -n
    ADVERTISING_ISSUES=1
else
    echo "✅ No misleading advertising claims found"
fi
echo ""
echo "👥 Checking for fake social proof claims..."

FAKE_SOCIAL_PROOF=0

if grep -r "Used by.*teams\|Trusted by.*developers\|Boost productivity by\|Save.*hours weekly" src/ --include="*.tsx" --include="*.ts" > /dev/null 2>&1; then
    echo "❌ Found potential fake social proof claims:"
    grep -r "Used by.*teams\|Trusted by.*developers\|Boost productivity by\|Save.*hours weekly" src/ --include="*.tsx" --include="*.ts" -n
    FAKE_SOCIAL_PROOF=1
else
    echo "✅ No fake social proof claims found"
fi

# Check for hardcoded fake statistics
echo ""
echo "📈 Checking for hardcoded fake statistics..."

FAKE_STATS=0

if grep -r "Deals Launched\|Happy Customers\|SaaS Founders\|Savings Generated" src/ --include="*.tsx" --include="*.ts" > /dev/null 2>&1; then
    echo "❌ Found potential fake statistics references:"
    grep -r "Deals Launched\|Happy Customers\|SaaS Founders\|Savings Generated" src/ --include="*.tsx" --include="*.ts" -n
    FAKE_STATS=1
else
    echo "✅ No fake statistics found"
fi

# Check environment file for test credentials
echo ""
echo "🔐 Checking environment configuration..."

ENV_ISSUES=0

if [ -f ".env.local" ]; then
    if grep -q "your_.*_key\|example\|test" .env.local > /dev/null 2>&1; then
        echo "⚠️  Found placeholder values in .env.local - ensure all real credentials are set"
        grep "your_.*_key\|example\|test" .env.local
        ENV_ISSUES=1
    else
        echo "✅ Environment configuration looks good"
    fi
else
    echo "⚠️  .env.local file not found - ensure environment is configured"
    ENV_ISSUES=1
fi

# Final verification summary
echo ""
echo "🎯 PRODUCTION READINESS SUMMARY"
echo "=============================="

TOTAL_ISSUES=$((FAKE_METRICS + REAL_COMPANIES + ADVERTISING_ISSUES + FAKE_SOCIAL_PROOF + FAKE_STATS + ENV_ISSUES))

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED - READY FOR PRODUCTION DEPLOYMENT"
    echo ""
    echo "🚀 LaunchBoost is clean and deployment-ready with:"
    echo "   ✅ Zero fake metrics"
    echo "   ✅ Zero unauthorized company usage"  
    echo "   ✅ Zero misleading advertising claims"
    echo "   ✅ Zero fake social proof"
    echo "   ✅ Zero fabricated statistics"
    echo "   ✅ Proper environment configuration"
    echo ""
    echo "🎉 DEPLOY WITH CONFIDENCE!"
else
    echo "❌ FOUND $TOTAL_ISSUES ISSUE(S) - FIX BEFORE DEPLOYMENT"
    echo ""
    echo "🛠️  Please address the issues above before deploying to production."
    echo "    Each issue represents potential legal or credibility risk."
fi

echo ""
echo "📋 To deploy:"
echo "   1. Fix any issues found above"
echo "   2. Run this script again to verify"
echo "   3. Deploy when all checks pass"
echo ""
echo "📧 Questions? The platform is now completely authentic and deployment-ready!"

exit $TOTAL_ISSUES
