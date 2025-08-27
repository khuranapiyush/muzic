/**
 * MoEngage Testing Utilities
 * Use these functions to test MoEngage integration after fixes
 */

import moEngageService from '../services/moengageService';

/**
 * Test MoEngage initialization
 */
export const testMoEngageInitialization = async () => {
  console.log('🧪 Testing MoEngage initialization...');

  try {
    // Reset state first
    moEngageService.resetInitializationState();

    // Test basic initialization
    const basicResult = moEngageService.initialize();

    if (basicResult) {
      console.log('✅ MoEngage basic initialization test passed');
      return true;
    } else {
      console.warn(
        '⚠️ MoEngage basic initialization failed, trying with retry...',
      );

      // Test with retry
      const retryResult = await moEngageService.initializeWithRetry(2, 1000);

      if (retryResult) {
        console.log('✅ MoEngage retry initialization test passed');
        return true;
      } else {
        console.warn('❌ MoEngage initialization test failed');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ MoEngage initialization test error:', error);
    return false;
  }
};

/**
 * Test MoEngage service state
 */
export const testMoEngageServiceState = () => {
  console.log('🧪 Testing MoEngage service state...');

  try {
    const state = moEngageService.getServiceState();

    console.log('📊 MoEngage Service State:', state);

    const hasRequiredFields = !!(
      state.appId &&
      state.sdkAvailable &&
      state.availableMethods &&
      state.availableMethods.length > 0
    );

    if (hasRequiredFields) {
      console.log('✅ MoEngage service state test passed');
      return true;
    } else {
      console.warn(
        '⚠️ MoEngage service state test failed - missing required fields',
      );
      return false;
    }
  } catch (error) {
    console.error('❌ MoEngage service state test error:', error);
    return false;
  }
};

/**
 * Test MoEngage event tracking
 */
export const testMoEngageEventTracking = () => {
  console.log('🧪 Testing MoEngage event tracking...');

  try {
    if (!moEngageService.isAvailable()) {
      console.warn('⚠️ MoEngage not available for event tracking test');
      return false;
    }

    // Test basic event tracking
    const trackingResult = moEngageService.trackEvent('TEST_EVENT', {
      test_parameter: 'test_value',
      timestamp: new Date().toISOString(),
    });

    if (trackingResult) {
      console.log('✅ MoEngage event tracking test passed');
      return true;
    } else {
      console.warn('⚠️ MoEngage event tracking test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ MoEngage event tracking test error:', error);
    return false;
  }
};

/**
 * Run comprehensive MoEngage test suite
 */
export const runMoEngageTestSuite = async () => {
  console.log('🧪 Starting MoEngage test suite...');

  const results = {
    initialization: false,
    serviceState: false,
    eventTracking: false,
  };

  try {
    // Test initialization
    results.initialization = await testMoEngageInitialization();

    // Test service state
    results.serviceState = testMoEngageServiceState();

    // Only test event tracking if initialization succeeded
    if (results.initialization) {
      results.eventTracking = testMoEngageEventTracking();
    }

    // Summary
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(result => result).length;

    console.log('🧪 MoEngage test suite completed:');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log('📊 Results:', results);

    if (passedTests === totalTests) {
      console.log(
        '🎉 All MoEngage tests passed! Integration is working correctly.',
      );
    } else if (passedTests > 0) {
      console.log(
        '⚠️ Some MoEngage tests failed, but basic functionality is working.',
      );
    } else {
      console.log(
        '❌ All MoEngage tests failed. Check configuration and native setup.',
      );
    }

    return results;
  } catch (error) {
    console.error('🚨 MoEngage test suite error:', error);
    return results;
  }
};

/**
 * Debug MoEngage module loading
 */
export const debugMoEngageModule = () => {
  console.log('🔍 Debugging MoEngage module...');

  try {
    const MoEngageModule = require('react-native-moengage');

    console.log('📦 MoEngage Module Info:', {
      hasDefault: !!MoEngageModule.default,
      hasReactMoE: !!MoEngageModule.ReactMoE,
      hasModule: !!MoEngageModule,
      moduleKeys: Object.keys(MoEngageModule),
      defaultKeys: MoEngageModule.default
        ? Object.keys(MoEngageModule.default)
        : null,
      reactMoEKeys: MoEngageModule.ReactMoE
        ? Object.keys(MoEngageModule.ReactMoE)
        : null,
    });

    return true;
  } catch (error) {
    console.error('❌ MoEngage module debug error:', error);
    return false;
  }
};

export default {
  testMoEngageInitialization,
  testMoEngageServiceState,
  testMoEngageEventTracking,
  runMoEngageTestSuite,
  debugMoEngageModule,
};
