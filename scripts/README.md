# TRACKTOR Integration Scripts

This directory contains scripts for integrating BILD APP TRACKTOR e2e test results into the tracking team workflow.

## Scripts Overview

### 1. `trigger-tracktor.sh`
Triggers TRACKTOR e2e tests in the iOS-BILDsolid repository.

**Usage:**
```bash
./scripts/trigger-tracktor.sh [environment]
```

**Examples:**
```bash
# Trigger tests for stage environment (default)
./scripts/trigger-tracktor.sh

# Trigger tests for specific environment
./scripts/trigger-tracktor.sh qa
./scripts/trigger-tracktor.sh prod
```

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Access token with `workflow` and `repo` permissions for iOS-BILDsolid

**What it does:**
1. Gets current commit SHA
2. Triggers TRACKTOR workflow in iOS-BILDsolid via GitHub API
3. Provides instructions for monitoring the test run

---

### 2. `download-tracktor-artifacts.sh`
Downloads TRACKTOR test artifacts from a completed test run.

**Usage:**
```bash
./scripts/download-tracktor-artifacts.sh <run-id> [commit-sha]
```

**Examples:**
```bash
# Find the run ID first
gh run list --repo spring-media/iOS-BILDsolid --workflow=tracktor-tests.yml

# Download artifacts
./scripts/download-tracktor-artifacts.sh 1234567890 abc123
```

**What it does:**
1. Downloads all artifacts from the specified GitHub Actions run
2. Stores them in `tracktor-artifacts/<commit-sha>/`
3. Provides summary of downloaded files
4. Suggests next steps for validation

**Output:**
- Artifacts saved to: `tracktor-artifacts/<commit-sha>/`

---

### 3. `validate-tracktor-logs.js`
Validates TRACKTOR test artifacts against expected schemas.

**Usage:**
```bash
node scripts/validate-tracktor-logs.js <path-to-artifact-file>
```

**Examples:**
```bash
# Validate a specific artifact
node scripts/validate-tracktor-logs.js tracktor-artifacts/abc123/tracked_entries.jsonl

# Validate downloaded artifacts
node scripts/validate-tracktor-logs.js tracktor-artifacts/*/tracked_entries.jsonl
```

**What it validates:**
- ✅ Event structure (type, name, params, timestamp, vendor)
- ✅ Required parameters for known event types
- ✅ Tracking ID uniqueness
- ✅ Event timing and sequence
- ✅ Vendor data presence

**Output:**
- Detailed validation report with statistics
- Errors and warnings
- Event type breakdown
- Pass/fail status

**Sample Output:**
```
════════════════════════════════════════════════════════════
  TRACKTOR Validation Report
════════════════════════════════════════════════════════════

📄 File: tracked_entries.jsonl
📊 Total Events: 4

📈 Statistics:
  View Events: 3
  Link/Action Events: 1
  Unique Tracking IDs: 3
  Time Range: 2026-02-06T09:43:15.119Z → 2026-02-06T09:43:20.971Z
  Duration: 5.85s

📋 Event Types:
  home: 2
  article: 1
  remote_config_fetched: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Validation PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Complete Workflow

### Step 1: Trigger Tests
```bash
# Trigger TRACKTOR tests for your changes
./scripts/trigger-tracktor.sh stage
```

### Step 2: Monitor Test Execution
```bash
# Check status
gh run list --repo spring-media/iOS-BILDsolid --workflow=tracktor-tests.yml

# Watch in real-time
gh run watch --repo spring-media/iOS-BILDsolid

# Or view in browser
gh repo view spring-media/iOS-BILDsolid --web
```

### Step 3: Download Artifacts
```bash
# Get the run ID from previous step
RUN_ID=1234567890
COMMIT_SHA=$(git rev-parse --short HEAD)

# Download artifacts
./scripts/download-tracktor-artifacts.sh $RUN_ID $COMMIT_SHA
```

### Step 4: Validate Results
```bash
# Validate the artifacts
node scripts/validate-tracktor-logs.js tracktor-artifacts/$COMMIT_SHA/tracked_entries.jsonl
```

### Step 5: Review & Act
- ✅ If validation passes → Safe to deploy
- ❌ If validation fails → Review errors, fix issues, repeat

---

## Configuration

### Expected Event Schemas

The validator checks against these event schemas (defined in `validate-tracktor-logs.js`):

```javascript
EXPECTED_EVENTS = {
  'remote_config_fetched': {
    type: 'event',
    required_params: ['event_name', 'event_action', 'event_type', 'event_label']
  },
  'home': {
    type: 'view',
    required_params: ['page_name', 'page_document_type', 'page_channel1', 'tracking_id']
  },
  'article': {
    type: 'view',
    required_params: ['page_name', 'assetid', 'page_headline', 'page_document_type', 'tracking_id']
  }
  // ... add more as needed
}
```

**To add new event types:**
1. Edit `scripts/validate-tracktor-logs.js`
2. Add new event definition to `EXPECTED_EVENTS`
3. Test with sample artifact

### Validation Rules

```javascript
VALIDATION_RULES = {
  tracking_id_unique: true,              // Each event should have unique tracking_id
  required_vendors: ['tealium'],         // Required vendor data
  max_event_gap_seconds: 60,            // Max time between events
  min_events: 1                          // Minimum number of events
}
```

---

## Troubleshooting

### "GitHub CLI (gh) is not installed"
```bash
# Install via Homebrew (macOS)
brew install gh

# Or download from: https://cli.github.com/
```

### "Not authenticated with GitHub CLI"
```bash
gh auth login
# Follow the prompts to authenticate
```

### "Workflow not found"
The iOS-BILDsolid team may not have added the `repository_dispatch` trigger yet. This is expected during Phase 1. You can:
1. Contact the app team to add the trigger
2. Or manually trigger their existing workflow:
   ```bash
   gh workflow list --repo spring-media/iOS-BILDsolid
   gh workflow run <their-workflow-name> --repo spring-media/iOS-BILDsolid
   ```

### "Failed to download artifacts"
Possible causes:
- Run ID doesn't exist or is incorrect
- No artifacts were uploaded in that run
- Artifacts have expired (check retention period)
- Insufficient permissions (need read access to iOS-BILDsolid)

Check the run status:
```bash
gh run view <run-id> --repo spring-media/iOS-BILDsolid
```

### "Validation failed"
Review the error messages in the validation report:
- **Errors:** Must be fixed (missing required fields, invalid structure)
- **Warnings:** Should be reviewed but not blocking (empty parameters, unknown events)

Common issues:
- Missing required parameters → Check tracking implementation
- Unknown event types → Add to `EXPECTED_EVENTS` if intentional
- Duplicate tracking IDs → Check if this is expected behavior

---

## File Formats

### Supported Formats

The validator supports two formats:

**1. JSON Array (current TRACKTOR format):**
```json
[
  {"timestamp": 123, "type": "view", "name": "home", "params": {...}},
  {"timestamp": 124, "type": "event", "name": "click", "params": {...}}
]
```

**2. JSONL (JSON Lines / newline-delimited):**
```jsonl
{"timestamp": 123, "type": "view", "name": "home", "params": {...}}
{"timestamp": 124, "type": "event", "name": "click", "params": {...}}
```

---

## Additional Resources

- **Spike Report:** `../TRACKTOR_INTEGRATION_SPIKE.md`
- **Meeting Agenda:** `../docs/TRACKTOR_MEETING_AGENDA.md`
- **Example Workflow:** `../.github/workflows/trigger_cerberus_workflow.yml`

---

## Support

For questions or issues:
- Review the spike report: `TRACKTOR_INTEGRATION_SPIKE.md`
- Check meeting notes: `docs/TRACKTOR_MEETING_AGENDA.md`
- Contact BILD APP team: Peter Tran, Andriy Martynenko, Uday Gowda
