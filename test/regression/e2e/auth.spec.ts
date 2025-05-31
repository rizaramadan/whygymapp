import { test, expect } from '@playwright/test';
import { ApprovalHelper } from '../approval/approvalHelper';
import { Client } from 'pg';

// Database connection configuration
const DB_CONFIG = {
  host: process.env.POSTGRES_HOST!,
  port: parseInt(process.env.POSTGRES_PORT!),
  database: process.env.POSTGRES_DB!,
  user: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
};

test.describe('Authentication', () => {
  let approvalHelper: ApprovalHelper;
  let dbClient: Client;

  test.beforeAll(async () => {
    // Initialize approval helper
    approvalHelper = new ApprovalHelper('auth');
    
    // Initialize database connection
    dbClient = new Client(DB_CONFIG);
    await dbClient.connect();

    // Setup test user - this runs once before all tests
    // Using ON CONFLICT DO NOTHING to ensure idempotency
    await dbClient.query(`
      INSERT INTO whygym.users (username, password, email, created_at, updated_at) 
      VALUES ('rizaramadan', '$1$hPPLn9.g$XUcY2AlqOigL/qR7oX8Hl0', 'riza.ramadan@gmail.com', 'now()', 'now()')
      ON CONFLICT (username) DO NOTHING;
    `);
  });

  test.afterAll(async () => {
    // Cleanup test user by username instead of id
    await dbClient.query(`
      DELETE FROM whygym.users WHERE username = 'rizaramadan';
    `);
    
    // Close database connection
    await dbClient.end();
  });


  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to username/password login page
    await page.goto('/auth/login-user-pass');
    
    // Fill invalid credentials
    await page.fill('input[name="username"]', 'invaliduser');
    await page.fill('input[name="password"]', 'wrongpass');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for error dialog
    await expect(page.locator('#error-dialog')).toBeVisible();
    
    // Verify error message
    const errorMessage = await page.locator('#error-dialog-message').textContent();
    expect(errorMessage).toContain('Invalid username or password');
    
    // Take HTML snapshot of error dialog
    const errorDialogHtml = await page.locator('#error-dialog').innerHTML();
    await approvalHelper.verifyHtml(errorDialogHtml, 'invalid-credentials-error');
  });

  test('should redirect to visit page after successful login', async ({ page }) => {
    // Navigate to username/password login page
    await page.goto('/auth/login-user-pass');
    
    // Fill valid credentials (you might want to create a test user first)
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await expect(page).toHaveURL('/members/visit');
    
    // Verify user session in database
    const result = await dbClient.query(`
      SELECT user_id, created_at, expires_at 
      FROM sessions 
      WHERE user_id = (SELECT id FROM users WHERE username = 'testuser')
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    // Verify database state using approval test
    await approvalHelper.verifyJson(result.rows[0], 'user-session');
  });

  test('should login and verify user profile', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/auth/login-user-pass');
    
    // 2. Fill username
    await page.fill('input[name="username"]', 'rizaramadan');
    
    // 3. Fill password
    await page.fill('input[name="password"]', '123qweasd');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // 4. Navigate to profile page and verify user info
    await page.goto('/me');
    
    // Verify username
    const usernameElement = await page.locator('text=rizaramadan');
    await expect(usernameElement).toBeVisible();
    
    // Verify email
    const emailElement = await page.locator('text=rizaramadan@whygym.id');
    await expect(emailElement).toBeVisible();
    
    // Take HTML snapshot of profile page
    const profilePageHtml = await page.content();
    await approvalHelper.verifyHtml(profilePageHtml, 'user-profile');
  });
}); 