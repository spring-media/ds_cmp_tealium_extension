#!/bin/bash
# Trigger TRACKTOR E2E Tests in iOS-BILDsolid Repository
# Usage: ./scripts/trigger-tracktor.sh [environment]
# Example: ./scripts/trigger-tracktor.sh stage

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_REPO="spring-media/iOS-BILDsolid"
WORKFLOW_NAME="tracktor-tests.yml"  # Update with actual workflow name

# Get commit SHA
COMMIT_SHA=$(git rev-parse --short HEAD)
FULL_SHA=$(git rev-parse HEAD)
ENVIRONMENT=${1:-stage}
TRIGGERED_BY=${USER:-unknown}

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TRACKTOR E2E Test Trigger${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📦 ${YELLOW}Repository:${NC} $APP_REPO"
echo -e "📝 ${YELLOW}Commit SHA:${NC} $COMMIT_SHA ($FULL_SHA)"
echo -e "🌍 ${YELLOW}Environment:${NC} $ENVIRONMENT"
echo -e "👤 ${YELLOW}Triggered by:${NC} $TRIGGERED_BY"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Please install it: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo "Please run: gh auth login"
    exit 1
fi

echo -e "${YELLOW}🚀 Triggering TRACKTOR tests...${NC}"
echo ""

# Trigger the workflow
# Note: Adjust the workflow name and inputs based on actual iOS-BILDsolid workflow
gh workflow run "$WORKFLOW_NAME" \
  --repo "$APP_REPO" \
  --ref main \
  --field commit_sha="$COMMIT_SHA" \
  --field environment="$ENVIRONMENT" \
  --field triggered_by="$TRIGGERED_BY" \
  --field callback_repo="spring-media/ds_cmp_tealium_extension" \
  || {
    echo ""
    echo -e "${YELLOW}⚠️  Note: If the workflow doesn't exist yet, this is expected.${NC}"
    echo -e "${YELLOW}   The app team needs to add the workflow first (see TRACKTOR_INTEGRATION_SPIKE.md)${NC}"
    echo ""
    echo -e "${YELLOW}   For now, you can manually trigger their existing workflow:${NC}"
    echo -e "   ${BLUE}gh workflow list --repo $APP_REPO${NC}"
    echo -e "   ${BLUE}gh workflow run <workflow-name> --repo $APP_REPO${NC}"
    exit 1
  }

echo ""
echo -e "${GREEN}✅ TRACKTOR tests triggered successfully!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo -e "1. Check workflow status:"
echo -e "   ${BLUE}gh run list --repo $APP_REPO --workflow=$WORKFLOW_NAME${NC}"
echo ""
echo -e "2. Watch the workflow run:"
echo -e "   ${BLUE}gh run watch --repo $APP_REPO${NC}"
echo ""
echo -e "3. View in browser:"
echo -e "   ${BLUE}gh repo view $APP_REPO --web${NC}"
echo ""
echo -e "4. Once complete, download artifacts:"
echo -e "   ${BLUE}./scripts/download-tracktor-artifacts.sh <run-id> $COMMIT_SHA${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
