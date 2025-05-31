# Regression Test Suite

This directory contains the regression test suite for the WhyGym application. The tests are designed to be independent of the backend implementation and focus on verifying the application's behavior through HTTP APIs and web UI interactions.

## Test Structure

- `approval/` - Contains approval test helpers for snapshot testing
- `e2e/` - Contains Playwright end-to-end tests
- `approvals/` - Directory where approved snapshots are stored
- `received/` - Directory where received snapshots are stored (for comparison)

## Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- Playwright browsers (installed via `npx playwright install`)
- golang-migrate CLI tool (for database migrations)

> **Note:** The test suite uses PostgreSQL port 5435 to avoid conflicts with a local PostgreSQL instance that might be running on the default port 5432. Make sure this port is available on your system.

### Installing golang-migrate

You can install golang-migrate using one of these methods:

**macOS (using Homebrew):**
```bash
brew install golang-migrate
```

**Linux:**
```bash
curl -L https://github.com/golang-migrate/migrate/releases/download/v4.16.2/migrate.linux-amd64.tar.gz | tar xvz
sudo mv migrate /usr/local/bin/migrate
```

**Windows (using Chocolatey):**
```bash
choco install migrate
```

For other installation methods, see the [official documentation](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate).

## Running Tests

1. Make sure Docker is running on your system
2. Run the test script:
   ```bash
   ./scripts/test.sh
   ```

The script will:
1. Start a PostgreSQL container
2. Start the application container
3. Run database migrations
4. Execute the regression tests
5. Clean up containers on completion

## Approval Tests

The test suite uses approval testing to verify:
- Database state after operations
- HTML snapshots of pages
- Any other complex output that needs regression testing

### Approving Changes

When a test fails due to snapshot differences:

1. Review the differences in the `received/` directory
2. If the changes are expected, copy the received file to the approvals directory:
   ```bash
   cp "test/regression/received/<test-name>/<snapshot-name>.<extension>" "test/regression/approvals/<test-name>/<snapshot-name>.<extension>"
   ```
3. Run the tests again to verify

### Best Practices

1. Always review snapshot differences before approving
2. Keep snapshots in version control
3. Use meaningful snapshot names
4. Include only necessary data in snapshots
5. Consider using `.gitignore` to exclude `received/` directory

## Adding New Tests

1. Create a new test file in `e2e/` directory
2. Import the `ApprovalHelper` for snapshot testing
3. Follow the existing test patterns:
   - Set up database connection
   - Perform UI interactions
   - Verify database state
   - Use approval tests for complex verifications

Example:
```typescript
import { test } from '@playwright/test';
import { ApprovalHelper } from '../approval/approvalHelper';

test('my new test', async ({ page }) => {
  const approvalHelper = new ApprovalHelper('test-name');
  // ... test implementation
});
```

## Maintenance

- Regularly review and update snapshots
- Keep test data isolated and clean
- Use meaningful test descriptions
- Follow the AAA pattern (Arrange, Act, Assert)
- Keep tests independent and idempotent

## Troubleshooting

1. **Database Connection Issues**
   - Check if PostgreSQL container is running
   - Verify environment variables
   - Check network connectivity

2. **Snapshot Mismatches**
   - Review the differences
   - Verify if changes are expected
   - Update snapshots if needed

3. **Playwright Issues**
   - Run `npx playwright install` to ensure browsers are installed
   - Check browser compatibility
   - Verify selectors are still valid

## Contributing

1. Follow the existing test patterns
2. Add clear test descriptions
3. Include necessary setup and cleanup
4. Document any special requirements
5. Update this README if needed 