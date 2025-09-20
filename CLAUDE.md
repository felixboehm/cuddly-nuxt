# Overview

## Project Structure

This is a Nuxt.js project using Nuxt 4.x with the following configuration:

- **Nuxt 4.x** with TypeScript support
- **@nuxt/ui** for UI components with NuxtUI compatibility
- **@nuxt/image** for optimized image handling
- **@nuxt/test-utils** for testing utilities
- **TailwindCSS 4.x** (@nuxtjs/tailwindcss, @tailwindcss/vite, tailwindcss)
- **Prisma** with SQLite for database management
- **pnpm** as the package manager

The main application structure:
- `app/app.vue` - Main application component
- `app/pages/` - File-based routing pages
- `public/` - Static assets
- `plugins/` - Nuxt plugins (includes Prisma client)
- `prisma/` - Database schema and migrations
- `db/` - Database files (excluded from git)
- `nuxt.config.ts` - Nuxt configuration with modules
- `tsconfig.json` - TypeScript configuration

## Development Commands

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
# Starts development server on http://localhost:3000
```

### Build & Production
```bash
pnpm build          # Build for production
pnpm preview        # Preview production build locally
pnpm generate       # Generate static site (if using SSG)
```

### Post-install
```bash
pnpm postinstall    # Runs `nuxt prepare` to generate types
```

### Database
```bash
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes to database
npx prisma studio       # Open database browser
```

## Architecture Notes

- This is a Nuxt 4.x project with NuxtUI compatibility configured
- Uses Nuxt's auto-import system for components, composables, and utilities
- TypeScript configuration is managed by Nuxt with compatibility date 2025-07-15
- Configured modules: @nuxt/image, @nuxt/test-utils, @nuxt/ui
- Uses TailwindCSS 4.x with @nuxtjs/tailwindcss integration
- Uses Nuxt's file-based routing system with pages in `app/pages/`
- **Database**: Prisma ORM with SQLite for development (file: `./db/dev.db`)
- **Auth-ready**: Database schema includes User, Account, Session, VerificationToken, and Authenticator models
- Prisma client available globally via `plugins/prisma.client.ts`
- Devtools are enabled for development