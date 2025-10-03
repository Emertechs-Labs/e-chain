# 🛡️ Echain Quality Assurance Agent

A comprehensive QA automation system that ensures code quality, runs tests, and maintains documentation standards across the Echain platform.

## 🚀 Features

- **Automated Quality Checks**: Linting, testing, build verification, and security scanning
- **Documentation Updates**: Automatically updates API and component documentation
- **Git Integration**: Pre-commit and pre-push hooks prevent bad code from entering the repository
- **Docker Integration**: QA checks run automatically before Docker operations
- **Development Server Protection**: Ensures code quality before starting development servers
- **Comprehensive Reporting**: Detailed logs and reports for all QA activities

## 📋 QA Checks Performed

### Code Quality
- **ESLint**: Frontend and blockchain JavaScript/TypeScript linting
- **TypeScript**: Type checking and compilation verification
- **Solidity**: Contract linting and formatting (Solhint, Prettier)

### Testing
- **Unit Tests**: Blockchain smart contract tests (Hardhat)
- **Integration Tests**: Full E2E testing suite
- **API Tests**: Backend service verification

### Build Verification
- **Frontend Build**: Next.js production build verification
- **Contract Compilation**: Solidity compilation checks
- **Bundle Analysis**: Performance and size monitoring

### Security & Performance
- **Dependency Audit**: NPM security vulnerability scanning
- **Secret Detection**: Checks for exposed credentials
- **Performance Analysis**: Bundle size and Lighthouse scoring

## 🛠️ Usage

### Manual Execution

```bash
# Run all QA checks
npm run qa

# Run specific checks
npm run qa:lint      # Only linting
npm run qa:test      # Only tests
npm run qa:build     # Only build verification
npm run qa:security  # Only security checks
npm run qa:docs      # Only documentation updates
```

### Automatic Triggers

The QA agent runs automatically on:

- **Git Commits**: Pre-commit hook blocks commits with QA failures
- **Git Push**: Pre-push hook prevents pushing broken code
- **Docker Operations**: `docker:build`, `docker:run`, `docker:commit`
- **Development Server**: `npm run dev` runs lint checks first

### CI/CD Integration

For CI/CD pipelines, use:

```yaml
# GitHub Actions example
- name: Run QA Checks
  run: npm run qa

# With specific checks
- name: Lint and Test
  run: |
    npm run qa:lint
    npm run qa:test
```

## 📊 Reports & Logs

QA results are consolidated into a single log file:
- `docs/qa/qa-agent.log`: All QA execution logs and reports

### Log Structure

The QA agent maintains a rolling log with:
- Timestamped entries for all operations
- Success/failure indicators
- Detailed error messages
- Performance metrics
- Cleanup activity logs

### Automatic Cleanup

The QA agent automatically:
- Removes old test result directories (7+ days old)
- Cleans up temporary log directories
- Maintains a single, consolidated log file
- Prevents log file bloat

## ⚙️ Configuration

QA behavior is controlled by `.qa-config`:

```bash
# Enable/disable checks
ENABLE_LINTING=true
ENABLE_TESTING=true
ENABLE_SECURITY_CHECKS=true

# Timeout settings
TIMEOUT_LINT=300
TIMEOUT_TEST=600

# Quality gates
FAIL_ON_LINT_ERRORS=true
FAIL_ON_TEST_FAILURES=true
```

## 🔧 Development

### Adding New Checks

1. Add check function to `scripts/qa-agent.sh`
2. Update configuration in `.qa-config`
3. Add npm script to `package.json`
4. Update this documentation

### Custom Triggers

Create custom triggers by calling the QA agent:

```bash
# In package.json scripts
"custom:qa": "bash scripts/qa-agent.sh --custom-check"

# In CI/CD
- name: Custom QA
  run: bash scripts/qa-agent.sh
  env:
    QA_TRIGGER: "Custom CI"
```

## 🚨 Exit Codes

- `0`: All checks passed
- `1`: Critical failures (lint errors, test failures, build failures)
- `2`: Configuration errors
- `3`: Timeout errors

## 📈 Quality Metrics

The QA agent tracks:

- **Code Coverage**: Test coverage percentages
- **Performance Scores**: Lighthouse and bundle analysis
- **Security Score**: Vulnerability counts and severity
- **Build Success Rate**: Percentage of successful builds
- **Time to QA**: Average QA execution time

## 🐛 Troubleshooting

### Common Issues

**QA checks fail but code works**
- Check `.qa-config` for disabled checks
- Review error logs in `docs/qa/qa-agent.log`
- Verify Node.js and npm versions

**Git hooks not triggering**
- Ensure hooks are executable: `chmod +x .git/hooks/*`
- Check husky installation: `npm run prepare`
- Verify script paths in hooks

**Docker QA blocking builds**
- Run `npm run qa` locally first
- Check Docker QA logs in `docs/qa/qa-agent.log`
- Temporarily disable with `DISABLE_QA=true`

### Debug Mode

Enable debug logging:

```bash
DEBUG_QA=true npm run qa
```

## 🤝 Contributing

When adding new QA checks:

1. Follow the existing pattern in `qa-agent.sh`
2. Add configuration options to `.qa-config`
3. Update npm scripts in `package.json`
4. Add documentation and examples
5. Test with different environments (dev, CI, Docker)

## 📚 Related Documentation

- [Development Guide](../docs/guides/DEVELOPMENT.md)
- [Testing Guide](../docs/guides/TESTING.md)
- [CI/CD Setup](../docs/deployment/CI_CD.md)
- [Code Standards](../docs/guides/CODE_STANDARDS.md)

---

**Version:** 2.0.0
**Last Updated:** October 3, 2025
**Maintainer:** Echain Development Team