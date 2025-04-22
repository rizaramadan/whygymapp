// Set default environment variables for testing
process.env.PRICE_DIVISOR = '1';

// Add any other test setup code here
beforeEach(() => {
  // Reset any mocks or state before each test
  jest.clearAllMocks();
}); 