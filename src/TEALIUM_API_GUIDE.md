# Tealium API Guide - Team Documentation

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Working with Tealium Profiles](#working-with-tealium-profiles)
3. [Understanding Profile Output](#understanding-profile-output)
4. [API Architecture](#api-architecture)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Environment Configuration

### Setting Up Your .env File

Create a `.env` file in the project root with your Tealium credentials:

```env
TEALIUM_DEPLOY_ACCOUNT=axelspringer
TEALIUM_DEPLOY_USER=Your Email Used In Tealium
TEALIUM_DEPLOY_API_KEY=your_api_key_here
```

**Important Notes:**

- Quotes around values are optional but not required
- The `.env` file should be in the project root directory
- Never commit your `.env` file to version control (it's in `.gitignore`)
- Request API credentials from admin if you don't have them

---

## Working with Tealium Profiles

### Fetching a Profile

Use the pull command to fetch a complete profile including all extensions, tags and load rules:

```bash
yarn tealium:pull <profile_name>
```

**Examples:**

```bash
yarn tealium:pull welt
yarn tealium:pull bild
yarn tealium:pull spring-premium
```

### What Happens During a Pull

1. **Authentication**
    - Script reads credentials from `.env`
    - Sends authentication request to Tealium API
    - Receives temporary access token and regional API host

2. **Profile Fetch**
    - Uses the token to request profile data
    - Includes all nested data (extensions, tags, events, variables, load rules)
    - Returns complete JSON payload

3. **Save to File**
    - Creates `src/output/` directory if needed
    - Saves as `tealium_profile_{profile}_{timestamp}.json`
    - Also prints summary to console

---

## Understanding Profile Output

### Output File Location

After running `yarn tealium:pull <profile>`, find your output at:

```
src/output/tealium_profile_{profile}_{timestamp}.json
```

### Profile Structure Overview

The fetched profile JSON contains the following main sections:

```json
{
  "account": "axelspringer",
  "profile": "welt",
  "version": "202601291554",
  "versionTitle": "Version 2026.01.29.1554",
  "extensions": [...],
  "tags": [...],
  "events": [...],
  "loadRules": [...],
  "variables": [...]
}
```

---

### Reading Extensions

Extensions are the core logic units in Tealium. Each extension has:

#### Common Properties

| Property        | Description                  | Example                                                     |
| --------------- | ---------------------------- | ----------------------------------------------------------- |
| `id`            | Unique identifier in Tealium | `26`                                                        |
| `name`          | Human-readable name          | `"Convert Array to String - page_keywords"`                 |
| `extensionType` | Type of extension            | `"Set Data Values"`, `"Javascript Code"`, `"Lookup Table"`  |
| `scope`         | When it executes             | `"Before Load Rules"`, `"After Load Rules"`, `"Pre Loader"` |
| `occurrence`    | How often it runs            | `"Run Always"`, `"Run Once"`                                |
| `status`        | Active or inactive           | `"active"`, `"inactive"`                                    |
| `conditions`    | When to execute              | Array of condition objects                                  |
| `configuration` | Extension-specific config    | Varies by type                                              |

#### Extension Types Explained

**1. Set Data Values**

- Sets or transforms data variables
- Configuration contains `configs` array with set/value pairs

```json
{
    "extensionType": "Set Data Values",
    "configuration": {
        "configs": [
            {
                "set": "js.page_keywords_string",
                "settotext": "b['page_keywords'].join(\";\")",
                "setoption": "code",
                "settovar": ""
            }
        ]
    }
}
```

**2. Javascript Code / Advanced Javascript Code**

- Custom JavaScript execution
- Configuration contains `code` property with the script

```json
{
    "extensionType": "Javascript Code",
    "configuration": {
        "code": "// Your JavaScript code here"
    }
}
```

**3. Lookup Table**

- Maps input values to output values
- Configuration contains lookup mappings

```json
{
    "extensionType": "Lookup Table",
    "configuration": {
        "varlookup": "js.page_type",
        "var": "js.fb_vc_content_type",
        "configs": [
            {
                "name": "article",
                "value": "product"
            },
            {
                "name": "video",
                "value": "product"
            }
        ]
    }
}
```

**4. Join Data Values**

- Concatenates multiple values with a delimiter

```json
{
    "extensionType": "Join Data Values",
    "configuration": {
        "var": "js.ivw_cp",
        "delimiter": "_",
        "configs": [
            { "set": "textvalue" },
            { "set": "js.page_channel1" },
            { "set": "js.page_type" }
        ]
    }
}
```

**5. Persist Data Value**

- Stores values in cookies for later use

```json
{
    "extensionType": "Persist Data Value",
    "configuration": {
        "var": "cp.activate_tag",
        "settovar": "qp.activate_tag",
        "persistence": "session",
        "allowupdate": "multiple"
    }
}
```

---

### Reading Conditions

Conditions determine when an extension executes. They use a nested OR/AND structure:

```json
"conditions": [
  [
    {
      "variable": "udo.page_keywords",
      "operator": "defined",
      "value": ""
    },
    {
      "variable": "udo.page_keywords",
      "operator": "contains",
      "value": "Newsteam"
    }
  ]
]
```

**Structure:**

- Outer array = OR conditions (any group can match)
- Inner array = AND conditions (all must match)
- Each condition has: `variable`, `operator`, `value`

**Common Operators:**

- `defined` / `notdefined`
- `equals` / `does_not_equal`
- `contains` / `does_not_contain`
- `populated` / `notpopulated`
- `starts_with` / `ends_with`
- `less_than` / `greater_than`

---

### Reading Events

Events are triggered by user interactions:

```json
{
    "id": 499,
    "name": "epaper click download",
    "status": "active",
    "eventType": "mouseevents",
    "scope": "DOM Ready",
    "trackingEvent": "link",
    "eventTrigger": {
        "cssSelector": "#welson > div.current-edition-container",
        "mouseEvent": "mousedown",
        "triggerFrequency": "runAlways"
    },
    "eventVariables": [
        {
            "variable": "udo.tealium_event",
            "type": "text",
            "value": "custom_event"
        }
    ]
}
```

**Key Properties:**

- `eventTrigger`: Defines what triggers the event (CSS selector, mouse event)
- `eventVariables`: Data to set when event fires
- `rules`: Load rules that apply to this event

---

### Reading Tags

Tags are third-party integrations (Adobe, Google Analytics, etc.):

```json
{
    "id": 210,
    "tagId": "20001",
    "title": "Adobe Analytics",
    "type": "script",
    "status": "active",
    "template": {
        "name": "Adobe Analytics",
        "vendor": "Adobe"
    }
}
```

---

### Reading Load Rules

Load rules determine when tags fire:

```json
{
    "id": 225,
    "name": "Epaper Pages",
    "status": "active",
    "conditions": [
        [
            {
                "variable": "dom.domain",
                "operator": "equals",
                "value": "epaper.welt.de"
            }
        ]
    ]
}
```

---

### Quick Analysis Tips

#### Find Extensions by Type

```bash
# Using jq (JSON processor)
cat src/output/tealium_profile_*.json | jq '.extensions[] | select(.extensionType == "Lookup Table")'
```

#### Count Extensions by Status

```bash
cat src/output/tealium_profile_*.json | jq '[.extensions[] | .status] | group_by(.) | map({status: .[0], count: length})'
```

#### List All Extension Names

```bash
cat src/output/tealium_profile_*.json | jq '.extensions[] | .name'
```

#### Find Extensions with Specific Scope

```bash
cat src/output/tealium_profile_*.json | jq '.extensions[] | select(.scope == "Before Load Rules")'
```

#### Search for Extensions by Name Pattern

```bash
cat src/output/tealium_profile_*.json | jq '.extensions[] | select(.name | contains("Adobe"))'
```

---

### Understanding Scope and Execution Order

Extensions execute in this order:

1. **Pre Loader** - Before Tealium loads
2. **Before Load Rules** - Before load rules are evaluated
3. **After Load Rules** - After load rules are evaluated
4. **DOM Ready** - When DOM is ready
5. **After Tags** - After tags fire

**Tag Scoped Extensions:**

- Some extensions have numeric scope values (e.g., `"scope": "155,210"`)
- These are tag IDs - the extension only runs for those specific tags
- Find tag names by matching the ID in the `tags` array

---

### Understanding Configuration Objects

Each extension type has a different configuration structure:

#### Set Data Values Configuration

```json
"configuration": {
  "configs": [
    {
      "set": "js.variable_name",      // Variable to set
      "setoption": "code",             // "code", "text", or "var"
      "settotext": "b['source']",      // Code/text to execute
      "settovar": "js.other_var"       // Or variable to copy from
    }
  ]
}
```

#### Lookup Table Configuration

```json
"configuration": {
  "varlookup": "js.page_type",        // Input variable
  "var": "js.output_variable",        // Output variable
  "filtertype": "equals",             // Match type
  "vartype": "string",                // Data type
  "settotext": "default_value",       // Default if no match
  "configs": [
    {
      "name": "article",               // Input value
      "value": "product",              // Output value
      "comment": ""                    // Optional comment
    }
  ]
}
```

#### Join Data Values Configuration

```json
"configuration": {
  "var": "js.output_variable",        // Output variable
  "delimiter": "_",                   // Join character
  "leadingdelimiter": false,          // Add delimiter at start?
  "defaultvalue": "fallback",         // Default if empty
  "configs": [
    {"set": "textvalue"},             // Literal text
    {"set": "js.variable1"},          // Variable reference
    {"text": "literal text"}          // Another literal
  ]
}
```

---

### Deployed Extensions

Extensions deployed via CI/CD have special notes:

```json
"notes": "⚠️ DEPLOYED BY GITHUB-CI/CD - DO NOT CHANGE MANUALLY ⚠️\nCommit: ea8ce4c\nSrc: ./extensions/welt/before_load_rules_data_merge.js\nDeployed at: Thu, 29 Jan 2026 15:51:51 GMT"
```

**What this means:**

- Extension is managed in GitHub repository
- Changes should be made in the codebase, not Tealium UI
- Deployment pipeline automatically updates Tealium
- Manual changes will be overwritten on next deployment

---

## API Architecture

### Authentication Flow

```
Your Script
    ↓
Load .env credentials (config.ts)
    ↓
POST /v3/auth/accounts/{account}/profiles/{profile}
    ↓
Receive: { token, host }
    ↓
Store in TealiumAPI instance
    ↓
Use for all subsequent API calls
```

### Data Flow

```
.env → config.ts → TealiumAPI → Tealium Server → JSON Response → File
```

### Key Components

**1. config.ts**

- Loads environment variables
- Validates required credentials
- Exports configuration object

**2. TealiumAPI.ts**

- Handles authentication
- Makes API requests
- Manages token and host

**3. pull.ts**

- CLI script for fetching profiles
- Orchestrates the fetch process
- Saves output to file

---

## Common Tasks

### Creating a New Converter

When you need to convert a local extension file to Tealium format:

1. **Examine existing converters** in `src/tealiumdeployment/scripts/converters/`
2. **Identify the extension type** you need to convert
3. **Analyze the configuration structure** from a pulled profile
4. **Create a new converter class** following the pattern
5. **Write tests** to ensure correctness

Example: See `SetDataValuesConverter.ts` for reference

### Deploying Changes

```bash
# Deploy with a commit message
yarn deploy -- "Your commit message here"
```

This will:

- Run tests
- Build the project
- Deploy to Tealium via API
- Create a new version

### Running Tests

```bash
# Run all tests
yarn test

# Run specific test file
yarn test SetDataValuesConverter.test.ts

# Run tests in watch mode
yarn test --watch
```

---

## Troubleshooting

### Authentication Errors

**Error:** "Auth failed" or 401 Unauthorized

**Solutions:**

- Verify credentials in `.env` are correct
- Check that your API key is still valid
- Ensure you have access to the specified profile
- Confirm account name matches your Tealium account

### Profile Not Found

**Error:** "Profile not found" or 404

**Solutions:**

- Verify the profile name is spelled correctly
- Check you have permissions for that profile
- List available profiles in Tealium UI to confirm name

### Empty Extensions Array

**Issue:** Profile fetched but extensions array is empty

**Possible Causes:**

- Profile genuinely has no extensions
- Permissions issue - you may not have access to view extensions
- Try fetching a different profile to verify API access

### Network Errors

**Error:** Connection timeout or network error

**Solutions:**

- Check your internet connection
- Verify you're not behind a restrictive firewall
- Try again - Tealium API may be temporarily unavailable

---

## Quick Reference Commands

### Fetch Profiles

```bash
# Fetch a specific profile
yarn tealium:pull welt

# Output will be saved to:
# src/output/tealium_profile_welt_{timestamp}.json
```

### Analyze Output with jq

```bash
# List all extension types
cat src/output/tealium_profile_*.json | jq '[.extensions[].extensionType] | unique'

# Find extensions by type
cat src/output/tealium_profile_*.json | jq '.extensions[] | select(.extensionType == "Lookup Table")'

# Count active vs inactive extensions
cat src/output/tealium_profile_*.json | jq '[.extensions[] | .status] | group_by(.) | map({status: .[0], count: length})'

# List all tag names
cat src/output/tealium_profile_*.json | jq '.tags[] | {id: .id, title: .title, status: .status}'

# Find extensions with specific scope
cat src/output/tealium_profile_*.json | jq '.extensions[] | select(.scope == "Before Load Rules") | .name'

# Get extension by name
cat src/output/tealium_profile_*.json | jq '.extensions[] | select(.name == "CMP_CustomVendorMapping")'
```

### Analyze Output with grep

```bash
# Find all JavaScript Code extensions
grep -A 5 '"extensionType": "Javascript Code"' src/output/tealium_profile_*.json

# Search for specific variable usage
grep -n "page_keywords" src/output/tealium_profile_*.json

# Count total extensions
grep -c '"extensionType"' src/output/tealium_profile_*.json
```

---

## Understanding Variable Prefixes

Tealium uses prefixes to organize variables:

| Prefix  | Source                      | Example            | Description                |
| ------- | --------------------------- | ------------------ | -------------------------- |
| `udo.`  | UDO (Universal Data Object) | `udo.page_type`    | Data from page layer       |
| `js.`   | JavaScript variables        | `js.page_channel1` | Computed/set by extensions |
| `cp.`   | Cookie/Persistent           | `cp.utag_main_uid` | Stored in cookies          |
| `qp.`   | Query Parameters            | `qp.cid`           | URL query string params    |
| `dom.`  | DOM properties              | `dom.domain`       | Browser/DOM information    |
| `meta.` | Meta tags                   | `meta.description` | HTML meta tag values       |

---

## Extension Execution Lifecycle

### Page Load Sequence

```
1. Pre Loader Extensions
   ↓
2. Before Load Rules Extensions
   ↓
3. Load Rules Evaluation
   ↓
4. After Load Rules Extensions
   ↓
5. Tags Fire (based on load rules)
   ↓
6. Tag-Scoped Extensions (per tag)
   ↓
7. DOM Ready Extensions
   ↓
8. After Tags Extensions
```

### Event Tracking Sequence

```
User Interaction (click, scroll, etc.)
   ↓
Event Trigger Fires
   ↓
Event Variables Set
   ↓
Event Extensions Execute
   ↓
Event Load Rules Evaluated
   ↓
Tags Fire (if conditions met)
```

---

## Working with Conditions

### Condition Logic

Conditions use nested arrays for complex logic:

```json
"conditions": [
  [
    {"variable": "udo.page_type", "operator": "equals", "value": "article"},
    {"variable": "udo.page_isPremium", "operator": "equals", "value": "true"}
  ],
  [
    {"variable": "udo.page_type", "operator": "equals", "value": "video"}
  ]
]
```

**This reads as:**

```
(page_type == "article" AND page_isPremium == "true")
OR
(page_type == "video")
```

### Empty Conditions

```json
"conditions": []
```

- Extension always executes (no conditions)
- Still respects scope and occurrence settings

---

## Best Practices

### When Analyzing Profiles

1. **Start with the structure** - Understand the top-level organization
2. **Filter by status** - Focus on active extensions first
3. **Group by scope** - Understand execution order
4. **Check conditions** - See when things actually run
5. **Look for patterns** - Similar extensions often follow conventions

### When Creating Converters

1. **Pull a real profile** - Get actual data structure
2. **Find examples** - Look for extensions of the type you need
3. **Document edge cases** - Note any unusual configurations
4. **Write tests first** - TDD approach ensures correctness
5. **Handle errors gracefully** - Validate input data

### When Deploying

1. **Test locally first** - Run all tests before deploying
2. **Use descriptive commit messages** - Explain what changed and why
3. **Deploy to dev/qa first** - Test in non-production environments
4. **Monitor after deployment** - Check Tealium UI to verify changes
5. **Document breaking changes** - Update team if behavior changes

---

## Additional Resources

### Tealium Documentation

- [Tealium iQ Tag Management](https://docs.tealium.com/platforms/tag-management/)
- [Tealium API Reference](https://docs.tealium.com/server-side/api/)

### Internal Documentation

- `src/tealiumdeployment/README.md` - Deployment pipeline details
- `extensions/doPlugins/doPlugins_global.README.md` - Adobe plugins documentation
- `REPOSITORY_ANALYSIS.md` - Project structure overview

### Getting Help

- Check existing extensions for examples
- Review test files for usage patterns
- Ask team members who have worked with similar extensions
- Consult Tealium support for API-specific questions

---

## Appendix: Extension Type Reference

### Complete Extension Type List

| Extension Type           | Purpose                 | Configuration Key       |
| ------------------------ | ----------------------- | ----------------------- |
| Set Data Values          | Set/transform variables | `configs` array         |
| Javascript Code          | Custom JS execution     | `code` string           |
| Advanced Javascript Code | Complex JS with drafts  | `codeDevData` object    |
| Lookup Table             | Value mapping           | `configs` + `varlookup` |
| Join Data Values         | Concatenate values      | `configs` + `delimiter` |
| Persist Data Value       | Store in cookies        | `var` + `persistence`   |
| Pathname Tokenizer       | Split URL path          | `output` string         |
| Crypto Extension         | Hash values             | `hash` config           |

### Scope Values Reference

| Scope                     | When It Runs               |
| ------------------------- | -------------------------- |
| Pre Loader                | Before Tealium initializes |
| Before Load Rules         | Before load rules evaluate |
| After Load Rules          | After load rules evaluate  |
| DOM Ready                 | When DOM is ready          |
| After Tags                | After tags fire            |
| Numeric (e.g., "155,210") | Only with specific tags    |

### Occurrence Values

| Occurrence | Behavior                          |
| ---------- | --------------------------------- |
| Run Always | Executes on every page view/event |
| Run Once   | Executes only once per page load  |
| null       | Determined by scope (tag-scoped)  |

---

## Version Information

This guide covers:

- Tealium iQ Tag Management
- Tealium API v3
- Project structure as of 2026

Last updated: February 2026
