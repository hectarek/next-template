# 🚀 Deployment & Production

This guide covers deployment strategies, production configuration, monitoring, and maintenance for our Next.js application across different hosting platforms.

> **New to deployment?** Start with [Next.js Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying) to understand the basics, then explore platform-specific guides like [Vercel](https://vercel.com/docs) or [AWS](https://docs.aws.amazon.com/).

## 🎯 Production Philosophy

### 1. **Infrastructure as Code**

All infrastructure should be version-controlled and reproducible. Learn about [Infrastructure as Code](https://docs.aws.amazon.com/whitepapers/latest/introduction-devops-aws/infrastructure-as-code.html).

### 2. **Zero-Downtime Deployments**

Implement deployment strategies that ensure continuous availability. See [deployment strategies guide](https://docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/introduction.html).

### 3. **Security First**

Secure configurations, environment management, and access controls. Follow [OWASP security guidelines](https://owasp.org/www-project-top-ten/).

### 4. **Monitoring & Observability**

Comprehensive monitoring for performance, errors, and user experience. Learn about [observability](https://opentelemetry.io/docs/concepts/observability-primer/).

### 5. **Scalability**

Design for growth with auto-scaling and load balancing capabilities.

## 🏗️ Production Architecture

> **Architecture Overview**: This diagram shows how requests flow through our production infrastructure. Learn more about [web application architecture](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Client-Server_overview).

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN/Edge                             │
│  ┌─── Static Assets    ├─── Image Optimization             │
│  ├─── Global Caching   ├─── Edge Functions                │
├─────────────────────────────────────────────────────────────┤
│                    Load Balancer                           │
├─────────────────────────────────────────────────────────────┤
│          Application Servers (Auto-scaling)                │
│  ┌─── Next.js App     ├─── Health Checks                  │
│  ├─── API Routes      ├─── Graceful Shutdown              │
├─────────────────────────────────────────────────────────────┤
│                    Database Cluster                        │
│  ┌─── Primary DB     ├─── Read Replicas                   │
│  ├─── Connection Pool ├─── Backup Strategy                │
├─────────────────────────────────────────────────────────────┤
│                 Monitoring & Logging                       │
│  ┌─── Error Tracking ├─── Performance Metrics             │
│  ├─── Log Aggregation ├─── Alerting                       │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Environment Configuration

### **Environment Variables**

> **Security Note**: Never commit sensitive values to Git. Use your platform's secret management. [Learn about environment variables](https://12factor.net/config).

```bash
# .env.production
# Database - Use managed database service URL
DATABASE_URL="postgresql://user:password@prod-db:5432/app_production?connection_limit=20&pool_timeout=20"

# Authentication - Generate strong secrets
NEXTAUTH_SECRET="your-super-secure-secret-key"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="https://yourdomain.com"

# Security
NODE_ENV="production"
ENCRYPTION_KEY="your-encryption-key"  # Generate with: openssl rand -hex 32

# External Services
REDIS_URL="redis://redis:6379"
EMAIL_SERVICE_API_KEY="your-email-api-key"
STORAGE_BUCKET_URL="https://your-bucket.s3.amazonaws.com"

# Monitoring & Logging
SENTRY_DSN="https://your-sentry-dsn"  # Error tracking
LOG_LEVEL="error"  # Reduce log verbosity in production
METRICS_ENDPOINT="https://metrics.yourservice.com"

# Performance
CACHE_TTL="300"  # 5 minutes
MAX_CONCURRENT_REQUESTS="100"
```

### **Production Configuration**

> **Next.js Configuration**: Learn about [Next.js config options](https://nextjs.org/docs/app/api-reference/next-config-js) for production optimization.

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
	// ✅ Performance optimizations
	compress: true, // Enable gzip compression
	poweredByHeader: false, // Remove "X-Powered-By: Next.js" header

	// ✅ Security headers (protect against common attacks)
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff', // Prevent MIME sniffing
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY', // Prevent clickjacking
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block', // XSS protection
					},
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains', // Force HTTPS
					},
					{
						key: 'Content-Security-Policy',
						value:
							"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
					},
				],
			},
		]
	},

	// ✅ Image optimization settings
	images: {
		domains: ['your-cdn.com', 'images.unsplash.com'], // Allowed image domains
		formats: ['image/webp', 'image/avif'], // Modern image formats
		minimumCacheTTL: 86400, // 24 hours cache
	},

	// ✅ Static export configuration (if deploying to CDN)
	output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,

	// ✅ Experimental features for better performance
	experimental: {
		serverComponentsExternalPackages: ['@prisma/client'], // Exclude from bundling
	},
}

module.exports = nextConfig
```

## 🐳 Docker Configuration

> **Docker Basics**: New to Docker? Check the [Docker Getting Started Guide](https://docs.docker.com/get-started/). Learn about [Docker best practices](https://docs.docker.com/develop/best-practices/).

### **Multi-stage Dockerfile**

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# ✅ Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat  # Compatibility for Alpine Linux
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# ✅ Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (required for database access)
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# ✅ Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs  # Run as non-root user

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# ✅ Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### **Docker Compose for Production**

> **Docker Compose**: Learn about [Docker Compose](https://docs.docker.com/compose/) for multi-container applications.

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2 # Run 2 instances for load balancing
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # ✅ PostgreSQL database
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: app_production
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # ✅ Redis for caching
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  # ✅ Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs # SSL certificates
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data: # Persistent database storage
```

## ☁️ Cloud Platform Deployments

### **Vercel Deployment** (Recommended for beginners)

> **Vercel**: The easiest way to deploy Next.js apps. [Learn about Vercel deployment](https://vercel.com/docs/concepts/deployments).

```typescript
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  // ✅ Configure serverless function timeouts
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30  // 30 seconds max for API routes
    }
  },
  // ✅ Security headers
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ],
  // ✅ Redirects configuration
  "redirects": [
    {
      "source": "/api/health",
      "destination": "/api/health",
      "permanent": false
    }
  ]
}

// Deploy scripts in package.json
{
  "scripts": {
    "deploy:vercel": "vercel --prod",     // Deploy to production
    "deploy:preview": "vercel"           // Deploy preview version
  }
}
```

### **AWS ECS Deployment** (For scalable containerized apps)

> **AWS ECS**: Container orchestration service. [Learn about ECS](https://docs.aws.amazon.com/ecs/latest/developerguide/Welcome.html).

```yaml
# aws-ecs-task-definition.json
{
  'family': 'nextjs-app',
  'networkMode': 'awsvpc', # Use VPC networking
  'requiresCompatibilities': ['FARGATE'], # Serverless containers
  'cpu': '512', # 0.5 vCPU
  'memory': '1024', # 1 GB RAM
  'executionRoleArn': 'arn:aws:iam::account:role/ecsTaskExecutionRole',
  'taskRoleArn': 'arn:aws:iam::account:role/ecsTaskRole',
  'containerDefinitions': [
      {
        'name': 'nextjs-app',
        'image': 'your-account.dkr.ecr.region.amazonaws.com/nextjs-app:latest',
        'portMappings': [{ 'containerPort': 3000, 'protocol': 'tcp' }],
        'essential': true,
        'environment': [{ 'name': 'NODE_ENV', 'value': 'production' }],
        # ✅ Use AWS Secrets Manager for sensitive data
        'secrets':
          [{ 'name': 'DATABASE_URL', 'valueFrom': 'arn:aws:secretsmanager:region:account:secret:database-url' }],
        # ✅ Centralized logging with CloudWatch
        'logConfiguration':
          {
            'logDriver': 'awslogs',
            'options':
              { 'awslogs-group': '/ecs/nextjs-app', 'awslogs-region': 'us-east-1', 'awslogs-stream-prefix': 'ecs' },
          },
        # ✅ Health check for load balancer
        'healthCheck':
          {
            'command': ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
            'interval': 30,
            'timeout': 5,
            'retries': 3,
            'startPeriod': 60,
          },
      },
    ],
}
```

### **Kubernetes Deployment** (For advanced container orchestration)

> **Kubernetes**: Advanced container orchestration. [Learn Kubernetes basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/).

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextjs-app
  labels:
    app: nextjs-app
spec:
  replicas: 3 # Run 3 instances for high availability
  selector:
    matchLabels:
      app: nextjs-app
  template:
    metadata:
      labels:
        app: nextjs-app
    spec:
      containers:
        - name: nextjs-app
          image: your-registry/nextjs-app:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
          # ✅ Resource limits prevent one pod from using all resources
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          # ✅ Health checks for automatic restart
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5

---
# ✅ Service to expose pods
apiVersion: v1
kind: Service
metadata:
  name: nextjs-app-service
spec:
  selector:
    app: nextjs-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer # Expose to internet
```

## 🔒 Security Configuration

### **SSL/TLS Configuration**

> **SSL/TLS**: Encrypt data between browser and server. [Learn about HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS).

```nginx
# nginx.conf
# ✅ Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# ✅ HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificate configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.pem;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

    # ✅ Modern SSL/TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;  # Only modern protocols
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # ✅ Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;

    # ✅ Proxy to Next.js app
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Environment Secrets Management**

> **Secrets Management**: Keep sensitive data secure. Learn about [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/) or [Azure Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/).

```typescript
// lib/secrets.ts
interface Secrets {
	DATABASE_URL: string
	NEXTAUTH_SECRET: string
	API_KEYS: Record<string, string>
}

class SecretsManager {
	private static instance: SecretsManager
	private secrets: Partial<Secrets> = {}

	static getInstance(): SecretsManager {
		if (!SecretsManager.instance) {
			SecretsManager.instance = new SecretsManager()
		}
		return SecretsManager.instance
	}

	async loadSecrets(): Promise<void> {
		if (process.env.NODE_ENV === 'production') {
			// ✅ Load from cloud secrets manager in production
			await this.loadFromCloud()
		} else {
			// ✅ Load from environment variables in development
			this.loadFromEnv()
		}
	}

	private async loadFromCloud(): Promise<void> {
		// Example: AWS Secrets Manager
		try {
			const AWS = require('aws-sdk')
			const secretsManager = new AWS.SecretsManager()

			const result = await secretsManager
				.getSecretValue({
					SecretId: 'prod/nextjs-app/secrets',
				})
				.promise()

			this.secrets = JSON.parse(result.SecretString)
		} catch (error) {
			console.error('Failed to load secrets from cloud:', error)
			process.exit(1)
		}
	}

	private loadFromEnv(): void {
		this.secrets = {
			DATABASE_URL: process.env.DATABASE_URL!,
			NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
			API_KEYS: {
				EXTERNAL_API: process.env.EXTERNAL_API_KEY!,
			},
		}
	}

	getSecret<K extends keyof Secrets>(key: K): Secrets[K] {
		const value = this.secrets[key]
		if (!value) {
			throw new Error(`Secret ${key} not found`)
		}
		return value
	}
}

export const secrets = SecretsManager.getInstance()
```

## 📊 Monitoring & Observability

### **Health Check Endpoint**

> **Health Checks**: Let load balancers and orchestrators know if your app is working. [Learn about health checks](https://microservices.io/patterns/observability/health-check-api.html).

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface HealthCheck {
	status: 'healthy' | 'unhealthy'
	timestamp: string
	version: string
	checks: {
		database: 'up' | 'down'
		cache: 'up' | 'down'
		external_apis: 'up' | 'down'
	}
	uptime: number
}

export async function GET(): Promise<NextResponse<HealthCheck>> {
	const startTime = Date.now()

	const health: HealthCheck = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		version: process.env.npm_package_version || '1.0.0',
		checks: {
			database: 'down',
			cache: 'down',
			external_apis: 'down',
		},
		uptime: process.uptime(),
	}

	try {
		// ✅ Check database connectivity
		await prisma.$queryRaw`SELECT 1`
		health.checks.database = 'up'
	} catch (error) {
		console.error('Database health check failed:', error)
		health.status = 'unhealthy'
	}

	try {
		// ✅ Check cache (if using Redis)
		// await redis.ping()
		health.checks.cache = 'up'
	} catch (error) {
		console.error('Cache health check failed:', error)
	}

	try {
		// ✅ Check external APIs
		const response = await fetch('https://api.external.com/health', {
			method: 'HEAD',
			signal: AbortSignal.timeout(5000), // 5 second timeout
		})
		health.checks.external_apis = response.ok ? 'up' : 'down'
	} catch (error) {
		console.error('External API health check failed:', error)
	}

	const responseTime = Date.now() - startTime

	return NextResponse.json(health, {
		status: health.status === 'healthy' ? 200 : 503,
		headers: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'X-Response-Time': `${responseTime}ms`,
		},
	})
}
```

### **Error Tracking Setup**

> **Error Tracking**: Monitor and fix errors in production. [Learn about Sentry](https://docs.sentry.io/).

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs'

export function initializeErrorTracking() {
	if (process.env.NODE_ENV === 'production') {
		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.NODE_ENV,
			tracesSampleRate: 0.1, // Sample 10% of transactions for performance monitoring
			beforeSend(event) {
				// ✅ Filter out sensitive data before sending to Sentry
				if (event.request?.data) {
					delete event.request.data.password
					delete event.request.data.token
				}
				return event
			},
		})
	}
}

export function trackError(error: Error, context?: Record<string, any>) {
	if (process.env.NODE_ENV === 'production') {
		Sentry.withScope(scope => {
			if (context) {
				Object.keys(context).forEach(key => {
					scope.setTag(key, context[key])
				})
			}
			Sentry.captureException(error)
		})
	} else {
		console.error('Error:', error, context)
	}
}
```

### **Performance Monitoring**

```typescript
// lib/performance-monitoring.ts
interface PerformanceMetric {
	name: string
	value: number
	timestamp: number
	tags: Record<string, string>
}

class PerformanceTracker {
	private metrics: PerformanceMetric[] = []

	track(name: string, value: number, tags: Record<string, string> = {}) {
		const metric: PerformanceMetric = {
			name,
			value,
			timestamp: Date.now(),
			tags: {
				environment: process.env.NODE_ENV || 'development',
				version: process.env.npm_package_version || '1.0.0',
				...tags,
			},
		}

		this.metrics.push(metric)

		// ✅ Send to monitoring service (DataDog, New Relic, etc.)
		this.sendMetric(metric)
	}

	private async sendMetric(metric: PerformanceMetric) {
		if (process.env.NODE_ENV === 'production') {
			try {
				await fetch(process.env.METRICS_ENDPOINT!, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${process.env.METRICS_API_KEY}`,
					},
					body: JSON.stringify(metric),
				})
			} catch (error) {
				console.error('Failed to send metric:', error)
			}
		}
	}

	// ✅ Utility to measure function execution time
	startTimer(name: string, tags?: Record<string, string>) {
		const start = Date.now()
		return () => {
			const duration = Date.now() - start
			this.track(name, duration, tags)
		}
	}
}

export const performanceTracker = new PerformanceTracker()

// ✅ Middleware for automatic API performance tracking
export function withPerformanceTracking<T extends (...args: any[]) => any>(fn: T, name: string): T {
	return ((...args: any[]) => {
		const stopTimer = performanceTracker.startTimer(`api.${name}`)

		try {
			const result = fn(...args)

			if (result instanceof Promise) {
				return result.finally(stopTimer)
			} else {
				stopTimer()
				return result
			}
		} catch (error) {
			stopTimer()
			throw error
		}
	}) as T
}
```

## 🚀 Deployment Strategies

### **Blue-Green Deployment**

> **Blue-Green Deployment**: Switch traffic between two identical environments. [Learn about blue-green deployments](https://docs.aws.amazon.com/whitepapers/latest/blue-green-deployments/blue-green-deployments.html).

```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

# ✅ Determine current and new environments
CURRENT_ENV=$(kubectl get service nextjs-app-service -o jsonpath='{.spec.selector.version}')
NEW_ENV=$([ "$CURRENT_ENV" = "blue" ] && echo "green" || echo "blue")

echo "Current environment: $CURRENT_ENV"
echo "Deploying to: $NEW_ENV"

# ✅ Deploy new version to inactive environment
kubectl set image deployment/nextjs-app-$NEW_ENV nextjs-app=your-registry/nextjs-app:$NEW_VERSION

# ✅ Wait for rollout to complete
kubectl rollout status deployment/nextjs-app-$NEW_ENV

# ✅ Run health checks on new deployment
echo "Running health checks..."
sleep 30

# Test the new deployment
HEALTH_CHECK=$(kubectl exec -it deployment/nextjs-app-$NEW_ENV -- curl -f http://localhost:3000/api/health)

if [[ $? -eq 0 ]]; then
  echo "Health check passed. Switching traffic to $NEW_ENV"

  # ✅ Switch traffic to new environment
  kubectl patch service nextjs-app-service -p '{"spec":{"selector":{"version":"'$NEW_ENV'"}}}'

  echo "Deployment successful!"

  # ✅ Optional: Scale down old environment after successful switch
  # kubectl scale deployment nextjs-app-$CURRENT_ENV --replicas=0
else
  echo "Health check failed. Rolling back..."
  kubectl rollout undo deployment/nextjs-app-$NEW_ENV
  exit 1
fi
```

### **Canary Deployment**

> **Canary Deployment**: Gradually roll out to a small percentage of users. [Learn about canary deployments](https://martinfowler.com/bliki/CanaryRelease.html).

```yaml
# k8s/canary-deployment.yaml
# ✅ Using Istio for traffic splitting
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: nextjs-app
spec:
  http:
    # Route users with canary header to new version
    - match:
        - headers:
            canary:
              exact: 'true'
      route:
        - destination:
            host: nextjs-app-service
            subset: canary
    # Split remaining traffic: 90% stable, 10% canary
    - route:
        - destination:
            host: nextjs-app-service
            subset: stable
          weight: 90
        - destination:
            host: nextjs-app-service
            subset: canary
          weight: 10
```

## 📋 Production Checklist

### **✅ Pre-Deployment**

- [ ] Environment variables configured securely
- [ ] Database migrations applied and tested
- [ ] SSL certificates installed and validated
- [ ] Security headers configured properly
- [ ] Error tracking service set up (Sentry, etc.)
- [ ] Performance monitoring configured
- [ ] Load testing completed successfully
- [ ] Backup strategy implemented and tested

### **✅ Deployment**

- [ ] Health checks passing consistently
- [ ] Graceful shutdown implemented for zero-downtime
- [ ] Auto-scaling configured based on metrics
- [ ] Load balancer configured with health checks
- [ ] CDN setup for static assets and images
- [ ] Database connection pooling enabled
- [ ] Cache layer implemented (Redis, etc.)

### **✅ Post-Deployment**

- [ ] Monitor error rates and performance metrics
- [ ] Verify Core Web Vitals are within targets
- [ ] Test critical user flows end-to-end
- [ ] Verify rollback procedures work correctly
- [ ] Update documentation with deployment notes
- [ ] Alert stakeholders of successful deployment
- [ ] Schedule post-deployment review meeting

### **✅ Ongoing Maintenance**

- [ ] Regular security updates and patches
- [ ] Performance optimization based on metrics
- [ ] Capacity planning for growth
- [ ] Backup verification and recovery testing
- [ ] Documentation updates for new features
- [ ] Team training on new tools and processes

## 📚 Related Documentation & Resources

### **Our Documentation**

- **[Architecture Overview](../architecture/OVERVIEW.md)** - System design context
- **[Performance Optimization](../performance/OPTIMIZATION.md)** - Production performance tuning
- **[Error Handling Patterns](../error-handling/PATTERNS.md)** - Production-ready error handling
- **[Development Workflow](../development/WORKFLOW.md)** - Development to production pipeline

### **Platform Guides**

- **[Vercel Deployment](https://vercel.com/docs/concepts/deployments)** - Easiest Next.js deployment
- **[AWS Deployment](https://docs.aws.amazon.com/getting-started/)** - Enterprise-grade cloud deployment
- **[Docker Documentation](https://docs.docker.com/)** - Containerization guide
- **[Kubernetes Documentation](https://kubernetes.io/docs/)** - Container orchestration

### **Monitoring & Security**

- **[Sentry Documentation](https://docs.sentry.io/)** - Error tracking and monitoring
- **[OWASP Security Guide](https://owasp.org/www-project-top-ten/)** - Web application security
- **[SSL/TLS Best Practices](https://wiki.mozilla.org/Security/Server_Side_TLS)** - HTTPS configuration
- **[Infrastructure as Code](https://docs.aws.amazon.com/whitepapers/latest/introduction-devops-aws/infrastructure-as-code.html)** - Reproducible infrastructure

---

Successful production deployment requires careful planning, monitoring, and maintenance. Follow these patterns to ensure reliable, scalable, and secure application delivery.

**Next Steps**: Start with a simple deployment on Vercel to get familiar with the process, then move to more advanced strategies as your application grows!
