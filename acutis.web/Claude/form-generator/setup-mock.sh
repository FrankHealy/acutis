#!/bin/bash

# Mock Data Setup Script
# Run this to set up mock data layer in your project

echo "🚀 Setting up Mock Data Layer..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Run this script from your project root."
  exit 1
fi

# Create dat/mock directory
echo "📁 Creating dat/mock directory..."
mkdir -p dat/mock

# Check if design system package is available
if [ ! -d "acutis-design-system" ]; then
  echo "❌ Error: acutis-design-system directory not found"
  echo "   Please extract the design system package first"
  exit 1
fi

# Copy mock data files
echo "📋 Copying mock data JSON files..."
if [ -d "acutis-design-system/dat/mock" ]; then
  cp acutis-design-system/dat/mock/*.json dat/mock/
  echo "   ✓ Copied: admissions.json"
  echo "   ✓ Copied: sessions.json"
  echo "   ✓ Copied: activity.json"
else
  echo "❌ Error: Mock data files not found in design system package"
  exit 1
fi

# Create src/lib directory if it doesn't exist
echo "📁 Creating src/lib directory..."
mkdir -p src/lib

# Copy mock service
echo "📝 Copying mockDataService.ts..."
if [ -f "acutis-design-system/mockDataService.ts" ]; then
  cp acutis-design-system/mockDataService.ts src/lib/
  echo "   ✓ Copied to src/lib/mockDataService.ts"
else
  echo "❌ Error: mockDataService.ts not found in design system package"
  exit 1
fi

# Create API routes directory structure
echo "📁 Creating API routes structure..."
mkdir -p app/api/admissions/stats
mkdir -p app/api/admissions/activity
mkdir -p app/api/admissions/\[id\]/start
mkdir -p app/api/admissions/\[id\]/sessions/\[sessionId\]
mkdir -p app/api/admissions/\[id\]/complete

# Copy API route templates
echo "📝 Copying API route templates..."
if [ -d "acutis-design-system/api-routes" ]; then
  # Note: You'll need to manually organize these into the correct directories
  echo "   ⚠️  API route templates are in acutis-design-system/api-routes/"
  echo "   ⚠️  You'll need to organize them into your app/api structure"
else
  echo "   ⚠️  API route templates not found, you'll need to create them manually"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "📝 Creating .env.local..."
  cat > .env.local << EOF
# Mock Data Mode
# Set to 'true' to use mock data, 'false' to use real backend
NEXT_PUBLIC_USE_MOCK_DATA=true

# Backend API (used when mock mode is false)
BACKEND_API_URL=https://your-backend.azurewebsites.net
SERVICE_ACCOUNT_TOKEN=your-token-here
EOF
  echo "   ✓ Created .env.local with mock mode enabled"
else
  echo "   ⚠️  .env.local already exists, please add manually:"
  echo "      NEXT_PUBLIC_USE_MOCK_DATA=true"
fi

# Add to .gitignore if not already there
if [ -f ".gitignore" ]; then
  if ! grep -q "dat/mock" .gitignore; then
    echo "" >> .gitignore
    echo "# Mock data (optional - remove if you want to commit test data)" >> .gitignore
    echo "dat/mock/*.json" >> .gitignore
    echo "   ✓ Added dat/mock/*.json to .gitignore"
  fi
fi

echo ""
echo "✅ Mock data layer setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Review MOCK_DATA_GUIDE.md for detailed usage"
echo "   2. Customize mock data in dat/mock/*.json"
echo "   3. Set up API routes from acutis-design-system/api-routes/"
echo "   4. Restart your Next.js dev server"
echo "   5. Visit /detox/admissions to test"
echo ""
echo "🔧 To toggle between mock and real API:"
echo "   Mock:  NEXT_PUBLIC_USE_MOCK_DATA=true"
echo "   Real:  NEXT_PUBLIC_USE_MOCK_DATA=false"
echo ""
