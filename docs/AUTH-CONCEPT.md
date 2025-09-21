# Authentication Concept: Modern Passwordless & Password-Based Authentication

## Executive Summary

This document outlines a comprehensive authentication system for Nuxt 4 that supports both traditional password-based authentication and modern passwordless authentication via WebAuthn/Passkeys. The system prioritizes security, user experience, and progressive enhancement while maintaining backward compatibility.

## Core Principles

### 1. Progressive Enhancement
- Start with password authentication as the baseline
- Gradually introduce passkeys to users
- Never force users to abandon familiar authentication methods
- Provide seamless migration paths

### 2. Security First
- Passkeys eliminate phishing attacks entirely
- No shared secrets stored on servers (only public keys for passkeys)
- Automatic protection against credential stuffing
- Built-in multi-factor security with biometric verification

### 3. User-Centric Design
- Clear, intuitive authentication flows
- Multiple recovery options
- Cross-device synchronization via cloud providers
- Consistent experience across platforms

## Architecture Overview

### Technology Stack
- **Framework**: Nuxt 4 with server-side API routes
- **Auth Module**: nuxt-auth-utils (official minimalist solution)
- **Session Management**: Encrypted, sealed cookies (httpOnly, secure, sameSite)
- **Database**: Prisma ORM with SQLite/PostgreSQL
- **Passkey Library**: SimpleWebAuthn or native Web Authentication API
- **Password Hashing**: Argon2id or bcrypt

### Authentication Methods

#### 1. Password Authentication (Baseline)
- Traditional email/password login
- Secure password hashing with salt
- Password strength requirements
- Optional 2FA via TOTP

#### 2. Passkey Authentication (Progressive)
- WebAuthn/FIDO2 standard implementation
- Platform authenticators (Face ID, Touch ID, Windows Hello)
- Cross-platform authenticators (YubiKey, mobile devices)
- Passwordless and usernameless options

## Database Schema

### Core Tables

```
Users Table
├── id (UUID/CUID2) - Primary key
├── email (string, unique) - User identifier
├── username (string, unique, nullable) - Optional display name
├── password_hash (string, nullable) - For password auth
├── email_verified (boolean) - Email verification status
├── created_at (timestamp)
├── updated_at (timestamp)
└── deleted_at (timestamp, nullable) - Soft delete

Authenticators Table (for Passkeys)
├── id (UUID/CUID2) - Primary key
├── user_id (foreign key) - Reference to Users
├── credential_id (bytes) - WebAuthn credential ID
├── public_key (bytes) - Public key for verification
├── counter (bigint) - Signature counter
├── credential_device_type (string) - Platform or cross-platform
├── credential_backed_up (boolean) - Sync status
├── transports (JSON) - Available transports (usb, nfc, ble, internal)
├── created_at (timestamp)
├── last_used_at (timestamp)
└── name (string, nullable) - User-friendly device name

Sessions Table
├── id (string) - Session ID
├── user_id (foreign key) - Reference to Users
├── expires_at (timestamp) - Session expiration
├── ip_address (string) - Client IP
├── user_agent (string) - Browser/device info
├── created_at (timestamp)
└── last_activity_at (timestamp)

VerificationTokens Table
├── id (UUID/CUID2)
├── identifier (string) - Email or phone
├── token (string, unique) - Verification token
├── expires (timestamp) - Token expiration
└── type (enum) - email_verification, password_reset, etc.
```

## Authentication Flows

### 1. Initial Registration Flow

```mermaid
User Registration Journey:
1. User enters email → Check if exists
2. Set password (if password-based) OR Skip (if passkey-only)
3. Create user account
4. Send email verification
5. After verification → Prompt to add passkey (optional)
6. Store passkey credentials if accepted
```

### 2. Login Flow (Hybrid)

```mermaid
Smart Login Detection:
1. User enters email/username
2. System checks available auth methods
3a. If passkey exists → Trigger WebAuthn
3b. If password exists → Show password field
3c. If both → Show options
4. Authenticate and create session
```

### 3. Passkey Addition Flow (Post-Login)

```mermaid
Add Passkey to Existing Account:
1. User authenticates with current method
2. Navigate to security settings
3. Click "Add Passkey"
4. Browser prompts for biometric/PIN
5. Store public key in database
6. Confirm success
```

## Session Management

### Cookie-Based Sessions (via nuxt-auth-utils)
- **Encryption**: AES-256-GCM with rotating keys
- **Cookie Settings**: httpOnly, secure, sameSite=lax
- **Duration**: 30 days default, configurable
- **Refresh**: Sliding window with activity-based extension
- **Storage**: Server-side with minimal client payload

### Session Security
- CSRF protection via double-submit cookies
- Session fixation prevention
- Automatic invalidation on suspicious activity
- Device fingerprinting for anomaly detection

## Recovery Mechanisms

### 1. Account Recovery Options
- **Email-based recovery**: Time-limited magic links
- **Recovery codes**: One-time use backup codes (8-10 codes)
- **Admin override**: Manual verification for enterprise
- **Progressive recovery**: Add new passkey after recovery

### 2. Passkey Loss Scenarios
- **Cloud sync loss**: Fallback to password or recovery codes
- **Device loss**: Use another synced device or recovery method
- **Platform change**: Cross-device QR code authentication

## Security Considerations

### Threat Model
1. **Phishing**: Passkeys immune, passwords vulnerable
2. **Credential stuffing**: Passkeys immune, rate-limit passwords
3. **MITM attacks**: TLS required, origin verification for passkeys
4. **Session hijacking**: Secure cookies, device binding
5. **Brute force**: Rate limiting, account lockout policies

### Security Headers
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## User Experience Guidelines

### 1. Onboarding
- Explain passkeys with simple language
- Show security benefits visually
- Offer "Try Later" option
- Provide interactive demo

### 2. Authentication UI
- Single input field with smart detection
- Clear authentication method indicators
- Fallback options always visible
- Loading states and error handling

### 3. Management Interface
- List all registered devices/passkeys
- Allow naming/renaming for recognition
- Show last used timestamps
- One-click removal with confirmation

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
- Implement password authentication
- Set up session management
- Create user registration/login

### Phase 2: Passkey Addition (Week 3-4)
- Add WebAuthn registration
- Implement passkey login
- Create hybrid login UI

### Phase 3: Enhancement (Week 5-6)
- Add recovery mechanisms
- Implement device management
- Create security dashboard

### Phase 4: Polish (Week 7-8)
- Optimize UX flows
- Add analytics/monitoring
- Security audit
- Documentation

## Monitoring & Analytics

### Key Metrics
- Authentication success/failure rates
- Passkey adoption percentage
- Recovery method usage
- Session duration patterns
- Device/platform distribution

### Security Events
- Failed login attempts
- Unusual login patterns
- Recovery attempts
- Passkey registrations
- Session anomalies

## Browser & Platform Support (2025)

### Full Support
- Chrome 67+ (all platforms)
- Safari 14+ (macOS, iOS)
- Edge 79+ (Windows, macOS)
- Firefox 60+ (all platforms)

### Platform Features
- **iOS/macOS**: iCloud Keychain sync
- **Android**: Google Password Manager sync
- **Windows**: Microsoft Authenticator sync
- **Cross-platform**: QR code handoff

## Compliance & Standards

### Standards Compliance
- WebAuthn Level 3 (latest)
- FIDO2 certified components
- OAuth 2.0 compatible sessions
- GDPR/CCPA data handling

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Clear error messages

## Risk Mitigation

### Gradual Rollout
1. Internal testing with staff
2. Beta users opt-in
3. Percentage-based rollout
4. Full deployment with fallbacks

### Fallback Strategies
- Always maintain password option initially
- Multiple recovery methods
- Admin support interface
- Detailed audit logs

## Success Criteria

### Technical Goals
- < 2 second authentication time
- 99.9% authentication availability
- Zero password-related breaches
- 50% passkey adoption in 6 months

### User Experience Goals
- 90% successful first-attempt logins
- < 5% recovery flow usage
- 80% user satisfaction score
- 70% voluntary passkey adoption

## Conclusion

This authentication concept provides a robust, secure, and user-friendly authentication system that bridges traditional password-based auth with modern passkey technology. The progressive enhancement approach ensures no user is left behind while gradually improving security posture.

The system is designed to be implemented incrementally, allowing for testing and refinement at each phase. With proper execution, this will result in a best-in-class authentication experience that significantly reduces security risks while improving user satisfaction.