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

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🧪 Testing

This project includes a comprehensive testing setup:

- **Unit Tests**: `bun run test`
- **Component Tests**: Included in unit tests
- **E2E Tests**: `bun run test:e2e`
- **Test Coverage**: `bun run test:coverage`

## 🚀 CI/CD Pipeline

This project includes comprehensive GitHub Actions workflows for quality assurance and deployment:

### 📋 **PR Quality Checks** (`.github/workflows/pr-checks.yml`)

Runs on every pull request:

- ✅ **Code Quality**: ESLint, Prettier, TypeScript checking
- 🧪 **Unit & Integration Tests**: Vitest with coverage reporting
- 🎭 **End-to-End Tests**: Playwright across multiple browsers
- 🔒 **Security Scanning**: Dependency audits and vulnerability checks
- 💬 **Automated PR Comments**: Summary of all check results

### 🔒 **Main Branch Deploy** (`.github/workflows/main-deploy.yml`)

Runs on merges to main (more strict):

- 🔒 **Strict Quality Gates**: All checks must pass (no warnings allowed)
- 📊 **Coverage Requirements**: Enforces minimum test coverage thresholds
- 🌐 **Cross-Browser E2E**: Tests on Chromium, Firefox, and WebKit
- ⚡ **Performance Audit**: Lighthouse CI with performance budgets
- 🛡️ **Advanced Security**: Enhanced vulnerability scanning
- 📦 **Build & Deploy**: Production build and deployment automation
- ✅ **Post-Deploy Validation**: Health checks and smoke tests
- 📢 **Team Notifications**: Slack alerts for deployment status

### 🤖 **Dependency Management**

- **Dependabot**: Automated dependency updates grouped by category
- **Security Monitoring**: Automatic vulnerability detection and alerts

### 📊 **Quality Gates**

- **Code Coverage**: 80% minimum (configurable)
- **Performance**: Lighthouse scores (Performance: 80%, Accessibility: 90%)
- **Security**: No high/critical vulnerabilities allowed
- **Type Safety**: Zero TypeScript errors in production

## 📋 Development Guidelines

For detailed development guidelines, code style, testing practices, and team conventions, see our [Development Guide](./DEVELOPMENT_GUIDE.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
