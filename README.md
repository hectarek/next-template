# Next.js Template

A modern, production-ready Next.js template with built-in best practices, comprehensive documentation, and development tools for team collaboration.

## 🚀 Features

- ⚡️ **Next.js 15** with App Router and React 19
- 🎨 **Tailwind CSS v4** + **Radix UI** for modern, accessible components
- 📝 **TypeScript** with strict type checking
- 🗄️ **Prisma ORM** with PostgreSQL for type-safe database operations
- 🎯 **ESLint** + **Prettier** with 40+ quality rules
- 🧪 **Testing** with Vitest, Playwright, and React Testing Library
- 🐶 **Git Hooks** with Husky and lint-staged
- 📦 **Conventional Commits** with automated validation
- 🚀 **CI/CD** with GitHub Actions for quality assurance
- ☁️ **Vercel Deployment** ready with optimized configuration
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
   bun run db:migrate
   bun run db:seed
   ```

4. **Start development**
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📚 Documentation

Our documentation is organized into **two main sections**:

### 🚀 **For This Project** (Start Here)

**Guides specific to this template and our exact stack:**

- **[Project Setup Guide](./docs/development/SETUP.md)** - Setup this specific template
- **[Vercel Deployment](./docs/deployment/VERCEL.md)** - Deploy to production
- **[Architecture Overview](./docs/architecture/OVERVIEW.md)** - Our system design
- **[Our API Reference](./docs/api/OUR_API.md)** - Working endpoints and patterns
- **[Our Testing Setup](./docs/testing/OUR_TESTING.md)** - Testing with our tools

### 📖 **General Knowledge** (Learning & Growth)

**Broader development concepts and educational content:**

- **[Client vs Server Components](./docs/architecture/RENDERING_PATTERNS.md)** - React rendering patterns
- **[API Design Concepts](./docs/api/CONCEPTS.md)** - REST API principles
- **[Testing Concepts](./docs/testing/CONCEPTS.md)** - Testing strategies
- **[Deployment Concepts](./docs/deployment/CONCEPTS.md)** - DevOps principles

**👉 [Complete Documentation Index](./docs/README.md)**

## 🛠️ Tech Stack

| Category       | Technologies                                      |
| -------------- | ------------------------------------------------- |
| **Frontend**   | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| **Backend**    | Next.js API Routes, Prisma ORM, PostgreSQL        |
| **Testing**    | Vitest, Playwright, React Testing Library         |
| **Quality**    | ESLint, Prettier, Husky, TypeScript               |
| **Deployment** | Vercel (configured), Docker support               |

## 📝 Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:migrate   # Apply database migrations
bun run db:seed      # Seed with sample data
bun run db:studio    # Open Prisma Studio

# Quality & Testing
bun run lint        # Run ESLint
bun run format      # Format with Prettier
bun run type-check  # TypeScript checking
bun run test        # Run unit tests
bun run test:e2e    # Run end-to-end tests

# Deployment
vercel              # Deploy to Vercel
```

## 🎯 What's Included

### **Live Demo Features**

- **Homepage**: Architecture overview and tech stack showcase
- **User Management Demo**: Complete CRUD operations with real API
- **Working API Endpoints**: REST API with full documentation
- **Component Examples**: Production-ready UI components

### **Production-Ready Setup**

- **Database Schema**: User management with roles and relationships
- **API Layer**: Type-safe REST endpoints with error handling
- **Testing Suite**: Unit, integration, and e2e tests configured
- **CI/CD Pipeline**: GitHub Actions for quality assurance
- **Deployment**: Vercel configuration with environment management

## 🚀 Deployment

This template is optimized for **Vercel deployment**:

```bash
# Deploy to Vercel
vercel --prod

# Or connect your GitHub repo to Vercel for automatic deployments
```

**Environment Variables Needed:**

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret key
- `NEXTAUTH_URL` - Your deployed URL

See [Vercel Deployment Guide](./docs/deployment/VERCEL.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Follow our [Project Setup Guide](./docs/development/SETUP.md)
4. Commit using [conventional commits](https://www.conventionalcommits.org/): `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feat/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**📚 Ready to start?** Begin with our [Project Setup Guide](./docs/development/SETUP.md) or explore the [Complete Documentation](./docs/README.md).
