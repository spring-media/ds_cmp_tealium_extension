#!/bin/bash
# Download TRACKTOR test artifacts from iOS-BILDsolid
# Usage: ./scripts/download-tracktor-artifacts.sh <run-id> [commit-sha]
# Example: ./scripts/download-tracktor-artifacts.sh 1234567890 abc123

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_REPO="spring-media/iOS-BILDsolid"

# Parse arguments
RUN_ID=$1
COMMIT_SHA=${2:-$(git rev-parse --short HEAD)}

if [ -z "$RUN_ID" ]; then
  echo -e "${RED}❌ Error: Run ID is required${NC}"
  echo ""
  echo "Usage: $0 <run-id> [commit-sha]"
  echo ""
  echo "To find the run ID:"
  echo "  gh run list --repo $APP_REPO --workflow=tracktor-tests.yml"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TRACKTOR Artifact Download${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📦 ${YELLOW}Repository:${NC} $APP_REPO"
echo -e "🏃 ${YELLOW}Run ID:${NC} $RUN_ID"
echo -e "📝 ${YELLOW}Commit SHA:${NC} $COMMIT_SHA"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it: https://cli.github.com/"
    exit 1
fi

# Create storage directory
ARTIFACT_DIR="tracktor-artifacts/$COMMIT_SHA"
mkdir -p "$ARTIFACT_DIR"

echo -e "${YELLOW}📥 Downloading artifacts from run $RUN_ID...${NC}"
echo ""

# Download artifacts
gh run download "$RUN_ID" \
  --repo "$APP_REPO" \
  --dir "$ARTIFACT_DIR" \
  || {
    echo ""
    echo -e "${RED}❌ Failed to download artifacts${NC}"
    echo ""
    echo -e "${YELLOW}Possible reasons:${NC}"
    echo "  - Run ID doesn't exist"
    echo "  - No artifacts were uploaded"
    echo "  - Artifacts have expired (check retention period)"
    echo "  - Insufficient permissions (need read access to repository)"
    echo ""
    echo -e "${YELLOW}Check run status:${NC}"
    echo -e "  ${BLUE}gh run view $RUN_ID --repo $APP_REPO${NC}"
    exit 1
  }

echo ""
echo -e "${GREEN}✅ Artifacts downloaded successfully!${NC}"
echo ""
echo -e "📁 Location: ${BLUE}$ARTIFACT_DIR${NC}"
echo ""

# List downloaded files
echo -e "${YELLOW}Downloaded files:${NC}"
find "$ARTIFACT_DIR" -type f | while read file; do
  size=$(du -h "$file" | cut -f1)
  echo -e "  📄 ${file##*/} (${size})"
done
echo ""

# Check for JSONL files
JSONL_COUNT=$(find "$ARTIFACT_DIR" -name "*.jsonl" | wc -l)
echo -e "Found ${GREEN}$JSONL_COUNT${NC} JSONL file(s)"
echo ""

if [ $JSONL_COUNT -gt 0 ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Next steps:${NC}"
  echo ""
  echo -e "1. Validate the artifacts:"
  echo -e "   ${BLUE}node scripts/validate-tracktor-logs.js $ARTIFACT_DIR/*.jsonl${NC}"
  echo ""
  echo -e "2. View a sample:"
  echo -e "   ${BLUE}head -n 5 $ARTIFACT_DIR/*.jsonl | jq .${NC}"
  echo ""
  echo -e "3. Count events:"
  echo -e "   ${BLUE}wc -l $ARTIFACT_DIR/*.jsonl${NC}"
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
  echo -e "${YELLOW}⚠️  No JSONL files found. Check artifact contents:${NC}"
  echo -e "   ${BLUE}ls -la $ARTIFACT_DIR${NC}"
fi
