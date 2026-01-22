# ds_tealium_extension

Repository for Javascript Tealium extensions

## About The Project

The goal of this project is to generalize Tealium extensions for the usage on different profiles and to centralize
development.

The project is hosted on GitHub. 

Code changes pushed to any branch will trigger the Cerberus tests to verify e2e flow

The person responsible for changes has to check the Cerberus repo actions (Run E2E Tests Tealium CI) to make sure the tests are working fine after their changes

Changes will automatically be synced by Tealium.

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps:

git clone https://github.com/spring-media/ds_cmp_tealium_extension.git

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

* yarn
  ```sh
  npm install -g yarn
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/spring-media/ds_cmp_tealium_extension.git
   ```
2. Change into Root Directory and Install NPM packages
   ```sh
   yarn install
   ```
3. Run the Tests

   ```sh
   yarn run test
   ```

4. Run Mutation Tests (optional)

   ```sh
   yarn test:mutation
   ```

## Testing

This project includes comprehensive unit tests and mutation testing to ensure code quality.

### Unit Tests

Run the standard Jest test suite:

```sh
yarn test
```

### Mutation Testing

Mutation testing measures the quality of your tests by introducing small changes (mutations) to the code and checking if tests catch them. See [MUTATION_TESTING.md](./MUTATION_TESTING.md) for detailed documentation.

**Quick Start:**

```sh
# Run mutation tests on all extensions
yarn test:mutation

# Run in incremental mode (faster, only changed files)
yarn test:mutation:incremental

# Run in watch mode
yarn test:mutation:watch
```

The mutation testing will generate an HTML report (`mutation-report.html`) showing which code mutations were caught by tests and which survived, helping identify gaps in test coverage.

### Linting

Check code quality with ESLint:

```sh
yarn lint
```

## Backup Extensions

### Historical Note

In commit `6aa516b` (December 10, 2025), backup extension files were removed from the repository to keep it clean and maintainable. These backup files included profile-specific extensions that were consolidated into generalized versions.

**Removed backup files included:**
- CMP Interaction Tracking extensions (various profiles: bild, welt, autobild, computerbild, lib_books, etc.)
- Brandstory milestones and scrolldepth extensions (bild, welt)
- CMP Custom Vendor Mapping extensions (bild, welt)
- Superbounce extensions (bild, welt)
- Cxense/Piano extensions
- WHOAMI extensions
- myCW extensions

**To restore backup files if needed:**
You can retrieve these files from git history using:
```sh
git checkout 6aa516b^ -- backup/
```

Or view specific backup files:
```sh
git show 6aa516b^:backup/[path-to-file]
```

## Extensions

### CMP Interaction Tracking Extension

Extension for triggering Adobe Analytics tracking events of the consent layer application (cmp).

In order to make the extension work in all Tealium profiles, the Adobe TagId of each profile needs to be determined.
This is done by a static mapping of the profile's name to a certain TagId. Be careful to update the mapping table inside
the extension, in case profiles or Adobe tags are changing.


### Adobe DoPlugins Extension

This extension is the result of a refactoring and generalization process of the various existing DoPlugins extensions.
The goal of the refactoring was to have only one centralized version of this extension which can be used on all brand 
profiles. [Read more](https://github.com/spring-media/ds_cmp_tealium_extension/blob/master/extensions/doPlugins_global.README.md)

The extension contains features which are needed for the Adobe Analytics tracking.

The different features are organized as simple Javascript objects which are attached to the global S-Object which 
is provided by the Adobe Analytics tag.

### Adobe DoPlugins App Extensions (Bild and Welt)

In addition to the global doPlugins extension there are three app extensions (doPlugins_bild_apps, doPlugins_welt_apps_android, doPlugins_welt_apps_ios) which are the generalized and refactored version for different Bild and Welt apps. The app extensions specifically cater for tracking on the mobile platforms.

Good luck!
