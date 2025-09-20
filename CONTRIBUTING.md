# Contributing to TDL - Secure To-Do List Application

Thank you for your interest in contributing to TDL! We welcome contributions from the community and are pleased to have you join us.

## 🤝 How to Contribute

### **Types of Contributions**
- 🐛 **Bug Reports** - Help us identify and fix issues
- ✨ **Feature Requests** - Suggest new functionality
- 🔧 **Code Contributions** - Submit bug fixes or new features  
- 📚 **Documentation** - Improve our docs and guides
- 🔒 **Security** - Report security vulnerabilities responsibly

## 🚀 Getting Started

### **1. Fork the Repository**
1. Fork the TDL repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/TDL.git
cd TDL
```

### **2. Set Up Development Environment**
1. Install Node.js (v16 or higher)
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and configure your environment
4. Set up Google OAuth credentials (see README.md)

### **3. Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
# or  
git checkout -b security/vulnerability-fix
```

## 📋 Development Guidelines

### **Code Style**
- Use **2 spaces** for indentation
- Use **semicolons** at the end of statements
- Use **camelCase** for variable and function names
- Use **PascalCase** for class names
- Write **descriptive variable names**
- Add **comments** for complex logic

### **Security Guidelines**
- **Never commit** sensitive data (passwords, API keys, secrets)
- **Always validate** user input on the server side
- **Use parameterized queries** to prevent SQL injection
- **Implement proper authentication** for protected routes
- **Follow OWASP** security best practices
- **Test security controls** before submitting

### **Commit Messages**
Use clear, descriptive commit messages:
```bash
# Good examples
git commit -m "Add user input validation for task creation"
git commit -m "Fix XSS vulnerability in task display"
git commit -m "Update authentication middleware to handle edge cases"

# Avoid
git commit -m "fix stuff"
git commit -m "update"
```

## 🧪 Testing

### **Before Submitting**
1. **Test your changes** thoroughly
2. **Run security audit**:
```bash
npm audit
```
3. **Test authentication flows**:
   - Login/logout functionality
   - Protected route access
   - Role-based permissions
4. **Test all CRUD operations**:
   - Create, read, update, delete tasks
   - Admin dashboard functionality
5. **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
6. **Mobile responsiveness** testing

### **Security Testing**
- Test for **XSS vulnerabilities**
- Verify **authentication bypass** protection
- Check **authorization controls**
- Test **input validation**
- Verify **CSRF protection**

## 📝 Pull Request Process

### **1. Before Creating PR**
- [ ] Code follows our style guidelines
- [ ] All tests pass
- [ ] Security audit shows no new vulnerabilities
- [ ] Documentation updated (if needed)
- [ ] Changes tested in multiple browsers

### **2. Create Pull Request**
1. **Push your branch** to your fork:
```bash
git push origin feature/your-feature-name
```
2. **Create a Pull Request** on GitHub
3. **Fill out the PR template** completely

### **3. PR Title and Description**
**Title Format:**
- `Feature: Add task category filtering`
- `Bugfix: Fix logout redirect issue`
- `Security: Patch XSS vulnerability in comments`
- `Docs: Update installation instructions`

**Description should include:**
- **What** changes were made
- **Why** the changes were necessary
- **How** to test the changes
- **Screenshots** (for UI changes)
- **Security impact** (if applicable)

### **4. PR Review Process**
- PRs require **at least one review**
- **Security-related PRs** require additional security review
- Address **all feedback** before merge
- Keep PRs **focused and small** when possible

## 🐛 Bug Reports

### **Before Reporting**
1. **Search existing issues** to avoid duplicates
2. **Test with latest version**
3. **Try reproducing** in different browsers

### **Bug Report Template**
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g. Windows 10, macOS, Ubuntu]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node.js version: [e.g. 16.14.0]
- App version: [e.g. 1.0.0]

**Screenshots**
Add screenshots if applicable

**Additional Context**
Any other relevant information
```

## ✨ Feature Requests

### **Feature Request Template**
```markdown
**Feature Description**
Clear description of the feature

**Problem it Solves**
What problem does this feature address?

**Proposed Solution**
How would you like this feature to work?

**Alternative Solutions**
Other ways to solve this problem

**Use Cases**
Who would benefit from this feature?

**Implementation Ideas**
Technical suggestions (optional)
```

## 🔒 Security Vulnerabilities

**IMPORTANT:** Do NOT create public issues for security vulnerabilities!

### **Responsible Disclosure**
1. **Email us directly**: [security@example.com]
2. **Include details**: Description, impact, reproduction steps
3. **Wait for response** before public disclosure
4. **Allow time** for fix development and testing

See our [SECURITY.md](SECURITY.md) for complete security policy.

## 📚 Documentation

### **Documentation Contributions**
- **README updates** - Installation, usage, features
- **Code comments** - Explain complex logic
- **API documentation** - Endpoint descriptions
- **Security documentation** - Security features and practices
- **Tutorial content** - Step-by-step guides

### **Documentation Style**
- Use **clear, simple language**
- Include **code examples**
- Add **screenshots** for UI features
- Keep **up-to-date** with code changes

## 🎯 Priority Areas

We especially welcome contributions in these areas:

### **High Priority**
- 🔒 **Security improvements** and vulnerability fixes
- 🐛 **Bug fixes** for reported issues
- 📱 **Mobile responsiveness** improvements
- ♿ **Accessibility** enhancements

### **Medium Priority**
- ✨ **New features** from our roadmap
- 🎨 **UI/UX improvements**
- 📊 **Performance optimizations**
- 🧪 **Test coverage** improvements

### **Future Features**
- 🗄️ **Database integration** (MongoDB)
- 🔔 **Real-time notifications**
- 📅 **Due dates and reminders**
- 👥 **Team collaboration features**
- 📱 **Mobile app version**

## 💬 Communication

### **Getting Help**
- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Email** - For security issues and private matters

### **Community Guidelines**
- Be **respectful** and **inclusive**
- **Help others** when you can
- **Stay on topic** in discussions
- **Follow** our Code of Conduct

## 🏆 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **GitHub contributors** page
- **Release notes** for significant contributions
- **Security hall of fame** for security researchers

## 📄 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful** of different viewpoints and experiences
- **Accept constructive criticism** gracefully
- **Focus on what's best** for the community
- **Show empathy** towards other community members

## 📞 Questions?

If you have questions about contributing:

1. **Check existing documentation** first
2. **Search closed issues** for similar questions
3. **Create a GitHub Discussion** for general questions
4. **Email us** for private matters

---

**Thank you for contributing to TDL! Your help makes this project better for everyone.** 🙏
