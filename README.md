# Dispensary Management System - Community Project

A modern, web-based dispensary management system built with Angular to streamline pharmaceutical operations, patient management, and inventory control.

## 🌟 Project Overview

This is a community-driven project aimed at creating a comprehensive dispensary management solution. The system helps manage:
- Patient registration and records
- Prescription management
- Medication inventory
- Dispensing operations
- Reporting and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Angular CLI v20.3.8

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Buthmika/DispenasryManagementSystem_CommunityProject.git
   cd DispenasryManagementSystem_CommunityProject/dispenaryManagementSystem
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:4200/`

## 📚 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Complete guide for contributing to the project
- **[BRANCHING_GUIDE.md](BRANCHING_GUIDE.md)** - Detailed branching strategy and workflow
- **[README.md](dispenaryManagementSystem/README.md)** - Angular project documentation

## 🌿 Branch Strategy

We use a structured Git branching model to manage development:

### Main Branches
- **`main`** - Production-ready code
- **`develop`** - Integration branch for features

### Supporting Branches
- **`feature/*`** - New features (e.g., `feature/patient-registration`)
- **`bugfix/*`** - Bug fixes (e.g., `bugfix/login-validation`)
- **`hotfix/*`** - Critical production fixes (e.g., `hotfix/1.0.1`)
- **`release/*`** - Release preparation (e.g., `release/1.0.0`)

📖 **See [BRANCHING_GUIDE.md](BRANCHING_GUIDE.md) for complete details and examples.**

## 🤝 How to Contribute

We welcome contributions from the community! Here's how to get started:

1. **Read the guides**:
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
   - [BRANCHING_GUIDE.md](BRANCHING_GUIDE.md) - Branch management

2. **Fork the repository**

3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** following our coding standards

5. **Test your changes**:
   ```bash
   npm test
   npm run build
   ```

6. **Submit a Pull Request**

## 🛠️ Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run unit tests
npm test

# Run tests in watch mode
npm run watch

# Run Angular CLI commands
npm run ng -- <command>
```

## 📋 Project Structure

```
DispenasryManagementSystem_CommunityProject/
├── BRANCHING_GUIDE.md          # Branch management guide
├── CONTRIBUTING.md              # Contribution guidelines
├── README.md                    # This file
└── dispenaryManagementSystem/   # Angular application
    ├── src/                     # Source files
    │   ├── app/                # Application components
    │   ├── assets/             # Static assets
    │   └── index.html          # Main HTML file
    ├── angular.json            # Angular configuration
    ├── package.json            # Dependencies and scripts
    └── README.md               # Angular project README
```

## 🎯 Development Guidelines

### Code Standards
- Follow [Angular Style Guide](https://angular.dev/style-guide)
- Use TypeScript strict mode
- Write meaningful tests for new features
- Format code with Prettier (configured in package.json)

### Commit Message Format
```
<type>: <short description>

Examples:
feat: add patient search functionality
fix: resolve medication inventory bug
docs: update API documentation
```

### Pull Request Process
1. Create a feature branch from `develop`
2. Make your changes with clear commits
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR to `develop` branch
6. Request reviews from maintainers

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --code-coverage

# Build project
npm run build
```

## 🔒 Security

- Never commit sensitive information (API keys, passwords, etc.)
- Follow security best practices
- Report security vulnerabilities privately to maintainers

## 📞 Getting Help

- **Documentation**: Check our guides in this repository
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Maintainers**: Contact project maintainers for help

## 🗺️ Roadmap

### Phase 1 - Foundation
- [ ] Patient registration and management
- [ ] User authentication and authorization
- [ ] Basic inventory tracking

### Phase 2 - Core Features
- [ ] Prescription management
- [ ] Medication dispensing workflow
- [ ] Search and filtering capabilities

### Phase 3 - Advanced Features
- [ ] Reporting and analytics
- [ ] Notification system
- [ ] Integration with external systems

### Phase 4 - Enhancement
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Advanced security features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

Thanks to all contributors who help make this project better!

## 🙏 Acknowledgments

- Angular team for the excellent framework
- Community contributors
- All supporters of this project

---

## Quick Links

- [Report a Bug](../../issues/new?labels=bug)
- [Request a Feature](../../issues/new?labels=enhancement)
- [View Issues](../../issues)
- [Pull Requests](../../pulls)

---

**Ready to contribute?** Start by reading our [CONTRIBUTING.md](CONTRIBUTING.md) guide! 🚀
