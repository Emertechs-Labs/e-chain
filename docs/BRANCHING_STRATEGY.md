# 🔀 Echain Branching Strategy

**Last Updated**: October 26, 2025
**Version**: 2.0.0 - Updated for Beta Launch

---

## 📋 Branch Overview

The Echain platform uses a structured branching strategy to manage different stages of development, testing, and production deployment. This strategy ensures clean separation between development phases while maintaining stability and enabling rapid iteration.

---

## 🌿 Branch Structure

### **dev** - Active Development Branch
**Purpose**: Primary branch for all active development work and getting hands dirty.

**Characteristics**:
- 🛠️ **Active Development**: All new features, bug fixes, and experiments
- 🔄 **Fast Iteration**: Quick commits and frequent pushes
- 🧪 **Experimental**: Safe space for testing new ideas and approaches
- 📝 **Free Form**: No strict rules - keep it loose for easy development
- 🚀 **Feature Integration**: Merge completed features to preview for testing

**Deployment**:
- Not deployed automatically
- Used for local development and feature testing
- Source for all new development work

**Protection Rules**:
- No strict protections - keep development agile
- Basic CI checks encouraged but not mandatory
- Allow direct commits for rapid development

---

### **main** - Stable Release & Backup Branch
**Purpose**: Contains stable, production-ready code that has been thoroughly tested and approved for release.

**Characteristics**:
- ✅ **Stable Code**: Only contains thoroughly tested, production-ready features
- ✅ **Backup Role**: Serves as the backup for production branch
- ✅ **Release Candidate**: Code in main is ready for production deployment
- ✅ **Merge Restrictions**: Only accepts merges from preview branch after full QA approval
- ✅ **Tag Releases**: All production releases are tagged from main branch

**Deployment**:
- Used for staging deployments and final production validation
- Contains the last known good state before production deployment
- Emergency rollback target if production branch encounters issues

**Protection Rules**:
- Requires pull request approval from at least 2 team members
- Must pass all CI/CD checks (tests, linting, security scans)
- No direct commits allowed - only merges from preview

---

### **preview** - Beta Releases Branch
**Purpose**: Contains beta-ready features undergoing final testing and user validation.

**Characteristics**:
- 🧪 **Beta Testing**: Features ready for beta user testing and feedback
- 🚀 **Feature Complete**: All planned features for current release cycle implemented
- 📊 **User Validation**: Code undergoing real-world testing with beta users
- 🔄 **Active Development**: Bug fixes and improvements based on beta feedback
- 📈 **Performance Monitoring**: Real user metrics and performance data collection

**Deployment**:
- Deployed to beta/staging environments
- Used for user acceptance testing
- Collects real-world performance metrics and user feedback

**Protection Rules**:
- Requires pull request approval from at least 1 team member
- Must pass CI/CD checks (tests, linting)
- Allows direct commits for hotfixes during beta testing

---

### **production** - Active & Live Production Branch
**Purpose**: Contains the actively running production code serving live users.

**Characteristics**:
- 🔥 **Live Production**: Code currently serving real users
- 🚨 **Critical Stability**: Highest priority for stability and performance
- 🛡️ **Security First**: Only security patches and critical bug fixes
- 📊 **Monitoring Intensive**: Heavy monitoring and alerting configured
- ⏱️ **Zero Downtime**: Changes deployed with blue-green or canary strategies

**Deployment**:
- Deployed to production environment (echain.app)
- Serves live traffic and real users
- Requires zero-downtime deployment strategies
- Rollback procedures must be tested and ready

**Protection Rules**:
- **STRICTEST PROTECTION**: Requires approval from 3+ team members
- Must pass comprehensive CI/CD pipeline (tests, security scans, performance tests)
- **NO DIRECT COMMITS**: Only accepts cherry-picked hotfixes from main branch
- Requires security review for any changes
- Emergency pause procedures must be documented

---

## 🔄 Branch Workflow

### **Development Flow**
```
dev → preview → main → production
```

### **Hotfix Flow**
```
production-issue → hotfix-branch → main → production
```

### **Emergency Flow**
```
production-emergency → main (rollback target)
```

---

## 📋 Branch Management Guidelines

### **Creating Feature Branches**
```bash
# Always branch from dev for new features
git checkout dev
git pull origin dev
git checkout -b feature/new-feature-name
```

### **Merging to Dev**
```bash
# From feature branch
git checkout dev
git pull origin dev
git merge feature/new-feature-name --no-ff
git push origin dev
```

### **Promoting to Preview (Beta)**
```bash
# When features are ready for beta testing
git checkout preview
git pull origin preview
git merge dev --no-ff
git push origin preview
```

### **Promoting to Main (Stable)**
```bash
# Only after beta testing approval
git checkout main
git pull origin main
git merge preview --no-ff
git tag v1.x.x-beta-complete
git push origin main --tags
```

### **Deploying to Production**
```bash
# Cherry-pick from main to production
git checkout production
git cherry-pick <commit-hash-from-main>
git push origin production
```

---

## 🧹 Branch Cleanup Policy

### **Temporary Branches**
- Feature branches should be deleted after merging
- Hotfix branches should be deleted after resolution
- Only `dev`, `preview`, `main`, and `production` persist on remote
- Local branches can exist for personal workflow

### **Cleanup Commands**
```bash
# Delete merged local branches
git branch --merged dev | grep -v dev | xargs git branch -d

# Delete remote feature branches (after merge)
git push origin --delete feature-branch-name

# Prune remote tracking branches
git remote prune origin
```

---

## 🚨 Emergency Procedures

### **Production Hotfix Process**
1. **Identify Issue**: Confirm production issue requiring immediate fix
2. **Create Hotfix**: Branch from main (not production)
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue-fix
   ```
3. **Implement Fix**: Make minimal, targeted fix
4. **Test Fix**: Run full test suite and validate fix
5. **Merge to Main**: Get required approvals
   ```bash
   git checkout main
   git merge hotfix/critical-issue-fix --no-ff
   git push origin main
   ```
6. **Deploy to Production**: Cherry-pick to production
   ```bash
   git checkout production
   git cherry-pick <hotfix-commit-hash>
   git push origin production
   ```

### **Production Rollback**
1. **Assess Situation**: Determine if rollback is necessary
2. **Identify Safe State**: Use main branch as rollback target
3. **Execute Rollback**:
   ```bash
   git checkout production
   git reset --hard main  # Roll back to last stable state
   git push origin production --force
   ```
4. **Deploy**: Trigger production deployment pipeline

---

## 📊 Branch Status Monitoring

### **Daily Health Checks**
- [ ] Dev branch builds successfully
- [ ] Preview branch builds successfully
- [ ] Main branch passes all tests
- [ ] Production branch deploys without issues
- [ ] No outstanding security vulnerabilities
- [ ] All branch protections are active

### **Weekly Reviews**
- [ ] Review branch deployment frequency
- [ ] Assess hotfix frequency and patterns
- [ ] Update branch protection rules if needed
- [ ] Review emergency procedures effectiveness

### **Monthly Audits**
- [ ] Complete branch strategy compliance review
- [ ] Security assessment of branch protections
- [ ] Performance impact of branching strategy
- [ ] Team feedback on development workflow

---

## 🔐 Branch Protection Rules

### **GitHub Branch Protections**

#### **main Branch**
```yaml
required_status_checks:
  - build
  - test
  - lint
  - security-scan
required_pull_request_reviews:
  required_approving_review_count: 2
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
restrictions:
  allow_force_pushes: false
  allow_deletions: false
```

#### **preview Branch**
```yaml
required_status_checks:
  - build
  - test
  - lint
required_pull_request_reviews:
  required_approving_review_count: 1
  dismiss_stale_reviews: true
restrictions:
  allow_force_pushes: false
  allow_deletions: false
```

#### **production Branch**
```yaml
required_status_checks:
  - build
  - test
  - lint
  - security-scan
  - performance-test
required_pull_request_reviews:
  required_approving_review_count: 3
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
  restrictions:
    allow_force_pushes: false
    allow_deletions: false
  # Additional: Require security review
```

#### **dev Branch**
```yaml
# Minimal protections for agile development
required_status_checks:
  - build  # Optional but encouraged
restrictions:
  allow_force_pushes: true  # Allow rapid development
  allow_deletions: false
```

---

## 📈 Metrics & KPIs

### **Branch Health Metrics**
- **Deployment Frequency**: How often each branch is deployed
- **Lead Time**: Time from feature start to production deployment
- **Change Failure Rate**: Percentage of deployments causing issues
- **Rollback Frequency**: How often rollbacks are needed

### **Quality Metrics**
- **Test Coverage**: Code coverage across branches
- **Security Scan Results**: Vulnerabilities found and fixed
- **Performance Benchmarks**: Performance regression detection
- **User Impact**: Real user metrics from each environment

---

## 🎯 Best Practices

### **Commit Guidelines**
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits atomic and focused
- Write clear commit messages explaining the change
- Reference issue numbers when applicable

### **Pull Request Guidelines**
- Provide clear description of changes
- Include screenshots for UI changes
- List any breaking changes
- Tag appropriate reviewers
- Ensure CI/CD checks pass before requesting review

### **Release Management**
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag releases from main branch
- Maintain changelog with release notes
- Communicate release schedules to stakeholders

---

## 🚨 Risk Mitigation

### **Branch Strategy Risks**
- **Stale Branches**: Regular cleanup of old feature branches
- **Merge Conflicts**: Keep branches synchronized regularly
- **Security Vulnerabilities**: Regular security scans on all branches
- **Deployment Failures**: Comprehensive testing before production deployment

### **Contingency Plans**
- **Branch Corruption**: Restore from main branch backup
- **Production Issues**: Immediate rollback to main branch
- **Security Breach**: Isolate affected branches and redeploy from clean state
- **Data Loss**: Regular backups and branch history preservation

---

## 📚 Related Documentation

- **[Deployment Guide](./README.md)** - Complete deployment procedures
- **[Testing Strategy](./TESTING_DEPLOYMENT_GUIDE.md)** - QA and testing procedures
- **[Security Procedures](../security/README.md)** - Security protocols and incident response
- **[Monitoring Setup](../monitoring/README.md)** - Production monitoring and alerting

---

## 👥 Team Responsibilities

### **Engineering Team**
- Maintain branch hygiene and protection rules
- Execute deployment procedures correctly
- Monitor branch health and performance
- Implement security best practices

### **DevOps Team**
- Configure and maintain CI/CD pipelines
- Monitor deployment success and failures
- Implement automated testing and security scans
- Maintain infrastructure for all environments

### **Security Team**
- Review branch protection configurations
- Conduct regular security assessments
- Approve security-related changes
- Monitor for security vulnerabilities

### **Product Team**
- Define release schedules and feature priorities
- Coordinate beta testing and user feedback
- Approve production deployments
- Monitor user impact of releases

---

## 📞 Support & Contacts

**Branch Strategy Questions**: engineering@echain.com
**Deployment Issues**: devops@echain.com
**Security Concerns**: security@echain.com
**Emergency Procedures**: emergency@echain.com

---

## ✅ Current Branch Status

**Active Branches:**
- `dev` - Active development (loose rules, agile workflow)
- `preview` - Beta releases (moderate protection)
- `main` - Stable releases (strict protection)
- `production` - Live deployment (maximum protection)

**Clean Remote Repository:**
- Removed old feature branches: `blockchain`, `frontend-maps`, `frontend-modification`, `polkadot&bridge`, `pre-fix`
- Only permanent branches remain on remote

**This branching strategy ensures stable, secure, and efficient development workflow while maintaining the highest standards of production reliability and user experience.**

<div align="center">

**🔄 Branch Flow**: `dev → preview → main → production`

**🛡️ Protection Level**: `dev < preview < main < production`

**🚀 Deployment Risk**: `dev > preview > main > production`

</div>
<parameter name="filePath">e:\Polymath Universata\Projects\Echain\docs\BRANCHING_STRATEGY.md