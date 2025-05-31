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

  // This will run exactly once before all tests, even in parallel runs
  test.beforeAll(async ({ }, testInfo) => {
    // Skip if not the first worker
    if (testInfo.workerIndex !== 0) {
      return;
    }

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
    dbClient = new Client(DB_CONFIG);
    await dbClient.connect();

    // Cleanup test user by username instead of id
    await dbClient.query(`
      DELETE FROM whygym.users WHERE username = 'rizaramadan';
    `);
    
    // Close database connection
    await dbClient.end();
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
  });
}); 