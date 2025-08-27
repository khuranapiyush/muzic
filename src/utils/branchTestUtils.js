/**
 * Branch.io Testing Utilities
 * Use these functions to test Branch integration after fixes
 */

import {
  configureBranchTimeouts,
  initializeBranchWithRetry,
  ensureBranchIdentity,
  safeBranchEventTrack,
} from './branchUtils';

/**
 * Test Branch initialization and configuration
 */
export const testBranchInitialization = async () => {
  console.log('🧪 Testing Branch initialization...');

  try {
    // Configure timeouts
    configureBranchTimeouts();
    console.log('✅ Branch timeout configuration complete');

    // Test initialization with retry
    const initResult = await initializeBranchWithRetry(2, 1000); // 2 retries, 1 second delay

    if (initResult) {
      console.log('✅ Branch initialization test passed');
      return true;
    } else {
      console.warn('⚠️ Branch initialization test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Branch initialization test error:', error);
    return false;
  }
};

/**
 * Test Branch identity setting
 */
export const testBranchIdentity = async () => {
  console.log('🧪 Testing Branch identity...');

  try {
    const identity = await ensureBranchIdentity(5000); // 5 second timeout

    if (identity) {
      console.log('✅ Branch identity test passed:', identity);
      return true;
    } else {
      console.warn('⚠️ Branch identity test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Branch identity test error:', error);
    return false;
  }
};

/**
 * Test Branch event tracking
 */
export const testBranchEventTracking = async () => {
  console.log('🧪 Testing Branch event tracking...');

  try {
    const trackingResult = await safeBranchEventTrack('TEST_EVENT', {
      test_parameter: 'test_value',
      timestamp: new Date().toISOString(),
    });

    if (trackingResult) {
      console.log('✅ Branch event tracking test passed');
      return true;
    } else {
      console.warn(
        '⚠️ Branch event tracking test failed (but fallback was used)',
      );
      return false;
    }
  } catch (error) {
    console.error('❌ Branch event tracking test error:', error);
    return false;
  }
};

/**
 * Run comprehensive Branch test suite
 */
export const runBranchTestSuite = async () => {
  console.log('🧪 Starting Branch.io test suite...');

  const results = {
    initialization: false,
    identity: false,
    eventTracking: false,
  };

  try {
    // Test initialization
    results.initialization = await testBranchInitialization();

    // Only test identity if initialization succeeded
    if (results.initialization) {
      results.identity = await testBranchIdentity();

      // Only test event tracking if identity setting succeeded
      if (results.identity) {
        results.eventTracking = await testBranchEventTracking();
      }
    }

    // Summary
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(result => result).length;

    console.log('🧪 Branch.io test suite completed:');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log('📊 Results:', results);

    if (passedTests === totalTests) {
      console.log(
        '🎉 All Branch.io tests passed! Integration is working correctly.',
      );
    } else if (passedTests > 0) {
      console.log(
        '⚠️ Some Branch.io tests failed, but basic functionality is working.',
      );
    } else {
      console.log(
        '❌ All Branch.io tests failed. Check network connectivity and configuration.',
      );
    }

    return results;
  } catch (error) {
    console.error('🚨 Branch.io test suite error:', error);
    return results;
  }
};

export default {
  testBranchInitialization,
  testBranchIdentity,
  testBranchEventTracking,
  runBranchTestSuite,
};
