# Next.js Template

A modern, production-ready Next.js template with built-in best practices and development tools for team collaboration.

## 🚀 Features

- ⚡️ **Next.js 15** with App Router and React 19
- 🎨 **Tailwind CSS** for styling with modern CSS
- 📝 **TypeScript** for type safety
- 🎯 **ESLint** + **Prettier** with comprehensive rules for code quality
- 🐶 **Husky** for Git hooks and automated quality checks
- 📦 **Conventional Commits** with automated validation
- 🔍 **TypeScript** type checking in pre-commit hooks
- 🎪 **lint-staged** for optimized pre-commit processing
- 📚 **Comprehensive Development Guide** with team best practices

## 📖 Documentation

- **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Comprehensive coding standards, ESLint rules, and best practices
- **[Getting Started](#development-setup)** - Quick setup instructions below

## 🛠 Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd next-template
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

## 📝 Development Guidelines

> **📚 For comprehensive coding standards, ESLint rules, and best practices, see our [Development Guide](./DEVELOPMENT_GUIDE.md)**

### Quick Reference

- **File Naming**: Use kebab-case for all files in `app/` and `components/` folders
- **Imports**: Automatically organized by ESLint (external → internal → relative)
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) format
- **Pre-commit**: ESLint, Prettier, and TypeScript checking runs automatically

### Code Style

- We use Prettier for code formatting
- ESLint for code linting with 40+ quality rules
- TypeScript for type safety
- Follow the component structure in `/components`
- Use proper TypeScript types for all components and functions

## 📝 Development Guidelines

### Git Workflow

1. Create a new branch for your feature/fix

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes following our code style guidelines

3. Commit your changes using conventional commits

   ```bash
   git commit -m "feat: add new feature"
   ```

4. Push your changes and create a pull request

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks

## 📚 Project Structure

```
├── app/           # Next.js app directory
├── components/    # Reusable components
├── lib/           # Utility functions and shared logic
│   └── types/       # TypeScript type definitions
├── public/        # Static assets
└── tests/         # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
