# Tealium Deployment

> **Status**: Proof of Concept (POC)

Automated deployment system for Tealium JavaScript extensions. This tool synchronizes extension code from this repository to Tealium iQ Tag Management, ensuring version control and consistency across environments.

## Overview

### What it does
- **Updates** existing Tealium extensions automatically
- **Synchronizes** code and configuration (scope, occurrence, status)
- **Maintains** single source of truth in this repository
- **Triggers** on merge to master branch

### What it doesn't do
- ❌ Create new extensions (manual creation required)
- ❌ Delete extensions
- ❌ Support non-JavaScript extensions

## Key Concepts

The deployment system works with two states:

- **Local**: Extension code and configuration in this repository
- **Remote**: Current state of the extension in Tealium iQ

When triggered, the deployment compares local and remote states and updates the remote extension if:
- Extension code has changed
- Configuration settings differ (scope, occurrence, or status)

## Getting Started

### Prerequisites
1. Extension must already exist in Tealium iQ
2. You need the extension ID from Tealium
3. Extension code should be in the `extensions/` directory

### Adding an Extension to Deployment

#### Step 1: Get the Extension ID
1. Navigate to [Tealium iQ TMS](https://my.tealiumiq.com)
2. Open your profile and locate the extension
3. Copy the extension ID (visible in the URL or extension settings)

#### Step 2: Add Extension Code
Place the extension JavaScript file in the appropriate directory:
```
extensions/
  ├── kilkaya/
  │   └── k5a_meta_init.js
  ├── cmp/
  │   └── cmp_interaction_tracking.js
  └── ...
```

#### Step 3: Configure Deployment
Add an entry to the `deploymentConfig` in [main.ts](main.ts):

```typescript
const deploymentConfig: DeploymentConfiguration = {
    extensions: [
        {
            name: 'Kilkaya init k5aMeta',
            id: 7,
            file: './extensions/kilkaya/k5a_meta_init.js',
            scope: Scope.PreLoader,
            occurrence: Occurrence.RunOnce,
            status: Status.Active
        }
    ]
};
```


## Running the Deployment

### Manual Deployment
```bash
npm run deploy -- "Your commit message"
```

Example:
```bash
npm run deploy -- "TICKET-123 - Update CMP tracking extension"
```

### Automatic Deployment
The deployment runs automatically when changes are merged to the `master` branch.

## Important Notes

### ⚠️ Repository as Source of Truth
- All changes in this repository will **override** any manual changes made in Tealium iQ
- If you make manual changes in Tealium, they will be lost on the next deployment
- Always make changes in this repository and deploy them

### 🏷️ Extension Naming Convention
Extensions managed by this deployment system:
- Have an `[A]` prefix in their title in Tealium
- Include a note indicating automated deployment

### 🔍 Deployment Behavior
- Extensions are updated **only if changes are detected**
- No-op if both local and remote states are identical
- Deployment logs show which extensions were updated and why

## Troubleshooting

### Extension Not Updating
- Verify the extension ID matches the one in Tealium
- Check that the file path is correct
- Ensure the extension exists in Tealium (deployment doesn't create extensions)

### Deployment Fails
- Confirm you have the necessary permissions in Tealium
- Verify the commit message is provided
- Check the deployment logs for specific error messages




