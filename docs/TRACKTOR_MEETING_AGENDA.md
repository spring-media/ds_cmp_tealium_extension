# TRACKTOR Integration - Meeting Agenda & Discussion Points

**Date:** TBD  
**Duration:** 60 minutes  
**Attendees:**
- **Tracking Team:** [Your Team Members]
- **BILD APP Team:** Peter Tran (PO), Andriy Martynenko (Dev), Uday Gowda (Dev)

---

## Meeting Objectives

1. Align on TRACKTOR e2e test integration approach
2. Define technical implementation details
3. Establish collaboration workflow
4. Create action items and timeline

---

## Agenda

### 1. Introduction & Context (10 min)

**Presenter:** Tracking Team Lead

**Topics:**
- Overview of the tracking team's migration to GitHub-based workflow
- Current challenge: No validation of tracking changes for mobile apps
- Goal: Integrate TRACKTOR test results into our CI/CD pipeline

**Reference:** `TRACKTOR_INTEGRATION_SPIKE.md` - Executive Summary

---

### 2. Current State Overview (10 min)

**Presenter:** Both teams

**Discussion Points:**

**TRACKTOR Tests (App Team):**
- Current test coverage (Home PV, Article PV, Media Events, Orders)
- Test frequency (biweekly before releases)
- Test duration (~X minutes?)
- Artifact format (JSONL)
- Current artifact retention period
- GitHub Actions workflow name and structure

**Tracking Team Workflow:**
- Tealium extension deployment process
- Existing Cerberus integration (reference example)
- Change frequency and impact
- Need for defensive testing

**Questions:**
- What's the current state of TRACKTOR test automation?
- How stable are the tests (pass rate)?
- What environments do tests run against (dev/qa/stage/prod)?

---

### 3. Proposed Integration Approach (15 min)

**Presenter:** Tracking Team

**Proposal:** Repository Dispatch Pattern (similar to Cerberus)

**Architecture Overview:**
```
[ds_cmp_tealium_extension] 
    ↓ (trigger via repository_dispatch)
[iOS-BILDsolid TRACKTOR Tests]
    ↓ (upload artifacts & notify)
[Validation & Storage]
```

**Implementation in Phases:**

**Phase 1: Manual Trigger (Week 1-2)**
- Tracking team triggers tests manually via GitHub CLI
- Download and validate artifacts manually
- Low integration effort, immediate value

**Phase 2: Automated Integration (Week 3-4)**
- Add `repository_dispatch` trigger to iOS-BILDsolid workflow
- Automated triggering from tracking team repo
- Automated artifact download and validation
- **Requires app team workflow modifications**

**Phase 3: Enhanced Storage (Optional, Month 2)**
- Centralized artifact storage (S3)
- Extended retention (90+ days)
- Better accessibility for troubleshooting

**Reference:** `TRACKTOR_INTEGRATION_SPIKE.md` - Solutions 1, 2, 3

---

### 4. Technical Requirements Discussion (15 min)

**Facilitator:** Both teams

**Key Questions:**

#### A. Workflow Modifications

**Q1:** Can we add a `repository_dispatch` trigger to your TRACKTOR workflow?
- What workflow file is used for TRACKTOR tests?
- What's the workflow name in GitHub Actions?
- Any concerns with external triggers?

**Q2:** What inputs/parameters do your tests need?
- Environment (dev/qa/stage/prod)?
- Specific test suites?
- Configuration options?

**Q3:** Can artifacts be uploaded with extended retention?
- Current retention: ~7 days
- Proposed: 30-90 days
- Any storage concerns?

#### B. Permissions & Access

**Q4:** What GitHub permissions are needed?
- Tracking team needs: trigger workflows, read artifacts
- App team needs: trigger callbacks (optional)
- How to setup: Personal Access Token vs GitHub App?

**Q5:** Who should have access to what?
- Read-only vs write access
- Security considerations

#### C. Test Execution

**Q6:** How long do TRACKTOR tests typically run?
- Need to know for CI/CD planning
- Timeout considerations

**Q7:** What's the stability/reliability of tests?
- Pass rate?
- Known flaky tests?
- How to handle failures?

**Q8:** Can tests run in parallel with your normal pipeline?
- Impact on app team's CI/CD
- Resource constraints
- Priority/queuing

#### D. Artifacts & Validation

**Q9:** What artifact format should we expect?
- Currently JSONL - is this stable?
- Naming conventions?
- Directory structure?

**Q10:** What events are currently tested?
- Home PV ✓
- Article PV ✓
- Media Events ✓
- Orders (upcoming)
- Any others planned?

**Q11:** Expected vs actual event validation
- Do you maintain expected event schemas?
- Can we share validation logic?

---

### 5. Collaboration Workflow (5 min)

**Facilitator:** Both teams

**Proposed Workflow:**

1. **On-Demand Testing:**
   - Tracking team makes changes to extensions
   - Before deploying, manually trigger TRACKTOR tests
   - Review results before production deployment

2. **Scheduled Testing:**
   - Continue biweekly scheduled runs
   - Notify tracking team of results
   - Proactive monitoring

3. **Post-Deployment Validation:**
   - After deployment to Tealium production
   - Run TRACKTOR tests to verify everything works
   - Quick rollback if issues detected

**Discussion:**
- Which scenario is most valuable?
- Frequency of on-demand tests?
- Communication channels (Slack, email, GitHub)?

---

### 6. Troubleshooting & Support (5 min)

**Discussion Points:**

**When tests fail:**
- Who investigates first?
- How to distinguish app issues vs tracking issues?
- Escalation path

**When artifacts are needed:**
- How tracking team accesses historical artifacts
- Retention policy agreement
- Storage ownership

**When changes break tests:**
- Notification process
- Fix ownership (app team vs tracking team)
- Update timeline expectations

---

### 7. Action Items & Next Steps (10 min)

**Facilitator:** Both teams

**Immediate Actions:**

**App Team:**
- [ ] Share current TRACKTOR workflow file/structure
- [ ] Provide test duration and stability metrics
- [ ] Confirm environments available for testing
- [ ] Create GitHub PAT or setup GitHub App for tracking team
- [ ] Add `repository_dispatch` trigger to workflow (Phase 2)

**Tracking Team:**
- [ ] Create trigger scripts (Phase 1) ✓ (Already done)
- [ ] Test manual workflow triggering
- [ ] Document expected event schemas
- [ ] Create validation scripts ✓ (Already done)
- [ ] Setup GitHub secrets for cross-repo access

**Joint:**
- [ ] Agree on artifact retention policy
- [ ] Define communication channels
- [ ] Schedule weekly sync during implementation (2-4 weeks)
- [ ] Create shared documentation

**Timeline:**
- **Week 1:** Phase 1 implementation (manual)
- **Week 2:** Testing and refinement
- **Week 3-4:** Phase 2 implementation (automated)
- **Month 2:** Evaluate Phase 3 need

---

## Success Criteria

**Short-term (1 month):**
- [ ] Tracking team can trigger TRACKTOR tests on-demand
- [ ] Artifacts are accessible and validated
- [ ] At least one successful integration test completed
- [ ] Documentation is complete

**Long-term (3 months):**
- [ ] 80%+ of tracking changes validated before deployment
- [ ] Zero production issues due to untested tracking changes
- [ ] Artifacts used at least once for troubleshooting
- [ ] Process is documented and repeatable

---

## Open Questions

Add any additional questions that arise:

1. 
2. 
3. 

---

## Resources

- **Spike Report:** `TRACKTOR_INTEGRATION_SPIKE.md`
- **Scripts:** `scripts/trigger-tracktor.sh`, `scripts/download-tracktor-artifacts.sh`, `scripts/validate-tracktor-logs.js`
- **Example Cerberus Integration:** `.github/workflows/trigger_cerberus_workflow.yml`

---

## Follow-up

**After Meeting:**
- [ ] Distribute meeting notes
- [ ] Create Jira tickets for action items
- [ ] Schedule follow-up sync
- [ ] Update spike report with decisions made

**Communication:**
- Slack channel: [TBD]
- Email thread: [TBD]
- Weekly sync: [TBD - Day/Time]

---

## Notes

[Space for meeting notes]
