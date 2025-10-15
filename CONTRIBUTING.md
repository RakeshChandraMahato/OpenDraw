# Contributing to OpenDraw

Thank you for your interest in contributing to OpenDraw! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/OpenDraw.git`
3. Navigate to the tauri-app directory: `cd OpenDraw/tauri-app`
4. Install dependencies: `bun install`
5. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Rust (latest stable version)
- Bun (or npm/yarn)
- Node.js 18.x or higher

### Running the Development Server

```bash
bun run tauri:dev
```

This will start the Vite dev server and launch the Tauri window with hot-reload enabled.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Rust version, Node version)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- A clear description of the feature
- Why this feature would be useful
- Any implementation ideas you have

### Code Contributions

1. **Pick an issue** or create one to discuss your changes
2. **Create a branch** from `main` with a descriptive name
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit your changes** with clear commit messages
6. **Push to your fork** and create a pull request

## Coding Standards

### TypeScript/React

- Use TypeScript for all new code
- Follow the existing code style (we use Prettier)
- Use functional components and hooks
- Write meaningful variable and function names
- Add comments for complex logic

### Rust

- Follow Rust naming conventions
- Use `cargo fmt` to format your code
- Run `cargo clippy` to catch common mistakes
- Write documentation comments for public APIs

### File Organization

- Keep components in `src/components/`
- Keep utilities in appropriate subdirectories
- Keep Rust code in `src-tauri/src/`

## Commit Guidelines

We follow conventional commit messages:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(drawing): add new shape tool
fix(export): resolve PNG export issue on Windows
docs(readme): update installation instructions
```

## Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** if applicable
3. **Ensure all tests pass**: `bun test` (if tests exist)
4. **Build successfully**: `bun run build`
5. **Update CHANGELOG.md** with your changes
6. **Request review** from maintainers

### Pull Request Template

When creating a PR, include:

- **Description**: What does this PR do?
- **Related Issue**: Link to the issue (if any)
- **Type of Change**: Bug fix, feature, documentation, etc.
- **Testing**: How did you test this?
- **Screenshots**: If applicable

## Development Tips

### Debugging

- Use `console.log()` for frontend debugging
- Use `println!()` or `dbg!()` for Rust debugging
- Check the browser console for frontend errors
- Check the terminal for Rust errors

### Testing Locally

Before submitting a PR:

```bash
# Format code
bun run format  # (if available)

# Build the app
bun run build

# Test the production build
bun run tauri:build
```

### Common Issues

- **Build fails**: Try `cd src-tauri && cargo clean && cd ..`
- **Dependencies issue**: Delete `node_modules` and run `bun install`
- **Rust errors**: Update Rust with `rustup update`

## Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Reach out to the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to OpenDraw! 🎨
