# API Endpoints Reference

This document provides a comprehensive reference for all authentication-related API endpoints in the application.

## 📋 Overview

The authentication system exposes several API endpoints for user registration, authentication, and WebAuthn operations. All endpoints are built using Nuxt's server API with proper error handling and validation.

## 🔐 AuthJS Endpoints (Auto-generated)

These endpoints are automatically created by the AuthJS module:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | GET/POST | Sign in page and authentication |
| `/api/auth/signout` | POST | Sign out current user |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/csrf` | GET | Get CSRF token |
| `/api/auth/providers` | GET | List available providers |

## 🛠️ Custom API Endpoints

### User Registration

#### `POST /api/auth/register`

Register a new user with email and password.

**Request Body:**
```typescript
{
  email: string      // User's email address (required)
  password: string   // User's password (required)
  name?: string      // User's display name (optional)
}
```

**Response (Success - 200):**
```typescript
{
  success: true
  user: {
    id: string       // Generated user ID
    email: string    // User's email
    name: string | null  // User's name
  }
}
```

**Response (Error - 400):**
```typescript
{
  statusCode: 400
  statusMessage: "Email and password are required"
}
```

**Response (Error - 409):**
```typescript
{
  statusCode: 409
  statusMessage: "User already exists"
}
```

**Example Usage:**
```typescript
const response = await $fetch('/api/auth/register', {
  method: 'POST',
  body: {
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'John Doe'
  }
})
```

---

### WebAuthn Registration Options

#### `POST /api/auth/webauthn/register-options`

Generate WebAuthn registration options for a user.

**Request Body:**
```typescript
{
  userID: string     // User ID for registration (required)
}
```

**Response (Success - 200):**
```typescript
{
  options: {
    challenge: string
    rp: {
      name: string   // "Cuddly Nuxt App"
      id: string     // "localhost" or your domain
    }
    user: {
      id: string     // User ID
      name: string   // User email
      displayName: string  // User display name
    }
    pubKeyCredParams: Array<{
      alg: number    // Algorithm identifier
      type: "public-key"
    }>
    timeout: number  // 60000ms
    attestation: "none"
    excludeCredentials: Array<{
      id: Buffer     // Existing credential IDs
      type: "public-key"
      transports: AuthenticatorTransport[]
    }>
    authenticatorSelection: {
      authenticatorAttachment: "platform"
      residentKey: "preferred"
      userVerification: "preferred"
    }
  }
  challenge: string  // Challenge for verification
}
```

**Response (Error - 400):**
```typescript
{
  statusCode: 400
  statusMessage: "User ID is required"
}
```

**Response (Error - 404):**
```typescript
{
  statusCode: 404
  statusMessage: "User not found"
}
```

**Example Usage:**
```typescript
const { options, challenge } = await $fetch('/api/auth/webauthn/register-options', {
  method: 'POST',
  body: { userID: 'user-123' }
})

// Use options with navigator.credentials.create()
const credential = await navigator.credentials.create({
  publicKey: options
})
```

---

### WebAuthn Registration Verification

#### `POST /api/auth/webauthn/verify-registration`

Verify a WebAuthn registration response and store the authenticator.

**Request Body:**
```typescript
{
  userID: string           // User ID (required)
  response: CredentialCreationResponse  // WebAuthn response (required)
  expectedChallenge: string  // Challenge from registration options (required)
}
```

**Response (Success - 200):**
```typescript
{
  success: true
  verified: boolean        // true if verification succeeded
  authenticator: {
    id: string            // Authenticator database ID
    credentialID: string  // Base64URL encoded credential ID
  }
}
```

**Response (Error - 400):**
```typescript
{
  statusCode: 400
  statusMessage: "User ID, response, and expected challenge are required"
}
```

**Response (Error - 404):**
```typescript
{
  statusCode: 404
  statusMessage: "User not found"
}
```

**Response (Error - 400):**
```typescript
{
  statusCode: 400
  statusMessage: "Registration verification failed"
}
```

**Example Usage:**
```typescript
const result = await $fetch('/api/auth/webauthn/verify-registration', {
  method: 'POST',
  body: {
    userID: 'user-123',
    response: credential,
    expectedChallenge: challenge
  }
})
```

---

### WebAuthn Authentication Options

#### `POST /api/auth/webauthn/auth-options`

Generate WebAuthn authentication options.

**Request Body:**
```typescript
{
  userEmail?: string  // User email to filter credentials (optional)
}
```

**Response (Success - 200):**
```typescript
{
  options: {
    challenge: string
    timeout: number    // 60000ms
    rpId: string      // "localhost" or your domain
    allowCredentials?: Array<{
      id: Buffer      // Credential ID
      type: "public-key"
      transports: AuthenticatorTransport[]
    }>
    userVerification: "preferred"
  }
  challenge: string   // Challenge for verification
}
```

**Example Usage:**
```typescript
// Get options for specific user
const { options, challenge } = await $fetch('/api/auth/webauthn/auth-options', {
  method: 'POST',
  body: { userEmail: 'user@example.com' }
})

// Get options for any user (discoverable credentials)
const { options, challenge } = await $fetch('/api/auth/webauthn/auth-options', {
  method: 'POST',
  body: {}
})

// Use options with navigator.credentials.get()
const credential = await navigator.credentials.get({
  publicKey: options
})
```

---

## 🔐 Authentication Flow Examples

### Complete Registration Flow

```typescript
async function registerWithPassword(email: string, password: string, name?: string) {
  try {
    const result = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email, password, name }
    })

    console.log('User registered:', result.user)
    return result
  } catch (error) {
    if (error.statusCode === 409) {
      throw new Error('An account with this email already exists')
    }
    throw error
  }
}
```

### Complete WebAuthn Registration Flow

```typescript
async function registerPasskey(userId: string) {
  try {
    // Step 1: Get registration options
    const { options, challenge } = await $fetch('/api/auth/webauthn/register-options', {
      method: 'POST',
      body: { userID: userId }
    })

    // Step 2: Create credential with browser API
    const credential = await navigator.credentials.create({
      publicKey: options
    }) as PublicKeyCredential

    // Step 3: Verify registration
    const result = await $fetch('/api/auth/webauthn/verify-registration', {
      method: 'POST',
      body: {
        userID: userId,
        response: credential,
        expectedChallenge: challenge
      }
    })

    console.log('Passkey registered:', result.authenticator)
    return result
  } catch (error) {
    if (error.name === 'NotSupportedError') {
      throw new Error('Passkeys are not supported on this device')
    } else if (error.name === 'NotAllowedError') {
      throw new Error('Passkey registration was cancelled')
    }
    throw error
  }
}
```

### Complete Authentication Flow

```typescript
// Password authentication
async function signInWithPassword(email: string, password: string) {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false
  })

  if (result?.error) {
    throw new Error('Invalid email or password')
  }

  return result
}

// WebAuthn authentication
async function signInWithPasskey(userEmail?: string) {
  try {
    // Step 1: Get authentication options
    const { options, challenge } = await $fetch('/api/auth/webauthn/auth-options', {
      method: 'POST',
      body: { userEmail }
    })

    // Step 2: Get credential with browser API
    const credential = await navigator.credentials.get({
      publicKey: options
    }) as PublicKeyCredential

    // Step 3: Sign in with AuthJS
    const result = await signIn('webauthn', {
      response: JSON.stringify(credential),
      challenge: challenge,
      redirect: false
    })

    if (result?.error) {
      throw new Error('Passkey authentication failed')
    }

    return result
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Passkey authentication was cancelled')
    }
    throw error
  }
}
```

## 🛡️ Security Headers & CORS

### Required Headers

```typescript
// All endpoints include security headers
export default defineEventHandler(async (event) => {
  // CORS headers (configured in Nuxt)
  setHeader(event, 'Access-Control-Allow-Origin', 'http://localhost:3000')
  setHeader(event, 'Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Security headers
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'X-XSS-Protection', '1; mode=block')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return ''
  }

  // ... endpoint logic
})
```

## 📊 Rate Limiting (Future Enhancement)

### Planned Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/register` | 5 requests | 15 minutes |
| `/api/auth/signin` | 10 requests | 15 minutes |
| `/api/auth/webauthn/*` | 20 requests | 15 minutes |

### Implementation Example

```typescript
// Future rate limiting implementation
import { rateLimit } from '@/utils/rate-limit'

export default defineEventHandler(async (event) => {
  await rateLimit(event, {
    max: 5,
    windowMs: 15 * 60 * 1000,
    keyGenerator: (event) => getClientIP(event)
  })

  // ... endpoint logic
})
```

## 🧪 Testing Endpoints

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Get WebAuthn registration options
curl -X POST http://localhost:3000/api/auth/webauthn/register-options \
  -H "Content-Type: application/json" \
  -d '{"userID":"user-123"}'

# Get authentication options
curl -X POST http://localhost:3000/api/auth/webauthn/auth-options \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"test@example.com"}'
```

### Using Test Suite

```typescript
// Example from tests/api/auth.test.ts
describe('POST /api/auth/register', () => {
  it('should register new user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'securePassword123',
      name: 'Test User'
    }

    const response = await mockFetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })

    expect(response.success).toBe(true)
    expect(response.user.email).toBe(userData.email)
  })
})
```

## ⚠️ Error Handling

### Standard Error Format

All endpoints return errors in a consistent format:

```typescript
{
  statusCode: number     // HTTP status code
  statusMessage: string  // Human-readable error message
}
```

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| `400` | Bad Request | Missing/invalid parameters |
| `401` | Unauthorized | Invalid credentials |
| `404` | Not Found | User/resource not found |
| `409` | Conflict | Duplicate email/resource |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Database/server issues |

### Error Handling Best Practices

```typescript
// Client-side error handling
async function apiCall() {
  try {
    const result = await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    })
    return result
  } catch (error: any) {
    // Handle specific error codes
    switch (error.statusCode) {
      case 400:
        throw new Error('Please check your input and try again')
      case 409:
        throw new Error('An account with this email already exists')
      case 429:
        throw new Error('Too many attempts. Please try again later')
      default:
        throw new Error('Something went wrong. Please try again')
    }
  }
}
```

## 📈 Monitoring & Analytics (Future Enhancement)

### Planned Metrics

```typescript
// Future analytics implementation
interface AuthMetrics {
  registrations: {
    total: number
    byMethod: { password: number, webauthn: number }
    success_rate: number
  }
  authentications: {
    total: number
    byMethod: { password: number, webauthn: number }
    success_rate: number
  }
  errors: {
    total: number
    byType: Record<string, number>
  }
}
```

### Health Check Endpoint

```typescript
// Future health check
export default defineEventHandler(async (event) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseConnection(),
      webauthn: await checkWebAuthnService(),
      auth: await checkAuthService()
    }
  }

  return health
})
```

This API reference provides all the information needed to integrate with the authentication system, including request/response formats, error handling, and complete usage examples.