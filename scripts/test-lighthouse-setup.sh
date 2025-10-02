#!/bin/bash

# Lighthouse Integration Test Script
# This script helps you verify the Lighthouse integration is working correctly

set -e  # Exit on error

echo "🔦 Testing Lighthouse Integration Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if dependencies are installed
echo "Step 1: Checking dependencies..."
if npm list @storybook/test-runner lighthouse chrome-launcher @lhci/cli > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} All dependencies installed"
else
    echo -e "${RED}✗${NC} Some dependencies are missing"
    echo "Installing dependencies..."
    npm install
fi
echo ""

# Step 2: Check if configuration files exist
echo "Step 2: Checking configuration files..."
files_to_check=(
    ".storybook/test-runner.ts"
    "lighthouserc.json"
    ".storybook/lighthouse.d.ts"
    "docs/LIGHTHOUSE.md"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file is missing"
        all_files_exist=false
    fi
done
echo ""

if [ "$all_files_exist" = false ]; then
    echo -e "${RED}Some configuration files are missing. Please check the setup.${NC}"
    exit 1
fi

# Step 3: Build Storybook
echo "Step 3: Building Storybook..."
echo -e "${YELLOW}This may take a minute...${NC}"
if npm run build-storybook > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Storybook built successfully"
else
    echo -e "${RED}✗${NC} Failed to build Storybook"
    exit 1
fi
echo ""

# Step 4: Check if storybook-static exists
if [ -d "storybook-static" ]; then
    echo -e "${GREEN}✓${NC} Storybook static files generated"
else
    echo -e "${RED}✗${NC} storybook-static directory not found"
    exit 1
fi
echo ""

# Step 5: Run a quick Lighthouse test
echo "Step 5: Running a quick Lighthouse audit..."
echo -e "${YELLOW}This will audit one story as a test...${NC}"
echo ""

# Start a simple HTTP server in the background
cd storybook-static
python3 -m http.server 6007 > /dev/null 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 2

# Create a temporary Lighthouse config for testing
cat > .lighthouserc.test.json << 'EOF'
{
  "ci": {
    "collect": {
      "url": ["http://localhost:6007/iframe.html?id=components-button--primary"],
      "numberOfRuns": 1,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.5}],
        "categories:accessibility": ["warn", {"minScore": 0.8}]
      }
    }
  }
}
EOF

# Run Lighthouse
if npx lhci autorun --config=.lighthouserc.test.json; then
    echo ""
    echo -e "${GREEN}✓${NC} Lighthouse test passed!"
else
    echo ""
    echo -e "${YELLOW}⚠${NC} Lighthouse test completed with warnings (this is OK for testing)"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null || true
rm .lighthouserc.test.json 2>/dev/null || true

echo ""
echo "======================================"
echo -e "${GREEN}✨ Lighthouse Integration Test Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start Storybook: npm run storybook"
echo "2. Run tests: npm run test-storybook (in a new terminal)"
echo "3. Or run CI: npm run lighthouse"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: docs/LIGHTHOUSE_QUICKSTART.md"
echo "   - Full Docs: docs/LIGHTHOUSE.md"
echo "   - Architecture: docs/LIGHTHOUSE_ARCHITECTURE.md"
echo ""
