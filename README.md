# Next.js Template

A modern, production-ready Next.js template with built-in best practices, comprehensive documentation, and development tools for team collaboration.

## 🚀 Features

- ⚡️ **Next.js 15** with App Router and React 19
- 🎨 **Tailwind CSS** + **Radix UI** for modern, accessible components
- 📝 **TypeScript** with strict type checking
- 🗄️ **Prisma ORM** with PostgreSQL for type-safe database operations
- 🎯 **ESLint** + **Prettier** with 40+ quality rules
- 🧪 **Testing** with Vitest, Playwright, and React Testing Library
- 🐶 **Git Hooks** with Husky and lint-staged
- 📦 **Conventional Commits** with automated validation
- 🚀 **CI/CD** with GitHub Actions for quality assurance
- 📚 **Comprehensive Documentation** with team best practices

## 🛠 Quick Start

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd next-template
   bun install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database URL
   ```

3. **Set up database**

   ```bash
   bun run db:migrate:dev
   bun run db:seed
   ```

4. **Start development**
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📚 Documentation

For comprehensive guides, best practices, and detailed setup instructions:

**👉 [Complete Developer Documentation](./docs/README.md)**

### Quick Links

- **[Development Workflow](./docs/development/WORKFLOW.md)** - Setup, scripts, and conventions
- **[Architecture Overview](./docs/architecture/OVERVIEW.md)** - System design and principles
- **[Component Development](./docs/components/DEVELOPMENT_GUIDE.md)** - Building reusable components
- **[API Design Patterns](./docs/api/DESIGN_PATTERNS.md)** - REST API best practices
- **[Testing Strategy](./docs/testing/STRATEGY.md)** - Comprehensive testing guide
- **[Performance Optimization](./docs/performance/OPTIMIZATION.md)** - Performance best practices
- **[Deployment Guide](./docs/deployment/PRODUCTION.md)** - Production deployment

## 🛠️ Tech Stack

| Category       | Technologies                                   |
| -------------- | ---------------------------------------------- |
| **Frontend**   | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend**    | Next.js API Routes, Prisma ORM, PostgreSQL     |
| **Testing**    | Vitest, Playwright, React Testing Library      |
| **Quality**    | ESLint, Prettier, Husky, TypeScript            |
| **Deployment** | Vercel, Docker, GitHub Actions                 |

## 📝 Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:migrate:dev    # Apply database migrations
bun run db:seed          # Seed with sample data
bun run db:studio        # Open Prisma Studio

# Quality & Testing
bun run lint        # Run ESLint
bun run format      # Format with Prettier
bun run type-check  # TypeScript checking
bun run test        # Run unit tests
bun run test:e2e    # Run end-to-end tests
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Follow our [coding standards](./docs/development/WORKFLOW.md#coding-conventions)
4. Commit using [conventional commits](https://www.conventionalcommits.org/): `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feat/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**📚 For detailed documentation, architecture guides, and best practices, visit [./docs/README.md](./docs/README.md)**
