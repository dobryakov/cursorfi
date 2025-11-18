#!/bin/bash

# T123: Test protocol handlers with Cursor IDE port forwarding
# This script tests the protocol handlers by simulating protocol URL calls

set -e

BACKEND_PORT=${CURSORFI_BACKEND_PORT:-3002}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Testing protocol handlers..."
echo "Backend port: $BACKEND_PORT"
echo ""

# Test cursor:// protocol handler
echo "Testing cursor:// protocol handler..."
node "$SCRIPT_DIR/cursor-handler.js" "cursor://file/app/page.tsx:42" || {
  echo "❌ cursor:// handler test failed"
  exit 1
}
echo "✅ cursor:// handler test passed"
echo ""

# Test cursorfi:// protocol handler (file)
echo "Testing cursorfi:// protocol handler (file)..."
node "$SCRIPT_DIR/cursorfi-handler.js" "cursorfi://file/app/page.tsx:42" || {
  echo "❌ cursorfi:// file handler test failed"
  exit 1
}
echo "✅ cursorfi:// file handler test passed"
echo ""

# Test cursorfi:// protocol handler (page)
echo "Testing cursorfi:// protocol handler (page)..."
node "$SCRIPT_DIR/cursorfi-handler.js" "cursorfi://page/app/page.tsx" || {
  echo "❌ cursorfi:// page handler test failed"
  exit 1
}
echo "✅ cursorfi:// page handler test passed"
echo ""

echo "All protocol handler tests passed! ✅"

