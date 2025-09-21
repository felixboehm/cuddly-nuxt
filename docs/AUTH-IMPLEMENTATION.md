# Authentication Implementation Documentation

## Overview

This document describes the password-based authentication system implemented for the Cuddly Nuxt application using Nuxt 4, nuxt-auth-utils, and Prisma ORM.

## Architecture

### Technology Stack
- **Framework**: Nuxt 4 with TypeScript
- **Authentication**: nuxt-auth-utils for session management
- **Database**: Prisma ORM with SQLite
- **Password Hashing**: Argon2 (via argon2 package)
- **Validation**: Zod for schema validation
- **UI Components**: @nuxt/ui with Tailwind CSS
- **Testing**: Vitest for unit tests, Playwright for E2E tests

## Implementation Details

### 1. Database Schema

The authentication system uses the following Prisma models:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations for future features
  accounts       Account[]
  sessions       Session[]
  authenticators Authenticator[]
}
```

### 2. Server API Endpoints

#### POST `/api/auth/register`
- Creates a new user account
- Validates email and password requirements
- Hashes password using Argon2
- Creates session automatically after registration

#### POST `/api/auth/login`
- Authenticates user with email and password
- Verifies password against stored hash
- Creates secure session cookie

#### POST `/api/auth/logout`
- Clears user session
- Removes session cookie

#### GET `/api/auth/session`
- Returns current user session data
- Used by frontend to check authentication status

### 3. Vue Components

#### `AuthLoginForm.vue`
- Login form with email and password fields
- Client-side validation using Zod
- Remember me checkbox (UI only, not implemented)
- Link to registration and forgot password

#### `AuthRegisterForm.vue`
- Registration form with name, email, password fields
- Password confirmation field
- Terms of service agreement checkbox
- Client-side validation with password requirements

#### `AuthUserMenu.vue`
- Displays user avatar when authenticated
- Dropdown menu with profile, settings, and logout options
- Shows login/register buttons when not authenticated

### 4. Pages

#### `/auth/login`
- Login page with centered form
- Redirects to home if already authenticated
- No layout (full-screen auth page)

#### `/auth/register`
- Registration page with centered form
- Redirects to home if already authenticated
- No layout (full-screen auth page)

#### `/` (Home Page)
- Shows personalized welcome when authenticated
- Shows call-to-action buttons when not authenticated
- Uses default layout with navigation

### 5. Security Features

#### Password Security
- Minimum 8 character password requirement
- Argon2 hashing (memory-hard, resistant to GPU attacks)
- Salt automatically generated per password

#### Session Management
- Encrypted, httpOnly cookies via nuxt-auth-utils
- Session password from environment variable (32+ chars)
- Automatic CSRF protection

#### Validation
- Server-side validation on all endpoints
- Client-side validation for better UX
- Duplicate email prevention

## Testing

### Unit Tests (`tests/unit/auth.test.ts`)
- Password hashing and verification
- Token generation
- Schema validation
- All core authentication utilities

### E2E Tests (`tests/e2e/auth.spec.ts`)
- Complete registration flow
- Login/logout flow
- Error handling (invalid credentials, duplicate email)
- Password validation
- Authentication redirects

## Running the Application

### Setup
```bash
# Install dependencies
pnpm install

# Setup database
npx prisma generate
npx prisma db push

# Create .env file with:
DATABASE_URL="file:./db/dev.db"
NUXT_SESSION_PASSWORD="your-super-secret-session-password-minimum-32-chars"
```

### Development
```bash
# Start development server
pnpm dev

# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# View test UI
pnpm test:ui
pnpm test:e2e:ui
```

### Production Build
```bash
pnpm build
pnpm preview
```

## API Usage Examples

### Register a New User
```javascript
const response = await $fetch('/api/auth/register', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  }
})
```

### Login
```javascript
const response = await $fetch('/api/auth/login', {
  method: 'POST',
  body: {
    email: 'john@example.com',
    password: 'securePassword123'
  }
})
```

### Get Current Session
```javascript
const { user } = await $fetch('/api/auth/session')
```

### Logout
```javascript
await $fetch('/api/auth/logout', {
  method: 'POST'
})
```

## Future Enhancements

### Phase 1: Email Verification
- Send verification emails
- Require email verification for certain actions
- Resend verification email functionality

### Phase 2: Password Recovery
- Forgot password flow
- Password reset via email link
- Password change for authenticated users

### Phase 3: Passkey/WebAuthn Support
- Add passkey registration
- Passwordless login option
- Device management

### Phase 4: Additional Features
- Two-factor authentication (TOTP)
- OAuth providers (Google, GitHub)
- Session management (view active sessions)
- Security audit log

## Troubleshooting

### Common Issues

1. **Session Password Error**
   - Ensure `NUXT_SESSION_PASSWORD` is set in `.env`
   - Must be at least 32 characters

2. **Database Connection Error**
   - Check `DATABASE_URL` in `.env`
   - Run `npx prisma db push` to create database

3. **Build Errors**
   - Clear `.nuxt` directory
   - Run `pnpm install` to ensure dependencies are installed
   - Run `npx prisma generate` to regenerate Prisma client

## Security Considerations

- Never commit `.env` file to version control
- Use strong session password in production
- Enable HTTPS in production
- Regular security updates for dependencies
- Consider rate limiting for auth endpoints
- Implement account lockout after failed attempts

## Resources

- [Nuxt Auth Utils Documentation](https://github.com/Atinux/nuxt-auth-utils)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Argon2 Documentation](https://github.com/ranisalt/node-argon2)
- [Zod Documentation](https://zod.dev)
- [Playwright Documentation](https://playwright.dev)