#!/usr/bin/env node

/**
 * Beta Readiness Check Script
 * 
 * Comprehensive check of all beta release requirements
 * Run with: npm run check:beta
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

class BetaReadinessChecker {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
    };
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  check(name, fn) {
    try {
      const result = fn();
      if (result === true) {
        this.results.passed.push(name);
        this.log(`  ✓ ${name}`, colors.green);
        return true;
      } else if (result === 'warning') {
        this.results.warnings.push(name);
        this.log(`  ⚠ ${name}`, colors.yellow);
        return true;
      } else {
        this.results.failed.push(name);
        this.log(`  ✗ ${name}`, colors.red);
        return false;
      }
    } catch (error) {
      this.results.failed.push(`${name}: ${error.message}`);
      this.log(`  ✗ ${name}: ${error.message}`, colors.red);
      return false;
    }
  }

  // Environment checks
  checkEnvironment() {
    this.log(`\n${colors.bold}1. Environment Configuration${colors.reset}`, colors.blue);
    
    this.check('.env.example exists', () => {
      return fs.existsSync(path.join(__dirname, '..', '.env.example'));
    });

    this.check('validate-env.js script exists', () => {
      return fs.existsSync(path.join(__dirname, 'validate-env.cjs'));
    });

    this.check('package.json has validate:env script', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.scripts && !!pkg.scripts['validate:env'];
    });
  }

  // Build checks
  checkBuild() {
    this.log(`\n${colors.bold}2. Build & Deployment${colors.reset}`, colors.blue);

    this.check('package.json exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'package.json'));
    });

    this.check('next.config.mjs exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'next.config.mjs'));
    });

    this.check('tsconfig.json exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'tsconfig.json'));
    });

    this.check('Dependencies installed', () => {
      return fs.existsSync(path.join(__dirname, '..', 'node_modules'));
    });
  }

  // Contract checks
  checkContracts() {
    this.log(`\n${colors.bold}3. Smart Contracts${colors.reset}`, colors.blue);

    this.check('contracts.ts exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'lib', 'contracts.ts'));
    });

    this.check('Contract addresses defined', () => {
      const contractsPath = path.join(__dirname, '..', 'lib', 'contracts.ts');
      if (!fs.existsSync(contractsPath)) return false;
      
      const content = fs.readFileSync(contractsPath, 'utf-8');
      return content.includes('CONTRACT_ADDRESSES') &&
             content.includes('EventFactory') &&
             content.includes('0x');
    });

    this.check('ABIs available', () => {
      const contractsPath = path.join(__dirname, '..', 'lib', 'contracts.ts');
      if (!fs.existsSync(contractsPath)) return false;
      
      const content = fs.readFileSync(contractsPath, 'utf-8');
      return content.includes('CONTRACT_ABIS') || content.includes('abi');
    });
  }

  // Code quality checks
  checkCodeQuality() {
    this.log(`\n${colors.bold}4. Code Quality${colors.reset}`, colors.blue);

    this.check('ESLint configured', () => {
      return fs.existsSync(path.join(__dirname, '..', 'eslint.config.js')) ||
             fs.existsSync(path.join(__dirname, '..', '.eslintrc.js')) ||
             fs.existsSync(path.join(__dirname, '..', '.eslintrc.json'));
    });

    this.check('TypeScript configured', () => {
      return fs.existsSync(path.join(__dirname, '..', 'tsconfig.json'));
    });

    this.check('Tailwind configured', () => {
      return fs.existsSync(path.join(__dirname, '..', 'tailwind.config.ts'));
    });
  }

  // Documentation checks
  checkDocumentation() {
    this.log(`\n${colors.bold}5. Documentation${colors.reset}`, colors.blue);

    this.check('README.md exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'README.md'));
    });

    this.check('docs directory exists', () => {
      return fs.existsSync(path.join(__dirname, '..', '..', '..', 'docs'));
    });

    this.check('Beta onboarding guide exists', () => {
      return fs.existsSync(path.join(__dirname, '..', '..', 'docs', 'guides', 'BETA_USER_ONBOARDING.md'));
    });
  }

  // Testing checks
  checkTesting() {
    this.log(`\n${colors.bold}6. Testing${colors.reset}`, colors.blue);

    this.check('tests directory exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'tests')) ||
             fs.existsSync(path.join(__dirname, '..', '__tests__'));
    });

    this.check('Test scripts configured', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.scripts && !!(pkg.scripts.test || pkg.scripts['test:unit']);
    });
  }

  // Security checks
  checkSecurity() {
    this.log(`\n${colors.bold}7. Security${colors.reset}`, colors.blue);

    this.check('.gitignore exists', () => {
      return fs.existsSync(path.join(__dirname, '..', '.gitignore'));
    });

    this.check('.env.local not in git', () => {
      const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf-8');
      return gitignore.includes('.env.local') || gitignore.includes('.env*.local');
    });

    this.check('No .env.local in repository', () => {
      return !fs.existsSync(path.join(__dirname, '..', '.env.local'));
    });

    this.check('Security headers configured', () => {
      const nextConfig = path.join(__dirname, '..', 'next.config.mjs');
      if (!fs.existsSync(nextConfig)) return 'warning';
      
      const content = fs.readFileSync(nextConfig, 'utf-8');
      return content.includes('headers') || 'warning';
    });
  }

  // Performance checks
  checkPerformance() {
    this.log(`\n${colors.bold}8. Performance${colors.reset}`, colors.blue);

    this.check('Turbopack available', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.scripts && !!pkg.scripts['dev:turbo'];
    });

    this.check('Analytics configured', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.dependencies && !!pkg.dependencies['@vercel/analytics'];
    });

    this.check('Image optimization configured', () => {
      const nextConfig = path.join(__dirname, '..', 'next.config.mjs');
      if (!fs.existsSync(nextConfig)) return true; // Default is fine
      
      const content = fs.readFileSync(nextConfig, 'utf-8');
      return !content.includes('unoptimized: true');
    });
  }

  // Integration checks
  checkIntegrations() {
    this.log(`\n${colors.bold}9. Integrations${colors.reset}`, colors.blue);

    this.check('Wagmi configured', () => {
      return fs.existsSync(path.join(__dirname, '..', 'lib', 'wagmi.ts'));
    });

    this.check('RainbowKit installed', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.dependencies && !!pkg.dependencies['@rainbow-me/rainbowkit'];
    });

    this.check('OnchainKit installed', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.dependencies && !!pkg.dependencies['@coinbase/onchainkit'];
    });

    this.check('IPFS integration exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'lib', 'ipfs.ts')) ||
             fs.existsSync(path.join(__dirname, '..', 'lib', 'metadata.ts'));
    });
  }

  // Deployment checks
  checkDeployment() {
    this.log(`\n${colors.bold}10. Deployment Readiness${colors.reset}`, colors.blue);

    this.check('Vercel configuration exists', () => {
      return fs.existsSync(path.join(__dirname, '..', 'vercel.json'));
    });

    this.check('Build script exists', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.scripts && !!pkg.scripts.build;
    });

    this.check('Start script exists', () => {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
      return pkg.scripts && !!pkg.scripts.start;
    });
  }

  // Generate summary
  generateSummary() {
    this.log(`\n${'='.repeat(60)}`, colors.blue);
    this.log(`${colors.bold}BETA READINESS SUMMARY${colors.reset}`, colors.blue);
    this.log(`${'='.repeat(60)}`, colors.blue);

    const total = this.results.passed.length + this.results.failed.length + this.results.warnings.length;
    const passRate = ((this.results.passed.length / total) * 100).toFixed(1);

    this.log(`\n✓ Passed: ${this.results.passed.length}`, colors.green);
    this.log(`⚠ Warnings: ${this.results.warnings.length}`, colors.yellow);
    this.log(`✗ Failed: ${this.results.failed.length}`, colors.red);
    this.log(`\nPass Rate: ${passRate}%`, passRate >= 85 ? colors.green : colors.yellow);

    if (this.results.failed.length > 0) {
      this.log(`\n${colors.red}Failed Checks:${colors.reset}`);
      this.results.failed.forEach(item => {
        this.log(`  • ${item}`, colors.red);
      });
    }

    if (this.results.warnings.length > 0) {
      this.log(`\n${colors.yellow}Warnings:${colors.reset}`);
      this.results.warnings.forEach(item => {
        this.log(`  • ${item}`, colors.yellow);
      });
    }

    this.log('');

    if (passRate >= 90 && this.results.failed.length === 0) {
      this.log('🎉 READY FOR BETA RELEASE!', colors.green);
      return 0;
    } else if (passRate >= 80) {
      this.log('⚠️  MOSTLY READY - Address failed checks before beta release', colors.yellow);
      return 1;
    } else {
      this.log('❌ NOT READY - Significant issues need to be resolved', colors.red);
      return 1;
    }
  }

  // Run all checks
  run() {
    this.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    this.log(`${colors.cyan}${colors.bold}ECHAIN BETA READINESS CHECK${colors.reset}`);
    this.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);

    this.checkEnvironment();
    this.checkBuild();
    this.checkContracts();
    this.checkCodeQuality();
    this.checkDocumentation();
    this.checkTesting();
    this.checkSecurity();
    this.checkPerformance();
    this.checkIntegrations();
    this.checkDeployment();

    return this.generateSummary();
  }
}

// Run the checker
if (require.main === module) {
  const checker = new BetaReadinessChecker();
  const exitCode = checker.run();
  process.exit(exitCode);
}

module.exports = BetaReadinessChecker;
