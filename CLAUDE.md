# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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