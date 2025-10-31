# Branch Management Guide

## Overview
This guide explains the branching strategy for the Dispensary Management System project. Following these guidelines will help maintain a clean, organized repository and streamline collaboration.

## Branch Structure

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protected**: Yes
- **Merges from**: `release/*` and `hotfix/*` branches only
- **Naming**: Always named `main`
- **Description**: This branch contains stable, tested code that is ready for production deployment.

#### `develop`
- **Purpose**: Integration branch for features
- **Protected**: Yes (recommended)
- **Merges from**: `feature/*` branches
- **Merges to**: `release/*` branches
- **Naming**: Always named `develop`
- **Description**: The latest development changes for the next release. Features are merged here for integration testing.

### Supporting Branches

#### Feature Branches
- **Purpose**: Develop new features for upcoming releases
- **Naming Convention**: `feature/<short-description>`
  - Examples:
    - `feature/patient-registration`
    - `feature/prescription-management`
    - `feature/inventory-tracking`
- **Branches from**: `develop`
- **Merges to**: `develop`
- **Lifetime**: Temporary (delete after merge)

#### Bugfix Branches
- **Purpose**: Fix bugs found during development or testing
- **Naming Convention**: `bugfix/<short-description>`
  - Examples:
    - `bugfix/login-validation`
    - `bugfix/medication-search`
- **Branches from**: `develop`
- **Merges to**: `develop`
- **Lifetime**: Temporary (delete after merge)

#### Release Branches
- **Purpose**: Prepare for a new production release
- **Naming Convention**: `release/<version>`
  - Examples:
    - `release/1.0.0`
    - `release/1.1.0`
- **Branches from**: `develop`
- **Merges to**: `main` AND `develop`
- **Lifetime**: Temporary (delete after merge)
- **Activities**: Bug fixes, documentation, version bumps (no new features)

#### Hotfix Branches
- **Purpose**: Quickly patch production issues
- **Naming Convention**: `hotfix/<version>` or `hotfix/<short-description>`
  - Examples:
    - `hotfix/1.0.1`
    - `hotfix/critical-security-patch`
- **Branches from**: `main`
- **Merges to**: `main` AND `develop`
- **Lifetime**: Temporary (delete after merge)

## Workflow Examples

### Working on a New Feature

1. **Create feature branch from develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/patient-registration
   ```

2. **Develop and commit your changes**:
   ```bash
   git add .
   git commit -m "Add patient registration form"
   ```

3. **Push your branch**:
   ```bash
   git push origin feature/patient-registration
   ```

4. **Create Pull Request**:
   - Open PR from `feature/patient-registration` to `develop`
   - Request reviews from team members
   - Address feedback and update PR

5. **After merge, delete branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/patient-registration
   ```

### Fixing a Bug

1. **Create bugfix branch from develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b bugfix/login-validation
   ```

2. **Fix the bug and commit**:
   ```bash
   git add .
   git commit -m "Fix login validation for special characters"
   ```

3. **Push and create PR to develop**:
   ```bash
   git push origin bugfix/login-validation
   ```

### Preparing a Release

1. **Create release branch from develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/1.0.0
   ```

2. **Update version numbers and fix any last-minute bugs**:
   ```bash
   # Update package.json version
   git add .
   git commit -m "Bump version to 1.0.0"
   ```

3. **Merge to main**:
   ```bash
   git checkout main
   git merge --no-ff release/1.0.0
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin main --tags
   ```

4. **Merge back to develop**:
   ```bash
   git checkout develop
   git merge --no-ff release/1.0.0
   git push origin develop
   ```

5. **Delete release branch**:
   ```bash
   git branch -d release/1.0.0
   ```

### Creating a Hotfix

1. **Create hotfix branch from main**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/1.0.1
   ```

2. **Fix the critical issue**:
   ```bash
   git add .
   git commit -m "Fix critical security vulnerability"
   ```

3. **Merge to main**:
   ```bash
   git checkout main
   git merge --no-ff hotfix/1.0.1
   git tag -a v1.0.1 -m "Hotfix version 1.0.1"
   git push origin main --tags
   ```

4. **Merge to develop**:
   ```bash
   git checkout develop
   git merge --no-ff hotfix/1.0.1
   git push origin develop
   ```

5. **Delete hotfix branch**:
   ```bash
   git branch -d hotfix/1.0.1
   ```

## Branch Naming Best Practices

### DO:
- Use lowercase letters
- Use hyphens to separate words: `feature/patient-records`
- Keep names short but descriptive
- Include issue/ticket numbers when applicable: `feature/issue-123-medication-alerts`

### DON'T:
- Use spaces: ❌ `feature/patient records`
- Use special characters (except hyphens and slashes): ❌ `feature/patient_records#1`
- Create overly long names: ❌ `feature/add-the-ability-for-users-to-register-new-patients`
- Use ambiguous names: ❌ `feature/fix` or `feature/update`

## Pull Request Guidelines

1. **Always create a PR** - Never push directly to `main` or `develop`
2. **Provide clear description** - Explain what changes were made and why
3. **Link related issues** - Reference issue numbers (e.g., "Closes #123")
4. **Request reviews** - Get at least one approval before merging
5. **Keep PRs focused** - One feature/fix per PR
6. **Update your branch** - Rebase or merge latest changes from target branch
7. **Run tests** - Ensure all tests pass before requesting review

## Keeping Your Branch Up to Date

### Using Rebase (Recommended for feature branches)
```bash
git checkout feature/your-feature
git fetch origin
git rebase origin/develop
```

### Using Merge
```bash
git checkout feature/your-feature
git fetch origin
git merge origin/develop
```

## Cleaning Up Branches

### Delete local branches
```bash
# Delete a single branch
git branch -d feature/patient-registration

# Delete all merged branches
git branch --merged | grep -v "\*" | grep -v "main" | grep -v "develop" | xargs -n 1 git branch -d
```

### Delete remote branches
```bash
git push origin --delete feature/patient-registration
```

## Tips and Tricks

1. **Check current branch**: `git branch` or `git status`
2. **List all branches**: `git branch -a`
3. **Switch branches**: `git checkout branch-name` or `git switch branch-name`
4. **Create and switch**: `git checkout -b new-branch` or `git switch -c new-branch`
5. **See branch history**: `git log --oneline --graph --all`
6. **Stash changes**: `git stash` (when you need to switch branches with uncommitted changes)
7. **Apply stashed changes**: `git stash pop`

## Visual Workflow Diagram

```
main          ●─────────────●─────────────●
                             ↑             ↑
                             │             │
release                      ●─────────────┘
                             ↑
                             │
develop       ●─────●────────●────●────────●
              │     ↑             ↑        
              │     │             │        
feature       └────●──────────────┘        
                   feature/xyz              
```

## Common Questions

### Q: When should I create a new branch?
**A**: Always create a new branch when starting work on a new feature, bug fix, or any changes. Never work directly on `main` or `develop`.

### Q: How often should I push my branch?
**A**: Push regularly (at least daily) to backup your work and make it visible to the team.

### Q: What if my branch conflicts with develop?
**A**: Update your branch with the latest changes from `develop` (via rebase or merge) and resolve conflicts locally before creating/updating your PR.

### Q: Can I delete a branch after merging?
**A**: Yes! After a branch is successfully merged, it should be deleted to keep the repository clean.

### Q: Should I work on multiple features in one branch?
**A**: No. Keep each branch focused on a single feature or fix. This makes reviews easier and reduces merge conflicts.

## Additional Resources

- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Angular Contribution Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md)

## Getting Help

If you have questions about branching strategy or encounter issues:
1. Check this guide first
2. Ask in project discussions or team chat
3. Reach out to project maintainers

Remember: A well-organized branch structure makes collaboration easier and the project more maintainable!
