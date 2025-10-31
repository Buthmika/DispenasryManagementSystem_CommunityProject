# Contributing to Dispensary Management System

Thank you for your interest in contributing to the Dispensary Management System! This document provides guidelines for contributing to the project.

## Table of Contents
- [Getting Started](#getting-started)
- [Branch Management](#branch-management)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git
- Angular CLI (`npm install -g @angular/cli`)

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/DispenasryManagementSystem_CommunityProject.git
   cd DispenasryManagementSystem_CommunityProject/dispenaryManagementSystem
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Buthmika/DispenasryManagementSystem_CommunityProject.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run development server**:
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200/`

## Branch Management

We follow a structured branching strategy to maintain code quality and streamline collaboration.

📖 **Please read our comprehensive [BRANCHING_GUIDE.md](BRANCHING_GUIDE.md)** for detailed information on:
- Branch structure (main, develop, feature, bugfix, release, hotfix)
- Naming conventions
- Workflow examples
- Best practices

### Quick Reference

- **Feature**: `feature/short-description` (branch from `develop`)
- **Bugfix**: `bugfix/short-description` (branch from `develop`)
- **Hotfix**: `hotfix/short-description` (branch from `main`)
- **Release**: `release/version` (branch from `develop`)

## Development Workflow

1. **Sync with upstream**:
   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. **Create a new branch** (see [BRANCHING_GUIDE.md](BRANCHING_GUIDE.md)):
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**:
   - Write code following our coding standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Run tests and linting**:
   ```bash
   npm test
   npm run build
   ```

5. **Commit your changes** (see [Commit Messages](#commit-messages)):
   ```bash
   git add .
   git commit -m "Add patient registration feature"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## Code Standards

### Angular Style Guide
Follow the [Angular Style Guide](https://angular.dev/style-guide) for all Angular-specific code.

### TypeScript Guidelines
- Use TypeScript strict mode
- Provide type annotations for function parameters and return types
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object structures

### Code Formatting
This project uses Prettier for code formatting. Configuration is in `package.json`.

```bash
# Format code automatically (if configured)
npx prettier --write "src/**/*.{ts,html,css,scss}"
```

### File Naming Conventions
- Components: `patient-list.component.ts`
- Services: `medication.service.ts`
- Models: `prescription.model.ts`
- Modules: `admin.module.ts`

### Component Structure
```typescript
// 1. Imports
import { Component } from '@angular/core';

// 2. Component decorator
@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
// 3. Component class
export class PatientListComponent {
  // Properties
  patients: Patient[] = [];
  
  // Constructor
  constructor(private patientService: PatientService) {}
  
  // Lifecycle hooks
  ngOnInit(): void {
    this.loadPatients();
  }
  
  // Methods
  loadPatients(): void {
    // Implementation
  }
}
```

## Commit Messages

Write clear, concise commit messages that explain what changed and why.

### Format
```
<type>: <short description>

<optional detailed description>

<optional footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Good commit messages
git commit -m "feat: add patient registration form"
git commit -m "fix: resolve medication search validation issue"
git commit -m "docs: update API documentation for prescription service"
git commit -m "refactor: simplify inventory calculation logic"

# Bad commit messages (avoid these)
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "changes"
```

### Detailed Example
```
feat: add patient registration feature

- Created patient registration form component
- Added form validation for required fields
- Integrated with patient service API
- Added unit tests for form validation

Closes #42
```

## Pull Request Process

### Before Creating a PR

1. ✅ Ensure your code follows the coding standards
2. ✅ Run all tests and ensure they pass
3. ✅ Update documentation if needed
4. ✅ Rebase on the latest `develop` branch
5. ✅ Remove any debugging code or console.logs

### Creating a PR

1. **Use a clear title**: 
   - Good: "Add patient search functionality"
   - Bad: "Updates"

2. **Provide detailed description**:
   ```markdown
   ## Description
   Added patient search feature with filters for name, ID, and date.
   
   ## Changes Made
   - Created search component
   - Added search service with API integration
   - Implemented filters for multiple criteria
   - Added unit tests
   
   ## Testing
   - Tested search with various input combinations
   - Verified filter functionality
   - Confirmed API integration works correctly
   
   ## Screenshots
   [Add screenshots if UI changes]
   
   Closes #123
   ```

3. **Link related issues**: Use "Closes #123" or "Fixes #123"

4. **Request reviewers**: Tag relevant team members

5. **Respond to feedback**: Address comments and questions promptly

### PR Review Guidelines

When reviewing others' PRs:
- Be constructive and respectful
- Test the changes locally if possible
- Check for code quality and adherence to standards
- Verify tests are included and passing
- Approve only when you're confident the code is ready

## Reporting Issues

### Bug Reports

Use the issue tracker to report bugs. Include:
- **Clear title**: Describe the bug concisely
- **Description**: What happened vs. what you expected
- **Steps to reproduce**: Numbered steps to reproduce the issue
- **Environment**: Browser, OS, Angular version
- **Screenshots**: If applicable
- **Error messages**: Console errors or stack traces

**Template**:
```markdown
**Bug Description**
The patient search returns incorrect results when filtering by date.

**Steps to Reproduce**
1. Navigate to patient search page
2. Select date filter
3. Choose date range: 01/01/2024 - 01/31/2024
4. Click search

**Expected Behavior**
Should return patients registered in January 2024

**Actual Behavior**
Returns all patients regardless of date

**Environment**
- Browser: Chrome 120
- OS: Windows 11
- Angular: 20.3.0

**Screenshots**
[Attach screenshot]
```

### Feature Requests

- **Describe the feature**: What functionality do you want?
- **Use case**: Why is this feature needed?
- **Possible implementation**: Any ideas on how to implement it?
- **Alternatives**: Have you considered other solutions?

## Testing

### Running Tests
```bash
# Unit tests
npm test

# Build project
npm run build
```

### Writing Tests
- Write tests for all new features
- Ensure tests are meaningful and test actual functionality
- Follow existing test patterns in the codebase
- Aim for good code coverage

### Test Example
```typescript
describe('PatientService', () => {
  let service: PatientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all patients', () => {
    // Test implementation
  });
});
```

## Communication

- **Be respectful**: Treat all contributors with respect
- **Be patient**: Everyone has different experience levels
- **Be helpful**: Offer assistance to others when you can
- **Ask questions**: If something is unclear, ask!

## Code of Conduct

- Be inclusive and welcoming
- Show empathy towards others
- Give and receive constructive feedback gracefully
- Focus on what's best for the community
- Respect differing viewpoints and experiences

## Recognition

All contributors will be recognized in our project. Thank you for helping make this project better!

## Questions?

If you have any questions not covered here:
1. Check existing documentation
2. Search closed issues
3. Open a new discussion
4. Contact project maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the Dispensary Management System! 🎉
