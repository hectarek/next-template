# 📚 Developer Documentation

Welcome to the comprehensive developer documentation for our Next.js template. This documentation is organized into **repo-specific guides** for this exact project and **general development concepts** for broader learning.

> **Getting Started?** See the [main README](../README.md) for quick setup instructions.

## 🚀 For This Project

These guides are **specific to this Next.js template** with our exact stack and configuration.

### **⚡ Quick Setup & Deployment**

- **[Project Setup Guide](./development/SETUP.md)** - Setup this specific template (Bun, Prisma, PostgreSQL)
- **[Vercel Deployment](./deployment/VERCEL.md)** - Deploy this project to Vercel (our chosen platform)

### **🏗️ Architecture & Code**

- **[Architecture Overview](./architecture/OVERVIEW.md)** - Our specific system design and patterns
- **[Our API Reference](./api/OUR_API.md)** - Specific endpoints and patterns we implement
- **[Our Testing Setup](./testing/OUR_TESTING.md)** - Vitest, Playwright, and testing patterns we use

### **🎨 Development Workflow**

- **[Component Development Guide](./components/DEVELOPMENT_GUIDE.md)** - Building components with our UI system
- **[Database & Service Layer](./database/SERVICE_LAYER.md)** - Working with Prisma and our service patterns
- **[Error Handling Patterns](./error-handling/PATTERNS.md)** - Our error handling approach

## 📖 General Knowledge

These guides provide **broader development concepts** and educational content that applies beyond this specific project.

### **🌐 Web Development Concepts**

- **[Client vs Server Components](./architecture/RENDERING_PATTERNS.md)** - Next.js rendering patterns and best practices
- **[API Design Concepts](./api/CONCEPTS.md)** - REST API principles and patterns
- **[Testing Concepts](./testing/CONCEPTS.md)** - Testing strategies and methodologies

### **🚀 Deployment & DevOps**

- **[Deployment Concepts](./deployment/CONCEPTS.md)** - Platform options, strategies, and DevOps principles
- **[General Production Practices](./deployment/GENERAL_PRODUCTION.md)** - Production setup across different platforms
- **[Development Concepts](./development/GENERAL_CONCEPTS.md)** - General development workflow principles

### **⚡ Performance & Optimization**

- **[Performance Optimization](./performance/OPTIMIZATION.md)** - Performance best practices and monitoring

## 🛠️ Technology Stack

### **Core Framework & Language**

- **[Next.js 15](https://nextjs.org/docs)** - Full-stack React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/docs/)** - Type-safe JavaScript for better development experience
- **[React 19](https://react.dev/learn)** - UI library with Server Components support

### **Database & ORM**

- **[PostgreSQL](https://www.postgresql.org/docs/)** - Production-ready relational database
- **[Prisma](https://www.prisma.io/docs)** - Type-safe database client and migration tool

### **Styling & UI**

- **[Tailwind CSS v4](https://tailwindcss.com/docs)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/primitives)** - Unstyled, accessible UI primitives
- **[Lucide Icons](https://lucide.dev/)** - Beautiful & consistent icon set

### **Development Tools**

- **[Bun](https://bun.sh/docs)** - Fast JavaScript runtime and package manager
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[Playwright](https://playwright.dev/)** - End-to-end testing
- **[ESLint](https://eslint.org/docs/latest/)** - Code linting and consistency
- **[Prettier](https://prettier.io/docs/en/)** - Code formatting

## 🎯 Quick Start Paths

### **For New Team Members**

1. **[Project Setup Guide](./development/SETUP.md)** - Get this project running locally
2. **[Architecture Overview](./architecture/OVERVIEW.md)** - Understand our system design
3. **[Our API Reference](./api/OUR_API.md)** - Learn our API patterns
4. **[Component Development Guide](./components/DEVELOPMENT_GUIDE.md)** - Start building features

### **For API Development**

1. **[Our API Reference](./api/OUR_API.md)** - Current endpoints and patterns
2. **[Database & Service Layer](./database/SERVICE_LAYER.md)** - Work with Prisma and data
3. **[Error Handling Patterns](./error-handling/PATTERNS.md)** - Robust error handling
4. **[Our Testing Setup](./testing/OUR_TESTING.md)** - Test your API changes

### **For Frontend Development**

1. **[Component Development Guide](./components/DEVELOPMENT_GUIDE.md)** - Build UI components
2. **[Client vs Server Components](./architecture/RENDERING_PATTERNS.md)** - Choose the right pattern
3. **[Performance Optimization](./performance/OPTIMIZATION.md)** - Make it fast
4. **[Our Testing Setup](./testing/OUR_TESTING.md)** - Test your components

### **For Learning & Growth**

1. **[Client vs Server Components](./architecture/RENDERING_PATTERNS.md)** - Modern React patterns
2. **[API Design Concepts](./api/CONCEPTS.md)** - REST API best practices
3. **[Testing Concepts](./testing/CONCEPTS.md)** - Testing methodologies
4. **[Deployment Concepts](./deployment/CONCEPTS.md)** - DevOps and deployment strategies

## 📊 Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Server Components     │        Client Components           │
│  ┌─── Static Content   │  ┌─── Interactive Features         │
│  ├─── Initial Data     │  ├─── Form Handling               │
│  ├─── SEO Optimization │  ├─── Real-time Updates           │
│  └─── Direct DB Access │  └─── Browser APIs                │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (REST)                         │
│  ┌─── Route Handlers   ├─── Validation   ├─── Error Handling│
├─────────────────────────────────────────────────────────────┤
│                   Service Layer                             │
│  ┌─── Business Logic  ├─── Data Validation ├─── Operations │
├─────────────────────────────────────────────────────────────┤
│                   Database Layer                            │
│  ┌─── Prisma ORM     ├─── Type Safety    ├─── Migrations   │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Coding Standards

### **File Organization**

```
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (buttons, inputs, etc.)
│   └── example/           # Demo/feature components
├── lib/                   # Utilities and configurations
│   ├── api/              # API client functions
│   └── utils.ts          # Helper utilities
├── services/              # Business logic layer
├── prisma/               # Database schema and migrations
├── tests/                # Test files (mirrors app structure)
└── docs/                 # Documentation
```

### **Naming Conventions**

- **Files**: `kebab-case` (`user-form.tsx`, `api-client.ts`)
- **Components**: `PascalCase` (`UserForm`, `ConfirmDialog`)
- **Functions**: `camelCase` (`createUser`, `validateEmail`)
- **Constants**: `SCREAMING_SNAKE_CASE` (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **Types/Interfaces**: `PascalCase` (`CreateUserInput`, `ApiResponse`)

### **Key Architecture Principles**

- **API-First**: All data operations through REST endpoints
- **Type Safety**: Full TypeScript coverage with strict mode
- **Separation of Concerns**: Clear boundaries between layers
- **Component Composition**: Reusable, testable components
- **Performance by Default**: Server Components first, Client when needed

## 🆘 Getting Help

### **Project-Specific Issues**

- **Setup problems**: See [Project Setup Guide](./development/SETUP.md)
- **Database issues**: Check [Database & Service Layer](./database/SERVICE_LAYER.md)
- **API errors**: Consult [Our API Reference](./api/OUR_API.md)
- **Test failures**: Review [Our Testing Setup](./testing/OUR_TESTING.md)
- **Deployment issues**: Use [Vercel Deployment](./deployment/VERCEL.md)

### **Learning Resources**

- **[Next.js Tutorial](https://nextjs.org/learn)** - Official Next.js learning path
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Complete TypeScript guide
- **[React Beta Docs](https://react.dev/learn)** - Modern React with Server Components
- **[Prisma Getting Started](https://www.prisma.io/docs/getting-started)** - Database modeling and queries
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** - Utility-first CSS

## 📝 Contributing to Documentation

When adding new features or patterns:

1. **Update repo-specific docs** - Keep implementation guides current
2. **Add working examples** - Include copy-pastable code from our codebase
3. **Update this index** - Add new documents to the appropriate section
4. **Cross-reference** - Link between repo-specific and general concept docs
5. **Test examples** - Ensure all code examples work with our setup

### **Documentation Standards**

- **Clear separation** - Distinguish between "For This Project" and "General Knowledge"
- **Working examples** - Use real code from our codebase
- **Practical focus** - Focus on actionable guidance over theory
- **Current examples** - Keep examples up-to-date with our stack versions

---

**Quick Navigation**:

- **New to the project?** Start with [Project Setup Guide](./development/SETUP.md)
- **Want to understand the architecture?** See [Architecture Overview](./architecture/OVERVIEW.md)
- **Ready to deploy?** Use [Vercel Deployment](./deployment/VERCEL.md)
- **Learning mode?** Explore the "General Knowledge" section above

_Documentation for Next.js Template v1.0_
