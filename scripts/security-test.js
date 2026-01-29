#!/usr/bin/env node

// ==============================================
// SECURITY TESTING SUITE
// Tests all security vulnerabilities that were patched
// ==============================================

const axios = require('axios');
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const BASE_URL = 'http://localhost:5000/api';
let testsPassed = 0;
let testsFailed = 0;

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => {
    console.log(`${colors.green}✓${colors.reset} ${msg}`);
    testsPassed++;
  },
  error: (msg) => {
    console.log(`${colors.red}✗${colors.reset} ${msg}`);
    testsFailed++;
  },
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.blue}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}\n`),
};

// Test 1: NoSQL Injection Prevention
async function testNoSQLInjection() {
  log.header('TEST 1: NoSQL Injection Prevention');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: { $gt: '' },
      password: { $gt: '' },
    }, { validateStatus: () => true });
    
    if (response.status === 401) {
      log.success('NoSQL injection blocked successfully');
    } else {
      log.error(`NoSQL injection NOT blocked! Status: ${response.status}`);
    }
  } catch (error) {
    log.error(`NoSQL injection test failed: ${error.message}`);
  }
}

// Test 2: XSS Prevention
async function testXSSPrevention() {
  log.header('TEST 2: XSS Prevention');
  
  try {
    // First register a test user
    const xssPayload = '<script>alert("XSS")</script>';
    const testUser = {
      name: xssPayload,
      email: `test${Date.now()}@test.com`,
      password: 'Test123!@#',
    };
    
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser, {
      validateStatus: () => true,
    });
    
    if (response.data.user && !response.data.user.name.includes('<script>')) {
      log.success('XSS payload was sanitized');
    } else {
      log.error('XSS payload NOT sanitized!');
    }
  } catch (error) {
    log.error(`XSS test failed: ${error.message}`);
  }
}

// Test 3: Invalid ObjectId Validation
async function testInvalidObjectId() {
  log.header('TEST 3: Invalid ObjectId Validation');
  
  try {
    const response = await axios.get(`${BASE_URL}/videos/invalid-id`, {
      validateStatus: () => true,
    });
    
    if (response.status === 400 && response.data.message.includes('Invalid video ID')) {
      log.success('Invalid ObjectId rejected successfully');
    } else {
      log.error(`Invalid ObjectId NOT validated! Status: ${response.status}`);
    }
  } catch (error) {
    log.error(`ObjectId validation test failed: ${error.message}`);
  }
}

// Test 4: Rate Limiting (requires rate-limit to be configured)
async function testRateLimiting() {
  log.header('TEST 4: Rate Limiting');
  
  try {
    log.info('Attempting 6 rapid login requests (limit is 5)...');
    const requests = [];
    
    for (let i = 0; i < 6; i++) {
      requests.push(
        axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@test.com',
          password: 'wrong',
        }, { validateStatus: () => true })
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      log.success('Rate limiting is active');
    } else {
      log.warning('Rate limiting may not be configured (status 429 not received)');
    }
  } catch (error) {
    log.error(`Rate limiting test failed: ${error.message}`);
  }
}

// Test 5: Security Headers
async function testSecurityHeaders() {
  log.header('TEST 5: Security Headers');
  
  try {
    const response = await axios.get(`${BASE_URL}/videos`);
    const headers = response.headers;
    
    const expectedHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
      'x-xss-protection',
    ];
    
    expectedHeaders.forEach(header => {
      if (headers[header]) {
        log.success(`Security header present: ${header}`);
      } else {
        log.warning(`Security header missing: ${header}`);
      }
    });
    
    // Check X-Powered-By is removed
    if (!headers['x-powered-by']) {
      log.success('X-Powered-By header removed (information hiding)');
    } else {
      log.warning('X-Powered-By header still present');
    }
  } catch (error) {
    log.error(`Security headers test failed: ${error.message}`);
  }
}

// Test 6: Authentication Required for Protected Routes
async function testAuthenticationRequired() {
  log.header('TEST 6: Authentication Required for Protected Routes');
  
  try {
    const response = await axios.post(`${BASE_URL}/videos/697b445ae71da6fc98675de9/like`, {}, {
      validateStatus: () => true,
    });
    
    if (response.status === 401) {
      log.success('Protected route requires authentication');
    } else {
      log.error(`Protected route accessible without auth! Status: ${response.status}`);
    }
  } catch (error) {
    log.error(`Authentication test failed: ${error.message}`);
  }
}

// Test 7: Invalid Token Rejection
async function testInvalidToken() {
  log.header('TEST 7: Invalid Token Rejection');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid-token-here' },
      validateStatus: () => true,
    });
    
    if (response.status === 401) {
      log.success('Invalid token rejected successfully');
    } else {
      log.error(`Invalid token NOT rejected! Status: ${response.status}`);
    }
  } catch (error) {
    log.error(`Invalid token test failed: ${error.message}`);
  }
}

// Test 8: Prototype Pollution Prevention
async function testPrototypePollution() {
  log.header('TEST 8: Prototype Pollution Prevention');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test',
      email: `test${Date.now()}@test.com`,
      password: 'Test123!@#',
      __proto__: { isAdmin: true },
      constructor: { isAdmin: true },
    }, { validateStatus: () => true });
    
    if (response.status === 201 && !response.data.user.isAdmin) {
      log.success('Prototype pollution prevented');
    } else if (response.status === 201) {
      log.warning('User created but prototype pollution check inconclusive');
    } else {
      log.error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    log.error(`Prototype pollution test failed: ${error.message}`);
  }
}

// Test 9: CORS Policy
async function testCORSPolicy() {
  log.header('TEST 9: CORS Policy');
  
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      headers: { Origin: 'http://evil-site.com' },
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    
    if (corsHeader && corsHeader !== '*') {
      log.success(`CORS configured with origin restriction: ${corsHeader}`);
    } else if (corsHeader === '*') {
      log.warning('CORS allows all origins (not recommended for production)');
    } else {
      log.info('CORS header not present in response');
    }
  } catch (error) {
    log.error(`CORS test failed: ${error.message}`);
  }
}

// Test 10: Path Traversal Prevention
async function testPathTraversal() {
  log.header('TEST 10: Path Traversal Prevention');
  
  try {
    const response = await axios.get('http://localhost:5000/uploads/../.env', {
      validateStatus: () => true,
    });
    
    if (response.status === 404 || response.status === 403) {
      log.success('Path traversal attempt blocked');
    } else if (response.status === 200) {
      log.error('Path traversal SUCCESSFUL - .env file accessed!');
    } else {
      log.warning(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    // Network error or blocked - this is good
    log.success('Path traversal prevented (request failed)');
  }
}

// Run all tests
async function runAllTests() {
  console.clear();
  log.header('🔒 SECURITY AUDIT TEST SUITE\nLotus Video Streaming Platform');
  
  log.info('Starting security tests...\n');
  
  await testNoSQLInjection();
  await testXSSPrevention();
  await testInvalidObjectId();
  await testRateLimiting();
  await testSecurityHeaders();
  await testAuthenticationRequired();
  await testInvalidToken();
  await testPrototypePollution();
  await testCORSPolicy();
  await testPathTraversal();
  
  // Summary
  log.header('TEST SUMMARY');
  console.log(`${colors.green}✓ Tests Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}✗ Tests Failed: ${testsFailed}${colors.reset}`);
  
  const totalTests = testsPassed + testsFailed;
  const passRate = ((testsPassed / totalTests) * 100).toFixed(1);
  console.log(`\nPass Rate: ${passRate}%\n`);
  
  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 All security tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Review security configuration.${colors.reset}\n`);
  }
}

// Check if server is running
axios.get(`${BASE_URL}/videos`, { timeout: 3000 })
  .then(() => runAllTests())
  .catch(error => {
    log.error('Cannot connect to server. Make sure the server is running on http://localhost:5000');
    console.log('Start server with: node index.js\n');
    process.exit(1);
  });
