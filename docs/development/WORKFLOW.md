# 🛠️ Development Workflow

This guide covers the complete development workflow from environment setup to quality assurance, including scripts, conventions, and team practices for our Next.js application.

> **New to the stack?** This guide assumes basic familiarity with JavaScript, React, and command line tools. Check our [tech stack overview](../README.md#🛠️-technology-stack) for resource links to learn these technologies.

## 🚀 Quick Start

### **Prerequisites**

Before you begin, make sure you have these tools installed:

- **[Node.js 18+](https://nodejs.org/en/download/)** - JavaScript runtime
  - 💡 **Tip**: Use [nvm](https://github.com/nvm-sh/nvm) (Mac/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage Node versions
- **[Bun](https://bun.sh/docs/installation)** - Fast package manager and runtime
  - Alternative: You can use [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [yarn](https://yarnpkg.com/getting-started/install) if preferred
- **[PostgreSQL 14+](https://www.postgresql.org/download/)** - Database
  - 💡 **Easy option**: Use [Postgres.app](https://postgresapp.com/) on macOS or [Docker](https://hub.docker.com/_/postgres) for quick setup
- **[Git](https://git-scm.com/downloads)** - Version control
  - 💡 **New to Git?** Check the [Git Handbook](https://guides.github.com/introduction/git-handbook/)

### **Initial Setup**

```bash
# 1. Clone the repository
git clone <repository-url>
cd next-template

# 2. Install dependencies (this will take a few minutes)
bun install

# 3. Set up environment variables
cp .env.example .env.local
# 📝 Edit .env.local with your database connection string (see below)

# 4. Set up database
bun run db:migrate:dev    # Creates database tables
bun run db:seed          # Adds sample data

# 5. Start development server
bun run dev
# 🎉 Open http://localhost:3000 in your browser!
```

### **Environment Variables Setup**

Edit your `.env.local` file with these values:

```bash
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/nextapp"

# Authentication (can leave defaults for development)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Development mode
NODE_ENV="development"
```

> **Database URL Help**: Replace `username`, `password`, and `nextapp` with your PostgreSQL credentials. [Learn more about PostgreSQL connection strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING).

## 📁 Project Structure

```
next-template/
├── app/                    # Next.js App Router (main application code)
│   ├── api/               # API routes (REST endpoints)
│   ├── demo/              # Demo pages (examples and testing)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   └── example/          # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── api/             # API client functions
│   ├── utils.ts         # Helper utilities
│   └── prisma.ts        # Database connection
├── services/             # Business logic layer (data operations)
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Database schema definition
│   ├── seed.ts          # Sample data for development
│   └── migrations/      # Database migration files
├── tests/               # Test files (mirrors app structure)
├── docs/                # Documentation (you're reading this!)
├── public/              # Static assets (images, icons, etc.)
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vitest.config.ts     # Test configuration
```

> **Understanding the structure**: The `app/` directory contains your pages and API routes using Next.js App Router. Learn more about [App Router structure](https://nextjs.org/docs/app/getting-started/project-structure).

## ⚡ Development Scripts

### **Core Development**

```bash
# Start development server with hot reload
bun run dev

# Build for production (test your app before deploying)
bun run build

# Start production server locally (for testing production build)
bun run start

# Check TypeScript types for errors
bun run type-check

# Check code style and find issues
bun run lint

# Fix automatically fixable linting issues
bun run lint:fix
```

### **Database Operations**

```bash
# Generate Prisma client (run after schema changes)
bun run db:generate

# Create and apply new migration (when you change schema)
bun run db:migrate:dev

# Deploy migrations to production database
bun run db:migrate:deploy

# Reset database completely (⚠️ DELETES ALL DATA - development only!)
bun run db:reset

# Add sample data to database
bun run db:seed

# Open Prisma Studio (visual database browser)
bun run db:studio
```

> **Database workflow**: When you modify `prisma/schema.prisma`, run `db:migrate:dev` to create and apply changes. Learn more about [Prisma migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate).

### **Testing**

```bash
# Run all tests once
bun run test

# Run tests and watch for changes (great during development)
bun run test:watch

# Run tests with coverage report
bun run test:coverage

# Run tests with visual UI
bun run test:ui

# Run end-to-end tests (full browser automation)
bun run test:e2e
```

### **Code Quality**

```bash
# Run all quality checks (types, linting, tests)
bun run check

# Format all code with Prettier
bun run format

# Check TypeScript without building
bun run type-check

# Analyze bundle size (see what makes your app large)
bun run analyze
```

## 🔧 Environment Configuration

### **Environment Files**

- `.env.local` - Your local development settings (not committed to Git)
- `.env.example` - Template showing what variables are needed
- `.env.production` - Production environment variables
- `.env.test` - Test environment variables

### **Common Environment Variables**

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/database_name"

# Authentication (NextAuth.js)
NEXTAUTH_SECRET="random-secret-string"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# External APIs (add as needed)
API_KEY="your-api-key-here"

# Application Environment
NODE_ENV="development"  # or "production" or "test"
```

> **Security Note**: Never commit API keys or secrets to Git. Always use environment variables for sensitive data. [Learn about environment variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables).

## 🎯 Coding Conventions

### **File Naming**

```
# Components: PascalCase
UserForm.tsx
ConfirmationDialog.tsx

# Regular files: kebab-case
user-service.ts
api-client.ts

# Directories: kebab-case
user-management/
api-routes/

# Constants: SCREAMING_SNAKE_CASE
API_BASE_URL
MAX_RETRY_COUNT
```

### **Code Formatting** (Handled by Prettier)

```typescript
// ✅ Good formatting (enforced automatically)
interface UserProps {
  id: string;
  name: string;
  email: string;
}

export function UserCard({ id, name, email }: UserProps) {
  return (
    <div className="p-4 border rounded">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}
```

### **Import Organization**

```typescript
// ✅ Correct import order (enforced by ESLint)

// 1. Node modules (external libraries)
import React from 'react'
import { NextRequest, NextResponse } from 'next/server'

// 2. Internal modules (our code with @ prefix)
import { Button } from '@/components/ui/button'
import { UserService } from '@/services/user.service'
import { cn } from '@/lib/utils'

// 3. Relative imports (same directory or parent directories)
import './styles.css'
```

> **Why this order?** It makes imports easier to scan and prevents circular dependencies. [Learn about import conventions](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md).

## 🌿 Git Workflow

### **Branch Naming**

```bash
# Feature branches (new functionality)
feature/user-authentication
feature/api-optimization

# Bug fix branches (fixing existing issues)
fix/login-validation
fix/memory-leak

# Hotfix branches (urgent production fixes)
hotfix/security-patch

# Release branches (preparing for deployment)
release/v1.2.0
```

### **Commit Messages**

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Format: type(scope): description

feat(auth): add user authentication system
fix(api): resolve pagination issue in user list
docs(readme): update installation guide
style(components): improve button styling consistency
refactor(services): simplify user service implementation
test(api): add comprehensive user endpoint tests
chore(deps): update dependencies to latest versions
```

> **Why Conventional Commits?** They make it easy to understand what each commit does and can automatically generate changelogs. [Learn more](https://www.conventionalcommits.org/en/v1.0.0/).

### **Pull Request Process**

1. **Create feature branch** from `main` branch
2. **Implement feature** with tests and documentation
3. **Run quality checks**: `bun run check` (must pass)
4. **Create pull request** with descriptive title and description
5. **Request review** from team members
6. **Address feedback** and update branch as needed
7. **Merge** when approved and all checks pass

## 🧪 Testing Workflow

### **Test-Driven Development (TDD)**

```typescript
// 1. Write a failing test first
describe('UserService.create', () => {
	it('should create a user with valid data', async () => {
		const userData = { email: 'test@example.com', name: 'Test User' }
		const result = await UserService.create(userData)
		expect(result.email).toBe(userData.email)
	})
})

// 2. Write minimal code to make the test pass
// 3. Refactor code while keeping tests green
```

### **Testing Strategy**

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how components work together
- **E2E Tests**: Test complete user workflows in a real browser
- **API Tests**: Test endpoints with different inputs and scenarios

> **Testing Resources**: Learn more about [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), and [Playwright](https://playwright.dev/).

### **Pre-commit Hooks**

Automatically run before each commit:

- TypeScript type checking
- ESLint code linting
- Prettier code formatting
- Basic unit tests

## 🏗️ Build Process

### **Development Build**

```bash
# Next.js development server features:
# ✅ Hot reload (see changes instantly)
# ✅ Source maps (easy debugging)
# ✅ Detailed error messages
# ✅ TypeScript checking
bun run dev
```

### **Production Build**

```bash
# Optimized build features:
# ✅ Code minification (smaller files)
# ✅ Bundle optimization (faster loading)
# ✅ Static generation (better performance)
# ✅ Type checking (catch errors)
bun run build
```

### **Bundle Analysis**

```bash
# Analyze what makes your app large
bun run analyze
# This opens a visual report showing bundle sizes
```

> **Build Optimization**: Next.js automatically optimizes your code for production. [Learn about optimization](https://nextjs.org/docs/app/building-your-application/optimizing).

## 🔍 Debugging

### **Development Tools**

1. **[React Developer Tools](https://react.dev/learn/react-developer-tools)** - Browser extension for inspecting React components
2. **Next.js built-in debugger** - Built into the development server
3. **[Prisma Studio](https://www.prisma.io/studio)** - Visual database browser
4. **Browser Network tab** - For debugging API calls

### **Debug Logging**

```typescript
// ✅ Good debugging practices
console.log('Debug info:', { user, timestamp: new Date() })

// Conditional debugging (only in development)
if (process.env.NODE_ENV === 'development') {
	console.debug('Development-only log')
}
```

### **Common Issues & Solutions**

#### **Database Connection Issues**

```bash
# Check if PostgreSQL is running
psql -h localhost -p 5432 -U username -d database_name

# Reset database if corrupted
bun run db:reset
bun run db:seed
```

#### **Build Errors**

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules
bun install

# Check for TypeScript errors
bun run type-check
```

#### **Test Failures**

```bash
# Run specific test file
bun run test user-service.test.ts

# Run tests with detailed output
bun run test --verbose

# Debug tests with visual UI
bun run test:ui
```

> **Still stuck?** Check our [troubleshooting guide](#🔧-troubleshooting) below or ask for help!

## 👥 Team Practices

### **Code Reviews**

- **Review Focus**: Logic correctness, readability, performance, and test coverage
- **Review Size**: Keep pull requests under 400 lines when possible for better reviews
- **Review Time**: Aim to review within 24 hours of request
- **Feedback Style**: Be constructive, specific, and suggest improvements

### **Documentation Standards**

- **API Changes**: Update API documentation when changing endpoints
- **New Features**: Include usage examples and integration guides
- **Breaking Changes**: Provide migration guide for existing code
- **Architecture**: Document major technical decisions and rationale

### **Communication**

- **Daily Standups**: Share progress, plans, and blockers
- **Technical Discussions**: Use team chat or schedule focused meetings
- **Decision Documentation**: Record important technical decisions
- **Knowledge Sharing**: Regular tech talks, demos, or documentation updates

## 📊 Development Metrics & Quality

### **Code Quality Metrics**

```bash
# Bundle size analysis
bun run analyze

# Test coverage report (aim for 80%+)
bun run test:coverage

# TypeScript strict checking
bun run type-check
```

### **Development Standards**

- **Test Coverage**: Aim for 80%+ code coverage
- **Bundle Size**: Monitor and optimize for fast loading
- **Performance**: Regular Lighthouse audits for web vitals
- **Accessibility**: Test with screen readers and keyboard navigation
- **Type Safety**: Maintain strict TypeScript configuration

## 🔧 Troubleshooting

### **Common Development Issues**

#### **Port Already in Use**

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 bun run dev
```

#### **TypeScript Errors**

```bash
# Restart TypeScript language server in VS Code
# Press Cmd/Ctrl + Shift + P, then type: "TypeScript: Restart TS Server"

# Check configuration
bun run type-check
```

#### **Database Issues**

```bash
# Open database browser to inspect data
bun run db:studio

# Reset database and add sample data
bun run db:reset
bun run db:seed
```

#### **Cache Issues**

```bash
# Clear all caches and restart
rm -rf .next
rm -rf node_modules/.cache
bun install
bun run dev
```

### **Getting Help**

- **Documentation**: Check our [comprehensive guides](../README.md)
- **Common Patterns**: See [component examples](../components/DEVELOPMENT_GUIDE.md)
- **Performance**: Review [optimization guide](../performance/OPTIMIZATION.md)
- **API Issues**: Check [error handling patterns](../error-handling/PATTERNS.md)

## 📚 Related Documentation & Resources

### **Our Documentation**

- **[Architecture Overview](../architecture/OVERVIEW.md)** - System design and principles
- **[Testing Strategy](../testing/STRATEGY.md)** - Comprehensive testing guide
- **[Component Development](../components/DEVELOPMENT_GUIDE.md)** - UI component patterns
- **[API Design Patterns](../api/DESIGN_PATTERNS.md)** - REST API conventions
- **[Deployment Guide](../deployment/PRODUCTION.md)** - Production deployment

### **Learning Resources**

- **[Next.js Tutorial](https://nextjs.org/learn)** - Official step-by-step tutorial
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Complete TypeScript guide
- **[Prisma Getting Started](https://www.prisma.io/docs/getting-started)** - Database ORM tutorial
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)** - Utility-first CSS framework
- **[Vitest Guide](https://vitest.dev/guide/)** - Testing framework documentation

### **Tools & Extensions**

- **[VS Code](https://code.visualstudio.com/)** - Recommended code editor
- **[Prettier](https://prettier.io/)** - Code formatting
- **[ESLint](https://eslint.org/)** - Code linting
- **[Git](https://git-scm.com/doc)** - Version control system

---

This workflow ensures consistent, high-quality development practices across the team while maintaining productivity and code quality.

**Next Steps**: Set up your development environment, then dive into our [Component Development Guide](../components/DEVELOPMENT_GUIDE.md) to start building features!
