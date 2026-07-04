import app from './server';
import http from 'http';

const PORT = 3001;

async function runTests() {
  console.log('--- Starting API Integration Tests ---');
  
  // 1. Spin up the server on port 3001
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on http://localhost:${PORT}`);

  let failedTests = 0;

  async function testCase(name: string, path: string, options: RequestInit, expectedStatus: number, validateBody: (body: any) => boolean) {
    try {
      const response = await fetch(`http://localhost:${PORT}${path}`, options);
      if (response.status !== expectedStatus) {
        console.error(`❌ Test failed: "${name}". Expected status ${expectedStatus}, got ${response.status}.`);
        failedTests++;
        return;
      }
      const data = await response.json();
      if (validateBody(data)) {
        console.log(`✅ Test passed: "${name}"`);
      } else {
        console.error(`❌ Test failed: "${name}". Response body validation failed.`, data);
        failedTests++;
      }
    } catch (error) {
      console.error(`❌ Test failed: "${name}". Error encountered:`, error);
      failedTests++;
    }
  }

  // FLOW 1: API Input Validation & Sanitization
  // Negative Path: Empty/Missing destination should return 400 Error
  await testCase(
    'Validation - Empty Destination (Negative Path)',
    '/api/generate-journey',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: 5, travelers: 2 })
    },
    400,
    (body) => body.error && body.error.includes('Destination must be a non-empty string')
  );

  // FLOW 2: Missing Gemini API Key
  // Negative Path: Running without API key when none is set
  const originalApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  await testCase(
    'Authentication - Missing Gemini API Key (Negative Path)',
    '/api/generate-journey',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: 'Kyoto', duration: 3, travelers: 1 })
    },
    400,
    (body) => body.error && body.error.includes('Gemini API key is not configured')
  );
  process.env.GEMINI_API_KEY = originalApiKey; // Restore key

  // 2. Shut down test server
  console.log('Shutting down test server...');
  await new Promise<void>((resolve) => server.close(() => resolve()));
  
  console.log('--- Integration Tests Finished ---');
  if (failedTests > 0) {
    console.error(`⚠️  Tests completed with ${failedTests} failure(s).`);
    process.exit(1);
  } else {
    console.log('🎉 All tests passed successfully!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal testing error:', err);
  process.exit(1);
});
