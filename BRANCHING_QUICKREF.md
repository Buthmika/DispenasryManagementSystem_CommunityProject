# Git Branching Quick Reference Card

## Branch Types & Naming

| Type | Naming Pattern | Example | Branch From | Merge To |
|------|---------------|---------|-------------|----------|
| **Main** | `main` | `main` | - | - |
| **Develop** | `develop` | `develop` | `main` | - |
| **Feature** | `feature/<description>` | `feature/patient-registration` | `develop` | `develop` |
| **Bugfix** | `bugfix/<description>` | `bugfix/login-validation` | `develop` | `develop` |
| **Release** | `release/<version>` | `release/1.0.0` | `develop` | `main` + `develop` |
| **Hotfix** | `hotfix/<version>` | `hotfix/1.0.1` | `main` | `main` + `develop` |

## Common Commands

### Create New Branch
```bash
# From develop (for features/bugfixes)
git checkout develop
git pull origin develop
git checkout -b feature/your-feature

# From main (for hotfixes)
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1
```

### Update Your Branch
```bash
# Option 1: Rebase (cleaner history)
git fetch origin
git rebase origin/develop

# Option 2: Merge
git fetch origin
git merge origin/develop
```

### Push Your Branch
```bash
git push origin feature/your-feature
```

### Switch Between Branches
```bash
git checkout branch-name
# or
git switch branch-name
```

### Delete Branch
```bash
# Local
git branch -d branch-name

# Remote
git push origin --delete branch-name
```

## Workflow Cheat Sheet

### New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR on GitHub: feature/new-feature → develop
```

### Bug Fix
```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-issue
# ... fix bug ...
git add .
git commit -m "fix: resolve issue"
git push origin bugfix/fix-issue
# Create PR on GitHub: bugfix/fix-issue → develop
```

### Hotfix
```bash
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1
# ... fix critical issue ...
git add .
git commit -m "fix: critical security patch"
git push origin hotfix/1.0.1
# Create PR on GitHub: hotfix/1.0.1 → main
# Then merge to develop as well
```

## Commit Message Format

```
<type>: <description>

Types:
  feat     - New feature
  fix      - Bug fix
  docs     - Documentation
  style    - Formatting
  refactor - Code restructuring
  test     - Adding tests
  chore    - Maintenance
```

**Examples:**
- `feat: add patient registration form`
- `fix: resolve login validation error`
- `docs: update branching guide`

## Useful Git Commands

```bash
# View all branches
git branch -a

# View current branch
git branch

# View branch history
git log --oneline --graph --all

# Stash changes
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View status
git status

# View differences
git diff

# Sync fork with upstream
git fetch upstream
git checkout develop
git merge upstream/develop
```

## Before Creating PR

✅ Code follows style guide  
✅ All tests pass  
✅ Documentation updated  
✅ Branch updated with latest changes  
✅ No debugging code left  
✅ Meaningful commit messages  

## PR Title Examples

✅ Good:
- "Add patient search feature"
- "Fix medication inventory calculation"
- "Update API documentation"

❌ Bad:
- "Updates"
- "Fixed stuff"
- "Changes"

## Branch Naming Tips

✅ **DO:**
- `feature/patient-records`
- `bugfix/login-error`
- `hotfix/security-patch`

❌ **DON'T:**
- `feature/patient records` (no spaces)
- `fix` (too vague)
- `my-branch-for-adding-feature` (too long)

## Keeping Branch Clean

```bash
# Update from develop regularly
git checkout feature/your-feature
git fetch origin
git rebase origin/develop

# Squash commits before merging (if needed)
git rebase -i HEAD~3

# Force push after rebase (only on your branch!)
git push --force-with-lease origin feature/your-feature
```

## Common Issues & Solutions

**Merge conflict:**
```bash
git fetch origin
git merge origin/develop
# Fix conflicts in files
git add .
git commit -m "resolve merge conflicts"
```

**Wrong branch:**
```bash
git stash
git checkout correct-branch
git stash pop
```

**Committed to wrong branch:**
```bash
git log  # copy commit hash
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1
```

## Resources

- Full Guide: [BRANCHING_GUIDE.md](BRANCHING_GUIDE.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Git Docs: https://git-scm.com/doc

---

📌 **Pin this card for quick reference!**
