import { test, expect } from '@playwright/test'

const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
}

test.describe('Authentication', () => {
  test('should display login and register buttons when not authenticated', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Modern authentication with password support')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Get Started' }).click()

    await expect(page).toHaveURL('/auth/register')
    await expect(page.getByText('Create Account')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Sign In' }).click()

    await expect(page).toHaveURL('/auth/login')
    await expect(page.getByText('Sign In')).toBeVisible()
  })

  test('should register a new user', async ({ page }) => {
    await page.goto('/auth/register')

    // Fill registration form
    await page.getByPlaceholder('Enter your name').fill(testUser.name)
    await page.getByPlaceholder('Enter your email').fill(testUser.email)
    await page.getByPlaceholder('Create a password').fill(testUser.password)
    await page.getByPlaceholder('Confirm your password').fill(testUser.password)

    // Accept terms
    await page.getByRole('checkbox').check()

    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should redirect to home page and show welcome message
    await expect(page).toHaveURL('/')
    await expect(page.getByText(`Hello, ${testUser.name}!`)).toBeVisible()
    await expect(page.getByText('You are successfully authenticated.')).toBeVisible()
  })

  test('should login with existing user', async ({ page }) => {
    // First register a user
    const loginUser = {
      email: `login-${Date.now()}@example.com`,
      password: 'LoginPassword123!',
      name: 'Login User'
    }

    await page.goto('/auth/register')
    await page.getByPlaceholder('Enter your name').fill(loginUser.name)
    await page.getByPlaceholder('Enter your email').fill(loginUser.email)
    await page.getByPlaceholder('Create a password').fill(loginUser.password)
    await page.getByPlaceholder('Confirm your password').fill(loginUser.password)
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait for registration to complete
    await expect(page.getByText(`Hello, ${loginUser.name}!`)).toBeVisible()

    // Logout
    await page.getByRole('button', { name: loginUser.name.substring(0, 1) }).click() // Avatar button
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    // Wait for logout
    await expect(page.getByText('Modern authentication with password support')).toBeVisible()

    // Login
    await page.goto('/auth/login')
    await page.getByPlaceholder('Enter your email').fill(loginUser.email)
    await page.getByPlaceholder('Enter your password').fill(loginUser.password)
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should be logged in
    await expect(page).toHaveURL('/')
    await expect(page.getByText(`Hello, ${loginUser.name}!`)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')

    await page.getByPlaceholder('Enter your email').fill('wrong@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Should show error toast
    await expect(page.getByText('Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL('/auth/login')
  })

  test('should show error when registering with existing email', async ({ page }) => {
    const existingUser = {
      email: `existing-${Date.now()}@example.com`,
      password: 'ExistingPassword123!',
      name: 'Existing User'
    }

    // Register first time
    await page.goto('/auth/register')
    await page.getByPlaceholder('Enter your name').fill(existingUser.name)
    await page.getByPlaceholder('Enter your email').fill(existingUser.email)
    await page.getByPlaceholder('Create a password').fill(existingUser.password)
    await page.getByPlaceholder('Confirm your password').fill(existingUser.password)
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.getByText(`Hello, ${existingUser.name}!`)).toBeVisible()

    // Logout
    await page.getByRole('button', { name: existingUser.name.substring(0, 1) }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()

    // Try to register with same email
    await page.goto('/auth/register')
    await page.getByPlaceholder('Enter your name').fill('Another User')
    await page.getByPlaceholder('Enter your email').fill(existingUser.email)
    await page.getByPlaceholder('Create a password').fill('AnotherPassword123!')
    await page.getByPlaceholder('Confirm your password').fill('AnotherPassword123!')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show error
    await expect(page.getByText('User already exists')).toBeVisible()
  })

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/auth/register')

    await page.getByPlaceholder('Enter your email').fill('test@example.com')
    await page.getByPlaceholder('Create a password').fill('short')
    await page.getByPlaceholder('Confirm your password').fill('short')
    await page.getByRole('checkbox').check()

    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show validation error
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should redirect authenticated users away from auth pages', async ({ page }) => {
    // Register and stay logged in
    const authUser = {
      email: `auth-${Date.now()}@example.com`,
      password: 'AuthPassword123!',
      name: 'Auth User'
    }

    await page.goto('/auth/register')
    await page.getByPlaceholder('Enter your name').fill(authUser.name)
    await page.getByPlaceholder('Enter your email').fill(authUser.email)
    await page.getByPlaceholder('Create a password').fill(authUser.password)
    await page.getByPlaceholder('Confirm your password').fill(authUser.password)
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.getByText(`Hello, ${authUser.name}!`)).toBeVisible()

    // Try to access login page while authenticated
    await page.goto('/auth/login')
    await expect(page).toHaveURL('/')

    // Try to access register page while authenticated
    await page.goto('/auth/register')
    await expect(page).toHaveURL('/')
  })
})