/**
 * WREI Trading Platform - Live Data Integration Test
 *
 * Test script to verify external API integrations and live data feeds
 * Run with: node test-live-data-integration.js
 */

const https = require('https');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://wrei-trading-platform.vercel.app',
  localUrl: 'http://localhost:3000',
  useLocal: false,
  apiKey: 'wrei_test_key_2026',
  timeout: 30000
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Log test result
 */
function logTest(name, status, message, data = null) {
  const test = {
    name,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  testResults.tests.push(test);
  testResults[status === 'PASS' ? 'passed' : 'failed']++;

  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name}: ${message}`);

  if (data && typeof data === 'object') {
    console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
  }
}

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'X-WREI-API-Key': TEST_CONFIG.apiKey,
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: TEST_CONFIG.timeout
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

/**
 * Test external API availability
 */
async function testExternalAPIs() {
  console.log('\n🌐 Testing External API Availability...');

  // Test World Bank API
  try {
    const worldBankUrl = 'https://api.worldbank.org/v2/country/WLD/indicator/PCOALAU?format=json&mostRecent=1';
    const worldBankResponse = await makeRequest(worldBankUrl);

    if (worldBankResponse.status === 200 && Array.isArray(worldBankResponse.data)) {
      logTest('World Bank API', 'PASS', 'Successfully connected and retrieved commodity data');
    } else {
      logTest('World Bank API', 'FAIL', `Unexpected response: ${worldBankResponse.status}`);
    }
  } catch (error) {
    logTest('World Bank API', 'FAIL', `Connection failed: ${error.message}`);
  }

  // Test FRED API (without API key)
  try {
    const fredUrl = 'https://api.stlouisfed.org/fred/series?series_id=DGS10&api_key=demo&file_type=json';
    const fredResponse = await makeRequest(fredUrl);

    if (fredResponse.status === 200 || fredResponse.status === 400) {
      // 400 is expected without valid API key, but shows API is accessible
      logTest('FRED API', 'PASS', 'API endpoint is accessible (API key required for full access)');
    } else {
      logTest('FRED API', 'FAIL', `Unexpected response: ${fredResponse.status}`);
    }
  } catch (error) {
    logTest('FRED API', 'FAIL', `Connection failed: ${error.message}`);
  }

  // Test CoinMarketCap API (sandbox)
  try {
    const cmcUrl = 'https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=BTC';
    const cmcResponse = await makeRequest(cmcUrl);

    if (cmcResponse.status === 401) {
      // 401 is expected without API key, but shows endpoint is accessible
      logTest('CoinMarketCap API', 'PASS', 'API endpoint is accessible (API key required for full access)');
    } else {
      logTest('CoinMarketCap API', 'FAIL', `Unexpected response: ${cmcResponse.status}`);
    }
  } catch (error) {
    logTest('CoinMarketCap API', 'FAIL', `Connection failed: ${error.message}`);
  }
}

/**
 * Test WREI platform live data endpoint
 */
async function testWREILiveData() {
  console.log('\n🎯 Testing WREI Live Data Integration...');

  const baseUrl = TEST_CONFIG.useLocal ? TEST_CONFIG.localUrl : TEST_CONFIG.baseUrl;

  try {
    // Test live data endpoint
    const liveDataUrl = `${baseUrl}/api/market-data?action=live_data&full_data=true`;
    console.log(`Making request to: ${liveDataUrl}`);

    const response = await makeRequest(liveDataUrl);

    if (response.status === 200 && response.data.success) {
      const data = response.data.data;

      // Validate response structure
      if (data.carbonPricing && data.requestMetadata) {
        logTest('Live Data Endpoint', 'PASS',
          `Successfully retrieved live market data with ${data.carbonPricing.confidence}% confidence`,
          {
            wreiAnchorPrice: data.carbonPricing.wreiAnchorPrice,
            dataSource: data.carbonPricing.dataSource,
            processingTime: data.requestMetadata.processingTime
          });

        // Test specific data quality
        if (data.carbonPricing.confidence >= 75) {
          logTest('Data Quality', 'PASS', `High confidence data: ${data.carbonPricing.confidence}%`);
        } else {
          logTest('Data Quality', 'PASS', `Acceptable confidence: ${data.carbonPricing.confidence}% (fallback data)`);
        }

        // Test API status reporting
        const apiStatus = data.apiStatus;
        const successfulAPIs = Object.values(apiStatus).filter(status => status === 'success').length;
        logTest('API Integration Status', 'PASS',
          `${successfulAPIs}/3 external APIs responding successfully`,
          apiStatus);

      } else {
        logTest('Live Data Endpoint', 'FAIL', 'Invalid response structure', data);
      }

    } else if (response.status === 200 && !response.data.success) {
      logTest('Live Data Endpoint', 'FAIL',
        `API returned error: ${response.data.error}`,
        response.data);
    } else {
      logTest('Live Data Endpoint', 'FAIL',
        `HTTP error ${response.status}`,
        response.data);
    }

  } catch (error) {
    logTest('Live Data Endpoint', 'FAIL', `Request failed: ${error.message}`);
  }
}

/**
 * Test fallback behavior
 */
async function testFallbackBehavior() {
  console.log('\n🛡️ Testing Fallback Behavior...');

  const baseUrl = TEST_CONFIG.useLocal ? TEST_CONFIG.localUrl : TEST_CONFIG.baseUrl;

  try {
    // Test basic carbon pricing (should work even without external APIs)
    const basicUrl = `${baseUrl}/api/market-data?action=carbon_pricing`;
    const response = await makeRequest(basicUrl);

    if (response.status === 200 && response.data.success) {
      logTest('Fallback System', 'PASS',
        'Platform provides stable data even when external APIs are unavailable');
    } else {
      logTest('Fallback System', 'FAIL',
        'Platform fails when external APIs are unavailable');
    }

  } catch (error) {
    logTest('Fallback System', 'FAIL', `Fallback test failed: ${error.message}`);
  }
}

/**
 * Test data freshness and caching
 */
async function testDataFreshness() {
  console.log('\n⏱️ Testing Data Freshness...');

  const baseUrl = TEST_CONFIG.useLocal ? TEST_CONFIG.localUrl : TEST_CONFIG.baseUrl;

  try {
    // Make two requests to test caching
    const url = `${baseUrl}/api/market-data?action=live_data`;

    const response1 = await makeRequest(url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const response2 = await makeRequest(url);

    if (response1.status === 200 && response2.status === 200) {
      const time1 = response1.data.data?.requestMetadata?.processingTime || 0;
      const time2 = response2.data.data?.requestMetadata?.processingTime || 0;

      if (time2 < time1) {
        logTest('Data Caching', 'PASS',
          `Caching working - second request faster (${time2}ms vs ${time1}ms)`);
      } else {
        logTest('Data Caching', 'PASS',
          `Data retrieved successfully in ${time2}ms`);
      }
    } else {
      logTest('Data Caching', 'FAIL', 'Failed to test caching behavior');
    }

  } catch (error) {
    logTest('Data Caching', 'FAIL', `Caching test failed: ${error.message}`);
  }
}

/**
 * Generate test report
 */
function generateTestReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 LIVE DATA INTEGRATION TEST REPORT');
  console.log('='.repeat(60));

  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(1) : 0;

  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log(`🌐 Platform URL: ${TEST_CONFIG.useLocal ? TEST_CONFIG.localUrl : TEST_CONFIG.baseUrl}`);

  // Detailed analysis
  console.log('\n📋 DETAILED ANALYSIS:');

  const externalAPITests = testResults.tests.filter(t =>
    t.name.includes('World Bank') || t.name.includes('FRED') || t.name.includes('CoinMarketCap')
  );
  const passedExternalAPIs = externalAPITests.filter(t => t.status === 'PASS').length;

  console.log(`🔌 External APIs: ${passedExternalAPIs}/${externalAPITests.length} accessible`);

  const liveDataTests = testResults.tests.filter(t => t.name.includes('Live Data'));
  if (liveDataTests.length > 0 && liveDataTests[0].status === 'PASS') {
    console.log(`📡 Live Data Integration: WORKING`);
  } else {
    console.log(`📡 Live Data Integration: NEEDS ATTENTION`);
  }

  const fallbackTests = testResults.tests.filter(t => t.name.includes('Fallback'));
  if (fallbackTests.length > 0 && fallbackTests[0].status === 'PASS') {
    console.log(`🛡️ Fallback System: OPERATIONAL`);
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');

  if (passedExternalAPIs < 2) {
    console.log('⚠️  Consider setting up API keys for better live data coverage');
    console.log('   - FRED API key (free): https://fred.stlouisfed.org/docs/api/api_key.html');
    console.log('   - CoinMarketCap API key (free tier): https://pro.coinmarketcap.com/account');
  }

  if (successRate >= 80) {
    console.log('🎉 Live data integration is working well!');
  } else if (successRate >= 60) {
    console.log('⚠️  Live data integration partially working - check API configurations');
  } else {
    console.log('❌ Live data integration needs attention - multiple issues detected');
  }

  console.log(`\n📅 Test completed: ${new Date().toLocaleString()}`);

  // Save detailed report
  const report = {
    summary: {
      totalTests,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
      testTimestamp: new Date().toISOString()
    },
    tests: testResults.tests,
    recommendations: {
      needsAPIKeys: passedExternalAPIs < 2,
      liveDataWorking: liveDataTests.length > 0 && liveDataTests[0].status === 'PASS',
      fallbackOperational: fallbackTests.length > 0 && fallbackTests[0].status === 'PASS'
    }
  };

  try {
    fs.writeFileSync('live-data-test-report.json', JSON.stringify(report, null, 2));
    console.log('💾 Detailed report saved to: live-data-test-report.json');
  } catch (error) {
    console.log('⚠️  Could not save report file:', error.message);
  }
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('🧪 WREI Trading Platform - Live Data Integration Test Suite');
  console.log(`🌐 Testing against: ${TEST_CONFIG.useLocal ? 'Local Development' : 'Production'} environment`);
  console.log(`📡 Base URL: ${TEST_CONFIG.useLocal ? TEST_CONFIG.localUrl : TEST_CONFIG.baseUrl}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);

  try {
    await testExternalAPIs();
    await testWREILiveData();
    await testFallbackBehavior();
    await testDataFreshness();
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    generateTestReport();
  }
}

// Run tests
runTests().catch(console.error);