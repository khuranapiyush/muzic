/**
 * Branch Debug Utilities
 * Use these functions to debug Branch tracking issues
 */

import {
  checkBranchStatus,
  trackBranchEvent,
  safeBranchEventTrack,
} from './branchUtils';

/**
 * Debug Branch configuration and status
 */
export const debugBranchConfiguration = async () => {
  console.log('🔍 === BRANCH DEBUG CONFIGURATION ===');

  try {
    // Check Branch status
    const status = await checkBranchStatus();
    console.log('📊 Branch Status:', status);

    // Test a simple event
    console.log('🧪 Testing Branch event tracking...');
    const testResult = await safeBranchEventTrack('DEBUG_TEST_EVENT', {
      test_parameter: 'debug_value',
      timestamp: new Date().toISOString(),
      debug_mode: true,
    });

    console.log('✅ Test event result:', testResult);

    return {
      status,
      testEventResult: testResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Branch debug failed:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Test all Branch event types
 */
export const testAllBranchEvents = async () => {
  console.log('🧪 === TESTING ALL BRANCH EVENTS ===');

  const events = [
    {name: 'TEST_LOGIN', data: {method: 'debug'}},
    {name: 'TEST_REGISTRATION', data: {method: 'debug'}},
    {
      name: 'TEST_PURCHASE',
      data: {revenue: 1.99, currency: 'USD', product_id: 'test_product'},
    },
    {name: 'TEST_AI_EVENT', data: {type: 'debug_test'}},
  ];

  const results = {};

  for (const event of events) {
    try {
      console.log(`🧪 Testing event: ${event.name}`);
      const result = await safeBranchEventTrack(event.name, event.data);
      results[event.name] = result;
      console.log(`✅ ${event.name} result:`, result);
    } catch (error) {
      console.error(`❌ ${event.name} failed:`, error);
      results[event.name] = false;
    }
  }

  console.log('📊 All events test results:', results);
  return results;
};

/**
 * Monitor Branch events in real-time
 */
export const startBranchEventMonitoring = () => {
  console.log('👀 Starting Branch event monitoring...');

  // Override console.log to catch Branch events
  const originalLog = console.log;
  console.log = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Branch')) {
      console.log('🔍 [BRANCH MONITOR]', ...args);
    }
    originalLog(...args);
  };

  return () => {
    console.log = originalLog;
    console.log('👀 Branch event monitoring stopped');
  };
};

export default {
  debugBranchConfiguration,
  testAllBranchEvents,
  startBranchEventMonitoring,
};
