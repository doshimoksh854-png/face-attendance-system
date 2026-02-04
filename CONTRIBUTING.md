# Contributing to Smart Face Attendance System

Thank you for your interest in contributing to this project! This document provides guidelines for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/face-attendance-system.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with a clear message: `git commit -m "Add: brief description of changes"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## 📋 Development Guidelines

### Code Style

**Python (Backend)**
- Follow PEP 8 style guide
- Use meaningful variable and function names
- Add docstrings to functions and classes
- Keep functions focused on a single responsibility

**JavaScript (Frontend)**
- Use ES6+ features
- Follow React best practices and hooks
- Use functional components over class components
- Keep components small and reusable

### Commit Messages

Use clear, descriptive commit messages:
- `Add: new feature or file`
- `Fix: bug fix`
- `Update: changes to existing functionality`
- `Refactor: code restructuring without changing behavior`
- `Docs: documentation updates`

Examples:
```
Add: geofencing support for attendance marking
Fix: face recognition accuracy in low light conditions
Update: improve error handling in auth routes
Refactor: simplify face encoding service
Docs: add API endpoint documentation
```

## 🧪 Testing

Before submitting a PR:

1. **Backend**: Run all tests
   ```bash
   cd backend
   python -m pytest
   ```

2. **Frontend**: Check for linting errors
   ```bash
   cd frontend
   npm run lint
   ```

3. **Manual Testing**: Test your changes in the browser
   - Test both student and teacher workflows
   - Verify face recognition works correctly
   - Check responsive design on different screen sizes

## 🐛 Reporting Bugs

When reporting bugs, include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: OS, browser, Python/Node version

## 💡 Suggesting Features

We welcome feature suggestions! Please:
- Check if the feature is already requested
- Explain the use case and benefits
- Provide examples or mockups if possible
- Consider backward compatibility

## 🔍 Pull Request Process

1. **Update Documentation**: Update README.md if you add features
2. **Test Thoroughly**: Ensure your changes don't break existing functionality
3. **Keep it Focused**: One feature/fix per PR
4. **Describe Changes**: Clearly explain what and why in the PR description
5. **Link Issues**: Reference related issues with `#issue-number`
6. **Be Patient**: Wait for code review and address feedback

## 📝 Code Review Checklist

Before submitting:
- [ ] Code follows project style guidelines
- [ ] Comments added for complex logic
- [ ] No sensitive data (API keys, passwords) committed
- [ ] Tests pass successfully
- [ ] Documentation updated
- [ ] No merge conflicts with main branch
- [ ] PR description is clear and complete

## 🛠️ Development Setup

See the main [README.md](../README.md) for detailed setup instructions.

## 📞 Questions?

If you have questions:
- Open a GitHub issue
- Tag it with `question` label
- Provide context and details

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Coding!** 🎉
