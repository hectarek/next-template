# 🛠️ Project Setup Guide

This guide covers setting up **this specific Next.js template** with our exact stack: Next.js 15, Bun, Prisma ORM, PostgreSQL, Tailwind CSS, and TypeScript.

## 🚀 Quick Start

### **Prerequisites**

You need these tools installed:

- **[Bun](https://bun.sh/docs/installation)** - Our package manager and runtime
- **[PostgreSQL 14+](https://www.postgresql.org/download/)** - Our database
- **[Git](https://git-scm.com/downloads)** - Version control

### **Setup Steps**

```bash
# 1. Clone repository
git clone <repository-url>
cd next-template

# 2. Install dependencies with Bun
bun install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your database URL (see below)

# 4. Set up database
bun run db:migrate     # Apply database schema
bun run db:seed        # Add sample data

# 5. Start development
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the homepage!

## 🔧 Environment Configuration

### **Required Environment Variables**

Edit `.env.local`:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/nextapp_dev"

# Authentication (default values work for development)
NEXTAUTH_SECRET="your-dev-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Development settings
NODE_ENV="development"
```

### **Database Setup Options**

**Option 1: Local PostgreSQL**

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb nextapp_dev
```

**Option 2: Docker**

```bash
# Start PostgreSQL container
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nextapp_dev \
  -p 5432:5432 \
  -d postgres:15

# Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/nextapp_dev"
```

**Option 3: Cloud Database (Neon/Supabase)**

```bash
# Get connection string from your provider
DATABASE_URL="postgresql://user:pass@host.com:5432/database?sslmode=require"
```

## 📁 Project Structure

Our template is organized like this:

```
next-template/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (/api/users, /api/health)
│   ├── demo/              # Demo pages (/demo/users)
│   ├── layout.tsx         # Root layout with Tailwind
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Radix UI components (Button, Input, etc.)
│   └── example/          # Demo components (UserForm, UserList)
├── lib/                  # Utilities
│   ├── api/             # API client functions
│   ├── utils.ts         # Tailwind merge utilities
│   └── prisma.ts        # Database client
├── services/             # Business logic
│   └── user.service.ts   # User operations
├── prisma/              # Database
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Sample data
│   └── migrations/      # Version-controlled schema changes
└── tests/               # Test files
```

## ⚡ Development Scripts

### **Daily Development**

```bash
# Start dev server with Turbopack (fast!)
bun run dev

# Check for TypeScript errors
bun run type-check

# Fix code style issues
bun run lint:fix

# Format code with Prettier
bun run format
```

### **Database Operations**

```bash
# After changing prisma/schema.prisma:
bun run db:migrate        # Create and apply migration

# Other database tasks:
bun run db:studio        # Visual database browser
bun run db:seed          # Re-add sample data
bun run db:reset         # ⚠️ Delete all data and reset
```

### **Testing**

```bash
# Run tests while developing
bun run test:watch

# Run full test suite
bun run test

# End-to-end tests
bun run test:e2e
```

### **Building**

```bash
# Test production build locally
bun run build
bun run start
```

## 🎨 Tech Stack Details

### **Frontend**

- **Next.js 15** with App Router and Server Components
- **React 19** with latest features
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible components
- **Lucide React** for icons

### **Backend**

- **Next.js API Routes** for REST endpoints
- **Prisma ORM** for type-safe database access
- **PostgreSQL** for production-ready data storage
- **Bun** for fast runtime and package management

### **Developer Experience**

- **TypeScript** with strict mode
- **ESLint** with Next.js and Prettier rules
- **Vitest** for fast unit testing
- **Playwright** for e2e testing
- **Husky** for git hooks

## 🔍 Available Demo Features

After setup, explore these working examples:

- **[Homepage](http://localhost:3000)** - Architecture overview
- **[User Demo](http://localhost:3000/demo/users)** - Full CRUD operations
- **[API Endpoints](http://localhost:3000/api/users)** - REST API in action

### **API Endpoints**

```bash
# Test our API endpoints
curl http://localhost:3000/api/users           # Get all users
curl http://localhost:3000/api/users/stats     # Get statistics
curl http://localhost:3000/api/health          # Health check
```

## 🧪 Testing Setup

Our testing stack is ready to use:

```bash
# Unit tests with Vitest
bun run test                # Run once
bun run test:watch         # Watch mode
bun run test:ui            # Visual UI

# E2E tests with Playwright
bun run test:e2e           # Run e2e tests
bun run test:e2e:ui        # Visual mode
```

**Test Files**:

- `tests/` - Unit and integration tests
- `e2e/` - End-to-end tests (Playwright)

## 🎯 Next Steps

After setup, you can:

1. **Explore the demo**: Visit `/demo/users` to see the full stack in action
2. **Read the architecture**: Check `docs/architecture/OVERVIEW.md`
3. **Start building**: Add new API endpoints in `app/api/`
4. **Add components**: Create new UI components in `components/`

## 🔧 Troubleshooting

### **Common Issues**

**Database connection fails**:

```bash
# Check PostgreSQL is running
pg_ctl status

# Check database exists
psql -l | grep nextapp
```

**Port 3000 already in use**:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
bun run dev -- -p 3001
```

**Prisma generate fails**:

```bash
# Regenerate Prisma client
bunx prisma generate

# Clear cache and regenerate
rm -rf node_modules/.prisma
bunx prisma generate
```

### **Development Tips**

- **Hot reload**: Changes to files automatically refresh the browser
- **Database changes**: Always run `bun run db:migrate` after schema changes
- **Type errors**: Run `bun run type-check` to catch TypeScript issues
- **Code style**: Use `bun run lint:fix` to auto-fix most issues

## 📚 Learn More

- **[Our Architecture Guide](../architecture/OVERVIEW.md)** - Understanding the system design
- **[API Patterns](../api/DESIGN_PATTERNS.md)** - REST API conventions
- **[Component Development](../components/DEVELOPMENT_GUIDE.md)** - Building UI components

---

**Ready to build?** Start with our [Architecture Overview](../architecture/OVERVIEW.md) to understand how everything fits together.
