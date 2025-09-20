# Important

## Development Workflow
- Always use PRs and do never push directly on main
- Commits and PRs need to follow semantic PR specifications
- Each Task or Feature has its own PR including docs and tests   

## CLI and Navigation
- Always use absolute pathes to navigate, relative pathes only in config files
- Webresearch for current date 2025
- Never install software, ask before.

# Workflow

Github workflow with pull requests, no github issues, no github projects.
- Tasklist in TODO.md.
- High level roadmap in ROADMAP.md

1. Understand feature or problem. You need 95% confidence to proceed, otherwise ask clarifying questions.
2. Write unit tests (test-driven)
3. Develop the code until tests are green
4. Update docs and context (CLAUDE.md) and tasklist
5. Create or update the pull request, check for open PRs that are related

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
- **Database**: Prisma ORM with SQLite for development (file: `./dev.db`)
- **Auth-ready**: Database schema includes User, Account, Session, VerificationToken, and Authenticator models
- Prisma client available globally via `plugins/prisma.client.ts`
- Devtools are enabled for development