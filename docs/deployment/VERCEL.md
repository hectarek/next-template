# 🚀 Vercel Deployment Guide

This guide covers deploying **this specific Next.js template** to Vercel with our exact stack: Next.js 15, Prisma ORM, PostgreSQL, and Bun.

## 🎯 Our Deployment Setup

### **Why Vercel for This Project**

- **Optimized for Next.js 15**: Native support for App Router and Server Components
- **Automatic builds**: Detects our Bun setup and Prisma generate steps
- **Edge functions**: Great performance for our API routes
- **Database integration**: Easy connection to hosted PostgreSQL
- **Zero configuration**: Works with our existing `next.config.js`

## ⚡ Quick Deploy

### **1. Connect Repository**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your repo
vercel --prod
```

### **2. Environment Variables**

Set these in your Vercel dashboard (or via CLI):

```bash
# Required for our Prisma setup
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"

# Required for API routes
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"

# Production environment
NODE_ENV="production"
```

### **3. Build Configuration**

Our `package.json` scripts work automatically with Vercel:

```json
{
	"scripts": {
		"build": "next build", // Vercel runs this
		"db:generate": "prisma generate" // Runs before build
	}
}
```

## 🔧 Vercel Configuration

### **Project Settings** (`vercel.json`)

```json
{
	"buildCommand": "prisma generate && next build",
	"devCommand": "next dev --turbopack",
	"installCommand": "bun install",
	"functions": {
		"app/api/**/*.ts": {
			"maxDuration": 30
		}
	},
	"env": {
		"ENABLE_EXPERIMENTAL_COREPACK": "1"
	}
}
```

### **Database Connection**

For production PostgreSQL, use:

- **Vercel Postgres** (recommended for simplicity)
- **Neon** (serverless PostgreSQL)
- **Railway** (simple setup)
- **Supabase** (includes other features)

```bash
# Example with Vercel Postgres
DATABASE_URL="postgres://default:abc123@ep-cool-wildflower-123456.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
```

## 🚀 Deployment Workflow

### **Automatic Deployments**

```bash
# 1. Push to main branch
git push origin main
# ✅ Vercel automatically deploys to production

# 2. Push to feature branch
git push origin feature/new-component
# ✅ Vercel creates preview deployment
```

### **Manual Deployments**

```bash
# Deploy current branch to production
vercel --prod

# Deploy preview (testing)
vercel

# Deploy with specific environment
vercel --env NODE_ENV=staging --prod
```

## 🎛️ Environment Setup

### **Production Environment Variables**

```bash
# Add via Vercel Dashboard or CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Pull environment to local
vercel env pull .env.local
```

### **Preview Environment**

Preview deployments automatically get:

- Same environment variables as production
- Unique URL: `your-app-git-branch-user.vercel.app`
- Full functionality for testing

## 📊 Post-Deployment

### **Database Migrations**

After deployment, run migrations:

```bash
# Run migrations on production database
bun run db:deploy

# Or use Vercel CLI
vercel exec -- bunx prisma migrate deploy
```

### **Health Checks**

Verify deployment:

```bash
# Check API endpoints
curl https://your-app.vercel.app/api/users
curl https://your-app.vercel.app/api/health

# Check database connection
curl https://your-app.vercel.app/api/users/stats
```

### **Monitoring**

Vercel provides built-in monitoring:

- **Analytics**: User metrics and performance
- **Functions**: API route performance and errors
- **Logs**: Real-time application logs
- **Speed Insights**: Core Web Vitals tracking

## 🔧 Troubleshooting

### **Common Issues**

**Build fails with Prisma error**:

```bash
# Ensure DATABASE_URL is set in Vercel environment
# Add build command: "prisma generate && next build"
```

**API routes timeout**:

```bash
# Check function duration in vercel.json
"functions": {
  "app/api/**/*.ts": {
    "maxDuration": 30  // Increase if needed
  }
}
```

**Database connection issues**:

```bash
# Use connection pooling for serverless
DATABASE_URL="postgresql://user:pass@host/db?pgbouncer=true&connection_limit=1"
```

### **Performance Optimization**

```typescript
// next.config.js - Already configured in our template
module.exports = {
	compress: true,
	poweredByHeader: false,
	experimental: {
		serverComponentsExternalPackages: ['@prisma/client'],
	},
}
```

## 📚 Learn More

- **[Vercel Next.js Guide](https://vercel.com/docs/frameworks/nextjs)**
- **[Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)**
- **[Vercel Functions](https://vercel.com/docs/concepts/functions/serverless-functions)**

---

**Next Steps**: After deployment, set up monitoring and consider adding a custom domain. For advanced features, see [General Deployment Concepts](./CONCEPTS.md).
