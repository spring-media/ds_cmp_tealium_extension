# TRACKTOR E2E Test Integration - Spike Report

**Date:** June 2, 2026  
**Author:** DS Tracking Team  
**Ticket:** Investigate: Using BILD APP TRACKTOR for e2e Testing [2 d]

---

## Executive Summary

This spike investigates how to integrate BILD APP TRACKTOR e2e test results into the DS tracking team's workflow to validate tracking changes before deployment. The goal is to create a defensive testing strategy that proves tracking implementations work correctly and provides artifacts for troubleshooting.

---

## Current State Analysis

### 1. TRACKTOR Test Artifact Structure

**Location:** `/Users/lsugak/Downloads/e2e-tracking-logs-BILDNews-4/`

**Format:** JSONL (JSON Lines) - each line is a complete JSON object representing a tracking event

**Sample Event Structure:**
```json
{
  "timestamp": 1770370997.319299,
  "params": {
    "page_name": "stage : E4omaNFMoJCkYzeQ94SG",
    "page_document_type": "home",
    "user_is_logged_in": "false",
    "tracking_id": "F63B24A2-6B29-4AE1-8DD9-DDA8B8F75A91",
    "event_type": "view",
    // ... additional tracking parameters
  },
  "vendor": {"tealium": {}},
  "name": "home",
  "type": "view"
}
```

**Test Coverage (Current):**
- ✅ Home PV (Page View)
- ✅ Article PV
- ✅ Navigation flows (back navigation, refresh)
- ✅ Media Events (ready, play, pause, finished, time changed, replay)
- 🔄 Order events (checkout success) - upcoming

### 2. Existing Infrastructure

**Your Repository (ds_cmp_tealium_extension):**
- Manages Tealium extensions via GitHub
- CI/CD with GitHub Actions
- Already triggers Cerberus e2e tests via `repository-dispatch`
- Deployment pipeline to Tealium on master branch
- Unit tests with Jest
- Node 24, TypeScript, yarn

**App Team Repository (iOS-BILDsolid):**
- Runs TRACKTOR tests biweekly before releases
- On-demand pipeline execution
- GitHub Actions workflows
- Stores test artifacts (limited retention period)

**Workflow Interaction:**
```
[Your Repo: ds_cmp_tealium_extension]
           |
           | (repository-dispatch)
           v
[Cerberus Repo: ds_cerberus_playwright]
           |
           v
    [E2E Web Tests]
```

---

## Problem Statement

### Core Challenges

1. **Validation Gap:** When you make tracking changes (extensions, tags, etc.), there's no automated way to verify they work correctly in the mobile apps before deployment

2. **Cross-Team Dependencies:** App team owns TRACKTOR tests; tracking team needs access to results

3. **Artifact Retention:** Test artifacts have limited retention (~1 week), but you need longer-term storage for troubleshooting

4. **Triggering Mechanism:** No current way to trigger TRACKTOR tests from your repository

5. **Proof of Correctness:** Need evidence to defend against false tracking bug reports

---

## Proposed Solutions

### **Solution 1: Repository Dispatch Pattern (Recommended)**

**Similar to your existing Cerberus integration**

#### Architecture:
```
[ds_cmp_tealium_extension] 
    |
    | POST /repos/iOS-BILDsolid/dispatches
    | (via GitHub API with repository-dispatch event)
    |
    v
[iOS-BILDsolid GitHub Actions]
    |
    | Run TRACKTOR e2e tests
    |
    v
[Upload artifacts to your repo or shared storage]
```

#### Implementation Steps:

**A. In iOS-BILDsolid (requires app team collaboration):**

Add a `repository_dispatch` trigger to their workflow:

```yaml
# .github/workflows/tracktor-tests.yml
name: TRACKTOR E2E Tests

on:
  repository_dispatch:
    types: [run-tracktor-from-tracking-team]
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 8 * * 1,4'  # Biweekly: Monday & Thursday at 8 AM

jobs:
  run-tracktor-tests:
    runs-on: macos-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Run TRACKTOR Tests
        run: |
          # Their existing test execution
          
      - name: Upload artifacts to tracking team
        if: github.event.action == 'run-tracktor-from-tracking-team'
        uses: actions/upload-artifact@v3
        with:
          name: tracktor-logs-${{ github.event.client_payload.commit_sha }}
          path: test-results/**/*.jsonl
          retention-days: 90  # Extended retention
          
      - name: Notify tracking team
        if: github.event.action == 'run-tracktor-from-tracking-team'
        uses: peter-evans/repository-dispatch@v3
        with:
          repository: spring-media/ds_cmp_tealium_extension
          token: ${{ secrets.TRACKING_TEAM_ACCESS_TOKEN }}
          event-type: tracktor-results-ready
          client-payload: |
            {
              "run_id": "${{ github.run_id }}",
              "commit_sha": "${{ github.event.client_payload.commit_sha }}",
              "status": "${{ job.status }}",
              "artifact_url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
```

**B. In ds_cmp_tealium_extension:**

Create a new workflow to trigger TRACKTOR:

```yaml
# .github/workflows/trigger_tracktor_tests.yml
name: Trigger TRACKTOR E2E Tests

on:
  workflow_dispatch:  # Manual trigger for testing changes
    inputs:
      test_environment:
        description: 'Test environment (dev/qa/stage)'
        required: true
        default: 'stage'
        type: choice
        options:
          - dev
          - qa
          - stage
  push:
    branches:
      - master  # After deployment, validate in production
    paths:
      - 'extensions/doPlugins/doPlugins_bild_apps.js'
      - 'extensions/**bild**'  # Any BILD-related changes

jobs:
  trigger-tracktor:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Trigger TRACKTOR Tests in App Repo
        uses: peter-evans/repository-dispatch@v3
        with:
          repository: spring-media/iOS-BILDsolid
          token: ${{ secrets.IOS_BILDSOLID_ACCESS_TOKEN }}
          event-type: run-tracktor-from-tracking-team
          client-payload: |
            {
              "commit_sha": "${{ github.sha }}",
              "triggered_by": "${{ github.actor }}",
              "environment": "${{ github.event.inputs.test_environment || 'stage' }}",
              "callback_repo": "spring-media/ds_cmp_tealium_extension"
            }
      
      - name: Wait for test completion
        run: |
          echo "TRACKTOR tests triggered. Check iOS-BILDsolid actions for results."
          echo "Artifacts will be available at: https://github.com/spring-media/iOS-BILDsolid/actions"
```

**C. Receive results (optional automated validation):**

```yaml
# .github/workflows/validate_tracktor_results.yml
name: Validate TRACKTOR Results

on:
  repository_dispatch:
    types: [tracktor-results-ready]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        run: |
          # Use GitHub API to download artifacts
          gh run download ${{ github.event.client_payload.run_id }} \
            --repo spring-media/iOS-BILDsolid \
            --name tracktor-logs-${{ github.event.client_payload.commit_sha }}
        env:
          GH_TOKEN: ${{ secrets.IOS_BILDSOLID_ACCESS_TOKEN }}
          
      - name: Validate tracking events
        run: |
          # Add validation script here
          node scripts/validate-tracktor-logs.js
          
      - name: Store artifacts in long-term storage
        uses: actions/upload-artifact@v3
        with:
          name: validated-tracktor-${{ github.event.client_payload.commit_sha }}
          path: ./*.jsonl
          retention-days: 90
```

#### Pros:
- ✅ Follows your existing pattern (Cerberus integration)
- ✅ Automated triggering from your repo
- ✅ Can extend artifact retention
- ✅ Event-driven architecture
- ✅ Clear separation of concerns

#### Cons:
- ⚠️ Requires app team to modify their workflows
- ⚠️ Needs cross-repo access tokens
- ⚠️ Coordination effort required

---

### **Solution 2: GitHub CLI Manual Trigger with Artifact Storage**

**Lower integration effort, more manual process**

#### Implementation:

**A. Create trigger script:**

```bash
#!/bin/bash
# scripts/trigger-tracktor.sh

COMMIT_SHA=$(git rev-parse --short HEAD)
ENVIRONMENT=${1:-stage}

echo "Triggering TRACKTOR tests for commit $COMMIT_SHA on $ENVIRONMENT"

gh workflow run tracktor-tests.yml \
  --repo spring-media/iOS-BILDsolid \
  --ref main \
  --field commit_sha="$COMMIT_SHA" \
  --field environment="$ENVIRONMENT" \
  --field triggered_by="${GITHUB_ACTOR:-manual}"

echo "✅ TRACKTOR tests triggered!"
echo "Check status: gh run list --repo spring-media/iOS-BILDsolid --workflow=tracktor-tests.yml"
```

**B. Download and store artifacts:**

```bash
#!/bin/bash
# scripts/download-tracktor-artifacts.sh

RUN_ID=$1
COMMIT_SHA=$2

if [ -z "$RUN_ID" ] || [ -z "$COMMIT_SHA" ]; then
  echo "Usage: $0 <run_id> <commit_sha>"
  exit 1
fi

# Create storage directory
ARTIFACT_DIR="tracktor-artifacts/$COMMIT_SHA"
mkdir -p "$ARTIFACT_DIR"

# Download from app repo
gh run download "$RUN_ID" \
  --repo spring-media/iOS-BILDsolid \
  --dir "$ARTIFACT_DIR"

echo "✅ Artifacts downloaded to $ARTIFACT_DIR"

# Optional: Upload to your own GitHub repo
gh workflow run store-artifacts.yml \
  --field commit_sha="$COMMIT_SHA" \
  --field artifact_path="$ARTIFACT_DIR"
```

**C. Add to your repository:**

```yaml
# .github/workflows/store_tracktor_artifacts.yml
name: Store TRACKTOR Artifacts

on:
  workflow_dispatch:
    inputs:
      commit_sha:
        description: 'Commit SHA'
        required: true
      artifact_path:
        description: 'Path to artifacts'
        required: true

jobs:
  store:
    runs-on: ubuntu-latest
    steps:
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: tracktor-${{ github.event.inputs.commit_sha }}
          path: ${{ github.event.inputs.artifact_path }}/**/*.jsonl
          retention-days: 90
```

#### Pros:
- ✅ Minimal changes to app team workflows
- ✅ Quick to implement
- ✅ Full control over when tests run

#### Cons:
- ⚠️ Manual process
- ⚠️ Not integrated into CI/CD pipeline
- ⚠️ Easy to forget to run

---

### **Solution 3: Centralized Artifact Storage (AWS S3 / Azure Blob)**

**Enterprise-grade solution with long-term retention**

#### Architecture:
```
[iOS-BILDsolid TRACKTOR Tests]
    |
    | Upload to S3 bucket
    v
[AWS S3: tracking-test-artifacts/]
    ├── 2026-06-02/commit-abc123/
    ├── 2026-06-03/commit-def456/
    └── ...
    |
    | Access via AWS CLI / SDK
    v
[ds_cmp_tealium_extension validation scripts]
```

#### Implementation:

**A. App team uploads to S3:**

```yaml
# In iOS-BILDsolid workflow
- name: Upload to S3
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: |
    aws s3 cp test-results/ \
      s3://spring-media-tracking-artifacts/tracktor/$(date +%Y-%m-%d)/${GITHUB_SHA}/ \
      --recursive \
      --include "*.jsonl"
```

**B. Your team accesses from S3:**

```bash
#!/bin/bash
# scripts/fetch-tracktor-artifacts.sh

DATE=${1:-$(date +%Y-%m-%d)}
COMMIT_SHA=${2:-latest}

aws s3 cp \
  s3://spring-media-tracking-artifacts/tracktor/$DATE/$COMMIT_SHA/ \
  ./tracktor-artifacts/ \
  --recursive

echo "✅ Artifacts downloaded"
```

**C. Add S3 lifecycle policy for retention:**

```json
{
  "Rules": [
    {
      "Id": "DeleteAfter90Days",
      "Status": "Enabled",
      "Expiration": {
        "Days": 90
      }
    },
    {
      "Id": "TransitionToGlacier",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

#### Pros:
- ✅ Centralized storage
- ✅ Long-term retention with lifecycle policies
- ✅ Independent of GitHub artifact limits
- ✅ Can be accessed by multiple teams
- ✅ Cost-effective (S3 pricing)

#### Cons:
- ⚠️ Requires AWS infrastructure
- ⚠️ Additional complexity
- ⚠️ Cost (though minimal for logs)
- ⚠️ Need IAM permissions setup

---

### **Solution 4: Artifact Validation Service (Advanced)**

**Build a microservice to validate and store artifacts**

#### Architecture:
```
[TRACKTOR Tests] 
    |
    | POST /api/artifacts/upload
    v
[Validation Service]
    ├── Validate events against schema
    ├── Compare with expected events
    ├── Store in database
    └── Generate reports
    |
    v
[Dashboard: tracking-validation.spring-media.com]
```

#### Benefits:
- Real-time validation
- Historical tracking
- Visual dashboard
- API access for troubleshooting

#### Effort:
- High (requires service development)
- Recommended for future iteration

---

## Recommended Implementation Plan

### **Phase 1: Quick Win (Week 1-2)**

**Use Solution 2 (Manual trigger) for immediate needs:**

1. ✅ Create trigger script in your repo
2. ✅ Document process for team
3. ✅ Test on-demand triggering
4. ✅ Manually download and store artifacts
5. ✅ Create validation checklist document

**Deliverables:**
- Script: `scripts/trigger-tracktor.sh`
- Script: `scripts/download-tracktor-artifacts.sh`
- Documentation: `docs/TRACKTOR_TESTING_GUIDE.md`
- Validation checklist template

### **Phase 2: Automation (Week 3-4)**

**Implement Solution 1 (Repository Dispatch):**

1. ✅ Meet with app team (Peter Tran, Andriy Martynenko, Uday Gowda)
2. ✅ Agree on workflow integration approach
3. ✅ App team adds `repository_dispatch` trigger
4. ✅ Implement automated triggering from your repo
5. ✅ Test end-to-end flow
6. ✅ Extend artifact retention to 90 days

**Deliverables:**
- GitHub Actions workflow: `trigger_tracktor_tests.yml`
- GitHub Actions workflow: `validate_tracktor_results.yml`
- Updated documentation

### **Phase 3: Enhanced Storage (Month 2)**

**Implement Solution 3 (S3 Storage):**

1. ✅ Provision S3 bucket with lifecycle policies
2. ✅ Setup IAM roles and permissions
3. ✅ Update workflows to use S3
4. ✅ Create retrieval scripts
5. ✅ Monitor costs and usage

**Deliverables:**
- S3 bucket configuration
- Updated workflows
- Cost monitoring dashboard

---

## Artifact Management Strategy

### **Retention Policy (Recommended)**

| Timeframe | Storage Location | Purpose |
|-----------|------------------|---------|
| 0-7 days | GitHub Actions | Recent tests, quick access |
| 7-30 days | GitHub Actions (extended) | Active development cycle |
| 30-90 days | S3 Standard | Troubleshooting window |
| 90+ days | S3 Glacier (optional) | Compliance/audit trail |

### **Storage Size Estimates**

Based on sample artifact (4 events = ~2.5KB):

- **Per test run:** ~50-100 KB (20-40 events)
- **Per day:** ~500 KB (10 runs)
- **Per month:** ~15 MB
- **Annual:** ~180 MB

**Cost:** Negligible (~$0.01/month on S3)

---

## Validation Strategy

### **Automated Validation Script**

Create `scripts/validate-tracktor-logs.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Expected events configuration
const EXPECTED_EVENTS = {
  'home_pv': {
    type: 'view',
    required_params: ['page_name', 'page_document_type', 'tracking_id']
  },
  'article_pv': {
    type: 'view',
    required_params: ['page_name', 'assetid', 'page_headline']
  },
  // ... more event definitions
};

function validateArtifact(jsonlFile) {
  const lines = fs.readFileSync(jsonlFile, 'utf-8').split('\n').filter(Boolean);
  const events = lines.map(line => JSON.parse(line));
  
  const results = {
    total: events.length,
    validated: 0,
    errors: []
  };
  
  events.forEach((event, index) => {
    // Validate event structure
    if (!event.type || !event.params) {
      results.errors.push(`Event ${index}: Missing required fields`);
      return;
    }
    
    // Validate against expected schema
    const expectedEvent = EXPECTED_EVENTS[event.name];
    if (expectedEvent) {
      expectedEvent.required_params.forEach(param => {
        if (!(param in event.params)) {
          results.errors.push(`Event ${index} (${event.name}): Missing param '${param}'`);
        }
      });
    }
    
    results.validated++;
  });
  
  return results;
}

// Run validation
const artifactPath = process.argv[2];
if (!artifactPath) {
  console.error('Usage: node validate-tracktor-logs.js <path-to-jsonl>');
  process.exit(1);
}

const results = validateArtifact(artifactPath);
console.log('Validation Results:', results);

if (results.errors.length > 0) {
  console.error('❌ Validation failed');
  process.exit(1);
} else {
  console.log('✅ All events validated successfully');
}
```

### **Manual Validation Checklist**

Create a checklist for manual review:

- [ ] All expected events are present
- [ ] Required parameters are populated
- [ ] Tracking IDs are unique
- [ ] Event sequence is correct
- [ ] No unexpected events
- [ ] Parameter values match expectations

---

## Additional Use Cases for Artifacts

### **1. Regression Testing**

- Store baseline artifacts for each release
- Compare new test runs against baseline
- Detect unexpected tracking changes

### **2. Performance Monitoring**

- Track event timing (using timestamps)
- Identify slow tracking calls
- Optimize tracking implementation

### **3. Documentation & Training**

- Use real artifacts as examples
- Document expected event flows
- Train new team members

### **4. Stakeholder Communication**

- Generate reports showing tracking health
- Provide evidence of correct implementation
- Quick response to tracking issues

### **5. Cross-Team Collaboration**

- Share artifacts with app team for debugging
- Provide analytics team with test data
- Coordinate with data engineering on schema changes

### **6. Schema Validation**

- Validate against Tealium data layer schema
- Catch breaking changes early
- Ensure data quality

---

## Meeting Preparation

### **Key Discussion Topics for Team Meeting**

1. **Priority:** Which solution to implement first?
2. **Resources:** Who will work on this? Time allocation?
3. **App Team Coordination:** Schedule meeting with Peter Tran and team
4. **Access:** What permissions/tokens are needed?
5. **Storage:** GitHub artifacts vs. S3 vs. other?
6. **Retention:** How long to keep artifacts?
7. **Validation:** Automated vs. manual validation?
8. **Alerting:** How to notify team of test failures?
9. **Integration:** How to incorporate into existing deployment pipeline?
10. **Success Metrics:** How to measure if this is working?

### **Questions for App Team Meeting**

1. Can we trigger your TRACKTOR tests via `repository_dispatch`?
2. What's the expected duration of test runs?
3. Can we extend artifact retention in your repo?
4. Would you be open to uploading artifacts to shared storage (S3)?
5. What's your release schedule? How can we align testing?
6. Who should we contact for issues?
7. Can we get read access to your workflow artifacts?
8. What test environments are available?

---

## Technical Requirements

### **Prerequisites:**

1. **GitHub Personal Access Tokens:**
   - `IOS_BILDSOLID_ACCESS_TOKEN` - to trigger workflows
   - Scopes: `repo`, `workflow`

2. **Repository Permissions:**
   - Read access to iOS-BILDsolid artifacts
   - Write access to trigger workflows

3. **Infrastructure (Phase 3):**
   - AWS account with S3 access
   - IAM roles configured
   - Costs approved

### **Dependencies:**

- Node.js 24 (already installed)
- GitHub CLI (`gh`) - for manual triggers
- AWS CLI (Phase 3)
- TypeScript/JavaScript for validation scripts

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| App team doesn't agree to integration | High | Start with manual triggers (Solution 2) |
| TRACKTOR tests are slow | Medium | Run on-demand, not for every commit |
| Artifacts too large | Low | Compress artifacts, use S3 lifecycle |
| Cross-repo permissions issues | Medium | Work with DevOps for proper setup |
| Tests fail frequently | Medium | Establish baseline, iterate on stability |
| Storage costs | Low | Monitor usage, set limits |

---

## Success Criteria

This integration is successful if:

1. ✅ Tracking team can trigger TRACKTOR tests on-demand
2. ✅ Test artifacts are accessible within 24 hours
3. ✅ Artifacts are retained for at least 30 days
4. ✅ 80%+ of tracking changes are validated before deployment
5. ✅ Time to resolve tracking issues reduced by 50%
6. ✅ Zero false accusations of tracking team errors
7. ✅ Clear documentation and runbooks available

---

## Next Steps

### **Immediate Actions:**

1. **This Week:**
   - [ ] Share this spike report with team
   - [ ] Schedule team meeting to discuss approach
   - [ ] Schedule meeting with app team (Peter, Andriy, Uday)
   - [ ] Request GitHub PAT with workflow permissions
   - [ ] Create `scripts/` directory in repo
   - [ ] Implement trigger script (Solution 2)

2. **Next Week:**
   - [ ] Test manual triggering
   - [ ] Download sample artifacts
   - [ ] Create validation script
   - [ ] Document process

3. **Following Sprints:**
   - [ ] Implement automated solution (Solution 1)
   - [ ] Integrate into deployment pipeline
   - [ ] Setup monitoring and alerts
   - [ ] Evaluate S3 storage needs

---

## Questions Answered

### **Q: Do you have other ideas how to use artifacts?**

**A:** Yes! Beyond validation, artifacts can be used for:
- **Regression testing** - detect unexpected changes
- **Performance monitoring** - identify slow tracking
- **Documentation** - real examples for training
- **Proactive debugging** - catch issues before production
- **Cross-team collaboration** - shared test data
- **Analytics validation** - ensure data quality
- **Compliance** - audit trail of tracking behavior

### **Q: How can I trigger e2e TRACKTOR tests from my repo and test my changes?**

**A:** Three approaches:

1. **Manual (Quick):** Use GitHub CLI to trigger their workflow
   ```bash
   gh workflow run tracktor-tests.yml --repo spring-media/iOS-BILDsolid
   ```

2. **Automated (Recommended):** Use `repository_dispatch` pattern (requires app team coordination)
   - Your workflow triggers their workflow via API
   - Similar to your existing Cerberus integration

3. **Scheduled:** Coordinate with app team to run tests after your deployments

### **Q: Is it smart to store artifacts for a month, or suggest something better?**

**A:** Tiered storage strategy is smarter:

- **GitHub Actions:** 7-30 days (hot storage, quick access)
- **S3 Standard:** 30-90 days (warm storage, troubleshooting window)
- **S3 Glacier:** 90+ days (cold storage, compliance/audit)

**Rationale:**
- Most issues are caught within 7 days
- Troubleshooting window needs 30-90 days
- Long-term retention is cheap on S3 Glacier
- Costs are minimal (~$0.50/year for this volume)

**Recommendation:** Start with 30-day GitHub retention, expand to S3 if needed

### **Q: Need access to artifacts in case of trouble - how to defend our team?**

**A:** Defense strategy:

1. **Proactive Testing:**
   - Run TRACKTOR tests before each release
   - Store baseline artifacts
   - Validate changes against baseline

2. **Evidence Collection:**
   - Tag artifacts with deployment SHA
   - Link artifacts to Tealium profile versions
   - Document what was tested and when

3. **Quick Response:**
   - When issue reported, check artifact from that timeframe
   - Show test passed for your changes
   - Identify if issue is app-side or tracking-side

4. **Automation:**
   - Create validation dashboard
   - Automated reports showing test status
   - Alerts when tests fail

**Example Response to Stakeholder:**
> "We ran TRACKTOR validation on [date] for commit [SHA]. All 25 tracking events passed validation. See artifact: [link]. The issue reported is not related to our tracking changes."

---

## Conclusion

**Recommended Path Forward:**

1. **Start Simple:** Implement manual trigger script (1 week)
2. **Automate:** Add repository dispatch integration (2-3 weeks, requires app team)
3. **Enhance:** Add S3 storage if needed (1 week)
4. **Optimize:** Build validation service (future)

**Key Success Factors:**
- Strong collaboration with app team
- Clear documentation
- Automated validation
- Proper artifact retention
- Team buy-in and usage

**Estimated Effort:**
- **Phase 1 (Manual):** 2-3 days
- **Phase 2 (Automated):** 1-2 weeks
- **Phase 3 (Enhanced):** 1 week

**ROI:**
- Reduced troubleshooting time
- Faster issue resolution
- Better team relationships
- Fewer production issues
- Clear accountability

---

## Appendix

### **Resources:**

- [GitHub Repository Dispatch Documentation](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch)
- [GitHub Artifacts Documentation](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [AWS S3 Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- Your existing Cerberus integration: `.github/workflows/trigger_cerberus_workflow.yml`

### **Contacts:**

- **BILD APP Team:**
  - Peter Tran (PO)
  - Andriy Martynenko (TRACKTOR Dev)
  - Uday Gowda (TRACKTOR Dev)

- **Tracking Team:**
  - (Your team members)

### **Related Tickets:**

- Current ticket: Investigate: Using BILD APP TRACKTOR for e2e Testing [2 d]
- Future tickets: (To be created based on team meeting)

---

**Document Status:** ✅ Ready for Review  
**Last Updated:** June 2, 2026  
**Next Review:** After team meeting
