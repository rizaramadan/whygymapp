import { beforeEach, afterEach } from '@jest/globals';

// Set default price divisor for tests
process.env.PRICE_DIVISOR = '1';

// Export a function to be used in test files
export const setupTest = () => {
  // Reset any mocks or state before each test
  jest.clearAllMocks();

  // Clean up after each test
  jest.resetAllMocks();
}; 