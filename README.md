# Cuddly Nuxt - Modern Authentication with Nuxt 4

A Nuxt 4 application with complete password-based authentication using nuxt-auth-utils, Prisma ORM, and Vue components.

## Features

- 🔐 **Password Authentication** - Secure registration and login with Argon2 hashing
- 🍪 **Session Management** - Encrypted httpOnly cookies via nuxt-auth-utils
- 🎨 **Vue Components** - Reusable authentication UI components
- 📝 **Form Validation** - Client and server-side validation with Zod
- 🗄️ **Database** - Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- 🧪 **Testing** - Unit tests with Vitest, E2E tests with Playwright
- 🎯 **Type Safety** - Full TypeScript support

## Setup

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/felixboehm/cuddly-nuxt.git
cd cuddly-nuxt
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set a secure session password (minimum 32 characters)
# You can generate one with: openssl rand -base64 32
```

4. Set up the database:
```bash
# Create and apply migrations
pnpm prisma migrate dev

# Optional: Open Prisma Studio to view your database
pnpm prisma studio
```

## Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Database Management

### Migrations

```bash
# Create a new migration after schema changes
pnpm prisma migrate dev --name your_migration_name

# Apply migrations in production
pnpm prisma migrate deploy

# Reset database (WARNING: destroys all data)
pnpm prisma migrate reset

# View database in browser
pnpm prisma studio
```

### Common Database Commands

```bash
# Generate Prisma Client after schema changes
pnpm prisma generate

# Push schema changes directly (development only)
pnpm prisma db push

# Pull schema from existing database
pnpm prisma db pull

# Seed database with initial data
pnpm prisma db seed
```

## Testing

### Unit Tests

```bash
# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests in watch mode
pnpm test --watch
```

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI (recommended for debugging)
pnpm test:e2e:ui
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

### Production Database Setup

For production, switch from SQLite to PostgreSQL:

1. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

2. Apply migrations:
```bash
pnpm prisma migrate deploy
```

## Project Structure

```
cuddly-nuxt/
├── app/
│   ├── components/
│   │   └── auth/          # Authentication components
│   ├── layouts/           # App layouts
│   ├── pages/
│   │   └── auth/          # Auth pages (login, register)
│   └── assets/
├── server/
│   ├── api/
│   │   └── auth/          # Auth API endpoints
│   └── utils/             # Server utilities
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── tests/
│   ├── unit/              # Unit tests
│   └── e2e/               # End-to-end tests
└── docs/                  # Documentation
```

## Authentication API

### Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/session` - Get current user

### Usage in Components

```vue
<script setup>
const { user, clear, fetch } = useUserSession()

// Check if authenticated
if (user.value) {
  console.log('Logged in as:', user.value.email)
}

// Login
await $fetch('/api/auth/login', {
  method: 'POST',
  body: { email, password }
})
await fetch() // Refresh session

// Logout
await $fetch('/api/auth/logout', { method: 'POST' })
await clear()
</script>
```

## Security

- Passwords are hashed with Argon2 (memory-hard, GPU-resistant)
- Sessions use encrypted httpOnly cookies
- CSRF protection is built-in
- All inputs are validated on both client and server

## Environment Variables

See `.env.example` for all available options:

- `DATABASE_URL` - Database connection string
- `NUXT_SESSION_PASSWORD` - Session encryption key (min 32 chars)
- `NUXT_PUBLIC_AUTH_URL` - Public URL for authentication

## Deployment

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for platform-specific guides.

### Quick Deploy Options

- **Vercel**: `npx vercel`
- **Netlify**: Connect GitHub repo
- **Docker**: Use provided Dockerfile
- **Node.js**: `pnpm build && node .output/server/index.mjs`

## Contributing

1. Create a feature branch (`git checkout -b feat/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feat/amazing-feature`)
4. Open a Pull Request

## License

MIT

## Resources

- [Nuxt Documentation](https://nuxt.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Nuxt Auth Utils](https://github.com/Atinux/nuxt-auth-utils)
- [Vue.js Documentation](https://vuejs.org)