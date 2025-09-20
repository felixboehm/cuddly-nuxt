# Developer Setup and Configuration Guide

This guide provides step-by-step instructions for setting up the authentication system in development and production environments.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** (recommended) or npm/yarn
- **Git** for version control
- **Modern browser** with WebAuthn support (for testing)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd cuddly-nuxt

# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Database Setup

```bash
# Initialize database
npx prisma db push

# Optional: View database in browser
npx prisma studio
```

### 4. Start Development

```bash
# Start development server
pnpm dev

# Run tests (in another terminal)
pnpm test
```

## 📝 Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="file:./db/dev.db"

# Authentication
NUXT_AUTH_SECRET="your-super-secret-auth-key-here-change-in-production"
NUXT_AUTH_URL="http://localhost:3000"

# WebAuthn Configuration (Development)
NUXT_WEBAUTHN_RP_NAME="Cuddly Nuxt App"
NUXT_WEBAUTHN_RP_ID="localhost"
NUXT_WEBAUTHN_ORIGIN="http://localhost:3000"
```

### Environment Variable Details

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Database connection string | `file:./db/dev.db` |
| `NUXT_AUTH_SECRET` | ✅ | Secret for JWT signing | None (generate one) |
| `NUXT_AUTH_URL` | ✅ | Base URL for auth callbacks | `http://localhost:3000` |
| `NUXT_WEBAUTHN_RP_NAME` | ❌ | Relying Party name for WebAuthn | `Cuddly Nuxt App` |
| `NUXT_WEBAUTHN_RP_ID` | ❌ | Relying Party ID (domain) | `localhost` |
| `NUXT_WEBAUTHN_ORIGIN` | ❌ | Expected origin for WebAuthn | `http://localhost:3000` |

### Generating Secrets

```bash
# Generate a secure auth secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output
vX8e2KJHxq9Wq1aB5C7dE9fG3hI6jK8lM0nP2qR4sT6u
```

## 🗄️ Database Configuration

### SQLite (Development)

SQLite is used for development with the database file stored in `./db/dev.db`:

```env
DATABASE_URL="file:./db/dev.db"
```

### PostgreSQL (Production)

For production, consider using PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"
```

### Database Commands

```bash
# Apply schema changes to database
npx prisma db push

# Reset database (destructive)
npx prisma db push --force-reset

# Generate TypeScript types
npx prisma generate

# View database in browser
npx prisma studio

# Create and apply migrations (for production)
npx prisma migrate dev --name init
```

### Database Schema Overview

```prisma
model User {
  id            String          @id @default(cuid())
  email         String          @unique
  password      String?
  name          String?
  emailVerified DateTime?
  image         String?

  accounts      Account[]
  sessions      Session[]
  authenticators Authenticator[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Authenticator {
  id                   String  @id @default(cuid())
  credentialID         Bytes   @unique
  credentialPublicKey  Bytes
  counter              Int
  transports           String[]

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔧 Nuxt Configuration

### Core Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@hebilicious/authjs-nuxt'  // AuthJS integration
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Private keys (available only on server-side)
    authJs: {
      secret: process.env.NUXT_AUTH_SECRET
    },

    // Public keys (exposed to client-side)
    public: {
      authJs: {
        baseUrl: process.env.NUXT_AUTH_URL || 'http://localhost:3000',
        verifyClientOnEveryRequest: true
      }
    }
  }
})
```

### Module Configuration Details

#### AuthJS Module
```typescript
// Automatic configuration by @hebilicious/authjs-nuxt
// Additional options can be added to runtimeConfig.authJs
```

#### TailwindCSS Integration
```typescript
// Included via @nuxt/ui module
// Custom styles in assets/css/main.css
```

#### Image Optimization
```typescript
// @nuxt/image provides optimized image handling
// Useful for user avatars and assets
```

## 🧪 Testing Configuration

### Vitest Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',  // Lightweight DOM for testing
    globals: true,             // Global test functions
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': new URL('.', import.meta.url).pathname,
      '~': new URL('.', import.meta.url).pathname
    }
  }
})
```

### Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with browser UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Run specific test file
pnpm test password.test.ts

# Run specific test case
pnpm test -t "should hash password correctly"
```

## 🔐 Security Configuration

### Development Security

```env
# Development settings (less strict)
NODE_ENV=development
NUXT_AUTH_SECRET="dev-secret-change-in-production"
NUXT_WEBAUTHN_RP_ID="localhost"
NUXT_WEBAUTHN_ORIGIN="http://localhost:3000"
```

### Production Security

```env
# Production settings (strict)
NODE_ENV=production
NUXT_AUTH_SECRET="<generated-32-byte-base64-secret>"
NUXT_WEBAUTHN_RP_ID="yourdomain.com"
NUXT_WEBAUTHN_ORIGIN="https://yourdomain.com"

# Additional production variables
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."  # For session storage
```

### Security Best Practices

1. **Environment Secrets**
   ```bash
   # Never commit .env files
   echo ".env" >> .gitignore
   ```

2. **Secret Generation**
   ```bash
   # Generate strong secrets
   openssl rand -base64 32
   ```

3. **HTTPS in Production**
   ```nginx
   # Nginx configuration
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🌐 Development Workflow

### Daily Development

```bash
# Start development environment
pnpm dev

# Run tests in watch mode (separate terminal)
pnpm test:watch

# View database (separate terminal)
npx prisma studio
```

### Code Changes Workflow

1. **Make Changes**
   ```bash
   # Edit files in your preferred editor
   code server/api/auth/
   ```

2. **Run Tests**
   ```bash
   # Ensure tests pass
   pnpm test
   ```

3. **Test in Browser**
   ```bash
   # Test authentication flows
   open http://localhost:3000
   ```

4. **Database Changes**
   ```bash
   # If schema changed
   npx prisma db push
   npx prisma generate
   ```

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/new-auth-feature

# Make commits
git add .
git commit -m "feat: add new authentication feature"

# Push and create PR
git push -u origin feat/new-auth-feature
gh pr create
```

## 🚀 Production Deployment

### Build Process

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma migrate deploy

# Build application
pnpm build

# Start production server
pnpm preview
```

### Environment Setup

#### 1. Database Migration

```bash
# Production database setup
npx prisma migrate deploy

# Verify migration
npx prisma db seed  # If you have seed data
```

#### 2. Environment Variables

```bash
# Set production environment variables
export NODE_ENV=production
export NUXT_AUTH_SECRET="<your-production-secret>"
export DATABASE_URL="<your-production-database-url>"
export NUXT_WEBAUTHN_RP_ID="yourdomain.com"
export NUXT_WEBAUTHN_ORIGIN="https://yourdomain.com"
```

#### 3. SSL/TLS Configuration

WebAuthn requires HTTPS in production:

```bash
# Ensure SSL certificate is valid
openssl x509 -in cert.pem -text -noout

# Test SSL configuration
curl -I https://yourdomain.com
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
      - NUXT_AUTH_SECRET=your-secret-here
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🛠️ Development Tools

### Recommended VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "vue.volar",           // Vue 3 support
    "prisma.prisma",       // Prisma schema support
    "bradlc.vscode-tailwindcss",  // TailwindCSS IntelliSense
    "ms-vscode.vscode-typescript-next",  // TypeScript support
    "esbenp.prettier-vscode"  // Code formatting
  ]
}
```

### VS Code Settings

```json
// .vscode/settings.json
{
  "typescript.preferences.useAliasesForRenames": false,
  "vue.server.hybridMode": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prisma.showPrismaDataPlatformNotification": false
}
```

### Development Scripts

```json
// package.json scripts
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",

    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",

    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:reset": "prisma db push --force-reset",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "nuxt typecheck"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Module Import Error

**Error:**
```
RollupError: [plugin impound] Importing directly from module entry-points is not allowed
```

**Solution:**
```typescript
// ❌ Incorrect import
import { NuxtAuthHandler } from '@hebilicious/authjs-nuxt'

// ✅ Correct import
import { NuxtAuthHandler } from '#auth'
```

#### 2. Database Connection Issues

**Error:**
```
Error: Environment variable not found: DATABASE_URL
```

**Solution:**
```bash
# Ensure .env file exists and contains DATABASE_URL
echo 'DATABASE_URL="file:./db/dev.db"' >> .env

# Regenerate Prisma client
npx prisma generate
```

#### 3. WebAuthn HTTPS Requirement

**Error:**
```
NotSupportedError: WebAuthn is not supported
```

**Solution:**
```bash
# Use HTTPS in development
npx nuxi dev --https

# Or use ngrok for testing
npx ngrok http 3000
```

#### 4. Test Failures

**Error:**
```
TypeError: vi.mocked is not a function
```

**Solution:**
```typescript
// Ensure vitest globals are enabled
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true  // Enable vi global
  }
})
```

### Debug Commands

```bash
# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# Verify Prisma schema
npx prisma validate

# Check Nuxt configuration
npx nuxi info

# Debug test setup
pnpm test --reporter=verbose

# Check database connection
npx prisma db pull
```

### Performance Optimization

#### Development

```bash
# Clear Nuxt cache
rm -rf .nuxt

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Restart development server
pnpm dev
```

#### Production

```bash
# Optimize build
NITRO_PRESET=node-server pnpm build

# Enable compression
npm install compression
```

## 📚 Additional Resources

### Documentation Links

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [AuthJS Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [WebAuthn Guide](https://webauthn.guide/)
- [Vitest Documentation](https://vitest.dev/)

### Community Resources

- [Nuxt Discord](https://discord.com/invite/ps2h6QT)
- [AuthJS Discord](https://discord.gg/nextauth)
- [WebAuthn Community](https://github.com/w3c/webauthn)

### Example Projects

- [AuthJS Examples](https://github.com/nextauthjs/next-auth/tree/main/apps/examples)
- [Nuxt Auth Examples](https://github.com/sidebase/nuxt-auth-example)
- [WebAuthn Demos](https://webauthn.io/)

This setup guide should get you up and running with the authentication system in both development and production environments. For specific issues, refer to the troubleshooting section or check the linked documentation resources.