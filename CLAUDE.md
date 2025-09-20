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
5. Create or update the pull request

# Overview

## Project Structure

This is a Nuxt.js project using Nuxt 4.x with the following configuration:

- **Nuxt 4.x** with TypeScript support
- **@nuxt/ui** for UI components with NuxtUI compatibility
- **@nuxt/image** for optimized image handling
- **@nuxt/test-utils** for testing utilities
- **TailwindCSS 4.x** (@nuxtjs/tailwindcss, @tailwindcss/vite, tailwindcss)
- **pnpm** as the package manager

The main application structure:
- `app/app.vue` - Main application component
- `app/assets/css/main.css` - Main CSS file (referenced in nuxt.config.ts)
- `app/pages/` - File-based routing pages
- `public/` - Static assets
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

## Architecture Notes

- This is a Nuxt 4.x project with NuxtUI compatibility configured
- Uses Nuxt's auto-import system for components, composables, and utilities
- TypeScript configuration is managed by Nuxt with compatibility date 2025-07-15
- Configured modules: @nuxt/image, @nuxt/test-utils, @nuxt/ui
- Uses TailwindCSS 4.x with @nuxtjs/tailwindcss integration
- Uses Nuxt's file-based routing system with pages in `app/pages/`
- Devtools are enabled for development