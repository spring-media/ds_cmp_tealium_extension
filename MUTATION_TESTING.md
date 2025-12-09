# Mutation Testing Guide

This project uses [Stryker Mutator](https://stryker-mutator.io/) for mutation testing to measure the quality and effectiveness of your test suite.

## What is Mutation Testing?

Mutation testing introduces small changes (mutations) to your source code and checks if your tests catch these changes. If a test fails when code is mutated, the mutant is "killed" (good). If tests still pass with mutated code, the mutant "survived" (indicates weak tests).

## Installation

The mutation testing dependencies are already installed. If you need to reinstall:

```bash
yarn add --dev @stryker-mutator/core @stryker-mutator/jest-runner
```

## Running Mutation Tests

### Basic Run
Run mutation tests on all files in the `extensions/` directory:

```bash
yarn test:mutation
```

### Watch Mode
Run mutation tests in watch mode (re-runs on file changes):

```bash
yarn test:mutation:watch
```

### Incremental Mode
Only test changed files since last run (faster for iterative development):

```bash
yarn test:mutation:incremental
```

## Configuration

The mutation testing configuration is in `stryker.config.json`. Key settings:

- **Mutate**: `extensions/**/*.js` - All JavaScript files in extensions directory
- **Test Runner**: Jest
- **Coverage Analysis**: Per-test (optimized performance)
- **Thresholds**:
  - High: 80% (excellent test quality)
  - Low: 60% (acceptable test quality)
  - Break: 50% (build fails below this)

## Understanding Results

After running mutation tests, you'll see:

### Console Output
- **Killed**: Mutants caught by tests ✅ (good)
- **Survived**: Mutants not caught by tests ❌ (needs improvement)
- **Timeout**: Tests took too long (may need optimization)
- **No Coverage**: Code not covered by tests
- **Mutation Score**: Percentage of killed mutants

### HTML Report
Open `mutation-report.html` in your browser for detailed results:
- See which mutations survived
- Identify weak spots in your test suite
- View specific code changes that weren't caught

### JSON Report
`mutation-report.json` contains machine-readable results for CI/CD integration.

## Mutation Types

Stryker applies various mutations:

- **Arithmetic Operators**: `+` → `-`, `*` → `/`
- **Logical Operators**: `&&` → `||`, `!` → ``
- **Comparison Operators**: `>` → `<`, `===` → `!==`
- **Conditional Expressions**: `true` → `false`
- **String Literals**: `"text"` → `""`
- **Array Literals**: `[1,2,3]` → `[]`
- **Block Statements**: Remove statements

## Best Practices

1. **Run regularly**: Include in CI/CD pipeline
2. **Focus on survived mutants**: These indicate missing test cases
3. **Don't aim for 100%**: 80%+ is excellent, some mutations may be impractical to test
4. **Use incremental mode**: During development for faster feedback
5. **Review HTML report**: Understand why mutants survived

## Performance Tips

- **Concurrency**: Adjust `maxConcurrentTestRunners` in config (default: 4)
- **Timeouts**: Increase `timeoutMS` if tests are slow
- **Incremental**: Use `--incremental` flag for faster iterations
- **File filtering**: Temporarily modify `mutate` array to test specific files

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run mutation tests
  run: yarn test:mutation
  
# Fail build if mutation score is below threshold
- name: Check mutation score
  run: |
    SCORE=$(jq '.mutationScore' mutation-report.json)
    if (( $(echo "$SCORE < 50" | bc -l) )); then
      echo "Mutation score $SCORE is below threshold"
      exit 1
    fi
```

## Troubleshooting

### Tests timeout during mutation testing
- Increase `timeoutMS` and `timeoutFactor` in `stryker.config.json`
- Check for infinite loops or slow tests

### High memory usage
- Reduce `maxConcurrentTestRunners`
- Run mutation tests on specific directories

### Mutants not being generated
- Check `mutate` patterns in config
- Ensure files aren't in `ignorePatterns`

## Resources

- [Stryker Documentation](https://stryker-mutator.io/)
- [Mutation Testing Best Practices](https://stryker-mutator.io/docs/General/guides/mutation-testing-elements/)
- [Jest Runner Configuration](https://stryker-mutator.io/docs/stryker-js/jest-runner/)

## Example Workflow

1. Write new feature code
2. Write unit tests
3. Run `yarn test` - ensure tests pass
4. Run `yarn test:mutation:incremental` - check mutation score
5. Review survived mutants in HTML report
6. Add missing test cases
7. Repeat until satisfied with mutation score
