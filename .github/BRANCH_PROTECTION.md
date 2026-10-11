# Branch Protection Rules

This document outlines the branch protection rules and policies in place for the Event Loop Visualiser repository.

## 🛡️ Protected Branches

### Main Branch (`main`)

The `main` branch is protected with the following rules:

#### Required Status Checks

All of the following checks must pass before merging:

-   ✅ **Code Linting** - ESLint validation
-   ✅ **Type Checking** - TypeScript compilation
-   ✅ **Unit Tests** - Vitest test suite
-   ✅ **Build Verification** - Production build success
-   ✅ **Security Audit** - Dependency vulnerability scan
-   ✅ **Quality Metrics** - Coverage and performance checks

#### Pull Request Requirements

-   📋 **Required Reviews**: Minimum 1 approving review
-   🔄 **Dismiss Stale Reviews**: New commits dismiss previous approvals
-   👥 **Code Owner Review**: Required for protected files (see CODEOWNERS)
-   💬 **Conversation Resolution**: All review conversations must be resolved

#### Restrictions

-   🚫 **No Direct Pushes**: All changes must go through pull requests
-   🚫 **No Force Pushes**: Cannot rewrite history on protected branch
-   🚫 **No Branch Deletion**: Main branch cannot be deleted
-   ⚡ **Up-to-date Required**: Branch must be up-to-date before merging

## 🚀 Workflow for Contributors

### 1. Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
# Make your changes
git add .
git commit -m "feat: add new feature"
```

### 3. Push and Create PR

```bash
git push origin feature/your-feature-name
# Then create PR through GitHub interface
```

### 4. Automated Checks

Once you create a PR, the following will happen automatically:

-   🤖 CI/CD pipeline runs all required checks
-   📋 PR template guides you through the submission
-   👥 Code owners are automatically requested for review
-   ✅ Status checks must pass before merge is allowed

## 🔧 Repository Settings

### Branch Protection Configuration

```yaml
Required status checks:
    - PR Checks / 🧪 PR Test Suite (lint)
    - PR Checks / 🧪 PR Test Suite (type-check)
    - PR Checks / 🧪 PR Test Suite (test)
    - PR Checks / 🧪 PR Test Suite (build)
    - PR Checks / 🔒 Security Check
    - PR Checks / 📊 Quality Metrics

Pull request reviews:
    - Required approving reviews: 1
    - Dismiss stale reviews: true
    - Require code owner reviews: true

Other restrictions:
    - Enforce restrictions for admins: false
    - Allow force pushes: false
    - Allow deletions: false
    - Require conversation resolution: true
```

### Code Owners

The following files require review from code owners:

-   All source code (`/src/`)
-   GitHub workflows (`/.github/`)
-   Configuration files (`package.json`, `tsconfig.json`, etc.)
-   Documentation (`*.md`, `/docs/`)

See [CODEOWNERS](.github/CODEOWNERS) for complete list.

## 🚨 Direct Push Prevention

### Automated Prevention

-   🚫 GitHub Actions workflow blocks direct pushes to main
-   📧 Email notifications sent for any attempt
-   🔍 Audit log tracks all push attempts

### What Happens on Direct Push?

1. **Workflow Triggers**: `prevent-direct-push.yml` runs
2. **Build Fails**: Intentional failure with helpful message
3. **Email Notification**: Repository admins are notified
4. **Audit Trail**: Action is logged for security review

### Recovery from Accidental Push

If you accidentally push directly to main:

```bash
# 1. Create a branch from the commit
git checkout -b fix/accidental-push

# 2. Reset main to previous state (admin only)
git checkout main
git reset --hard HEAD~1
git push --force-with-lease origin main

# 3. Create proper PR from the branch
git checkout fix/accidental-push
git push origin fix/accidental-push
# Then create PR through GitHub
```

## 📞 Getting Help

### Common Issues

**Q: My PR checks are failing**

-   Check the Actions tab for detailed error messages
-   Ensure all tests pass locally: `npm test`
-   Run linting: `npm run lint`
-   Check TypeScript: `npm run type-check`

**Q: I need to bypass branch protection**

-   Branch protection should rarely be bypassed
-   Contact repository maintainers for emergency situations
-   Document the reason in the audit trail

**Q: How do I become a code owner?**

-   Contribute regularly to the project
-   Demonstrate expertise in specific areas
-   Be nominated by existing maintainers

### Support Channels

-   🐛 **Bug Reports**: Use issue templates
-   💬 **Questions**: GitHub Discussions
-   🔧 **Technical Issues**: Contact @Nathishwar-prog

## 🔄 Updating Protection Rules

### Manual Updates

Repository administrators can update protection rules via:

1. GitHub Settings → Branches → Branch protection rules
2. Edit protection rule for `main` branch
3. Update required status checks as workflows change

### Automated Updates

The `branch-protection.yml` workflow can be used to apply standardized rules:

```bash
# Run from Actions tab with manual trigger
# Set dry_run: true to preview changes
```

## 📚 Best Practices

### For Contributors

-   ✅ Always work in feature branches
-   ✅ Write descriptive commit messages
-   ✅ Add tests for new functionality
-   ✅ Update documentation as needed
-   ✅ Keep PRs focused and small
-   ✅ Respond to review feedback promptly

### For Reviewers

-   ✅ Review code thoroughly
-   ✅ Test changes locally when needed
-   ✅ Provide constructive feedback
-   ✅ Approve only when fully satisfied
-   ✅ Ensure all conversations are resolved

### For Maintainers

-   ✅ Keep protection rules up-to-date
-   ✅ Monitor failed direct push attempts
-   ✅ Review and update CODEOWNERS regularly
-   ✅ Document any rule changes
-   ✅ Train new contributors on workflows

---

_This document is part of the Event Loop Visualiser project governance. For questions or suggestions, please open an issue or discussion._
