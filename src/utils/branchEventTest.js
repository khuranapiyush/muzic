/**
 * Comprehensive Branch Event Testing Suite
 * Tests all Branch events (Login, Registration, Purchase) with proper validation
 */

import {Platform} from 'react-native';
import branch, {BranchEvent} from 'react-native-branch';
import {
  trackBranchLogin,
  trackBranchRegistration,
  trackBranchPurchase,
  trackBranchPurchaseInitiation,
  ensureBranchIdentity,
} from './branchUtils';

/**
 * Test all Branch events comprehensively
 */
export const testAllBranchEvents = async () => {
  console.log('🧪 Starting Comprehensive Branch Event Testing...');

  const results = {
    login: false,
    registration: false,
    purchase: false,
    purchaseInitiation: false,
    directEvents: false,
    errors: [],
    warnings: [],
  };

  try {
    // 1. Test Login Event
    console.log('\n1️⃣ Testing Branch Login Event...');
    try {
      const loginResult = await trackBranchLogin('test_method');
      results.login = loginResult;
      console.log(
        `   ${loginResult ? '✅' : '❌'} Login event: ${loginResult}`,
      );
    } catch (error) {
      results.errors.push(`Login event failed: ${error.message}`);
      console.log(`   ❌ Login event error: ${error.message}`);
    }

    // 2. Test Registration Event
    console.log('\n2️⃣ Testing Branch Registration Event...');
    try {
      const registrationResult = await trackBranchRegistration('test_method', {
        country_code: 'IN',
        test: true,
      });
      results.registration = registrationResult;
      console.log(
        `   ${
          registrationResult ? '✅' : '❌'
        } Registration event: ${registrationResult}`,
      );
    } catch (error) {
      results.errors.push(`Registration event failed: ${error.message}`);
      console.log(`   ❌ Registration event error: ${error.message}`);
    }

    // 3. Test Purchase Event
    console.log('\n3️⃣ Testing Branch Purchase Event...');
    try {
      const purchaseResult = await trackBranchPurchase({
        revenue: 9.99,
        currency: 'INR',
        product_id: 'test_purchase_comprehensive',
        transaction_id: `test_${Date.now()}`,
        test: true,
      });
      results.purchase = purchaseResult;
      console.log(
        `   ${purchaseResult ? '✅' : '❌'} Purchase event: ${purchaseResult}`,
      );
    } catch (error) {
      results.errors.push(`Purchase event failed: ${error.message}`);
      console.log(`   ❌ Purchase event error: ${error.message}`);
    }

    // 4. Test Purchase Initiation Event
    console.log('\n4️⃣ Testing Branch Purchase Initiation Event...');
    try {
      const purchaseInitResult = await trackBranchPurchaseInitiation(
        'test_product_init',
      );
      results.purchaseInitiation = purchaseInitResult;
      console.log(
        `   ${
          purchaseInitResult ? '✅' : '❌'
        } Purchase initiation event: ${purchaseInitResult}`,
      );
    } catch (error) {
      results.errors.push(`Purchase initiation event failed: ${error.message}`);
      console.log(`   ❌ Purchase initiation event error: ${error.message}`);
    }

    // 5. Test Direct BranchEvent Creation
    console.log('\n5️⃣ Testing Direct BranchEvent Creation...');
    try {
      const directEvent = new BranchEvent('Comprehensive_Test_Event', {
        test: true,
        timestamp: Date.now(),
        platform: Platform.OS,
        source: 'comprehensive_test',
      });

      await new Promise((resolve, reject) => {
        try {
          directEvent.logEvent();
          console.log('   ✅ Direct BranchEvent sent successfully');
          results.directEvents = true;
          setTimeout(resolve, 200);
        } catch (error) {
          console.log('   ❌ Direct BranchEvent failed:', error);
          reject(error);
        }
      });
    } catch (error) {
      results.errors.push(`Direct BranchEvent failed: ${error.message}`);
      console.log(`   ❌ Direct BranchEvent error: ${error.message}`);
    }

    // 6. Test Identity Setting
    console.log('\n6️⃣ Testing Branch Identity...');
    try {
      const identity = await ensureBranchIdentity();
      console.log(
        `   ${identity ? '✅' : '❌'} Identity set: ${identity || 'none'}`,
      );
      if (!identity) {
        results.warnings.push('No user identity set');
      }
    } catch (error) {
      results.errors.push(`Identity setting failed: ${error.message}`);
      console.log(`   ❌ Identity error: ${error.message}`);
    }
  } catch (error) {
    results.errors.push(`Comprehensive test failed: ${error.message}`);
    console.error('❌ Comprehensive test error:', error);
  }

  // Summary
  console.log('\n📊 Comprehensive Branch Event Test Summary:');
  console.log(`   Login Event: ${results.login ? '✅' : '❌'}`);
  console.log(`   Registration Event: ${results.registration ? '✅' : '❌'}`);
  console.log(`   Purchase Event: ${results.purchase ? '✅' : '❌'}`);
  console.log(
    `   Purchase Initiation: ${results.purchaseInitiation ? '✅' : '❌'}`,
  );
  console.log(`   Direct Events: ${results.directEvents ? '✅' : '❌'}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    results.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  const allPassed =
    results.login &&
    results.registration &&
    results.purchase &&
    results.purchaseInitiation &&
    results.directEvents &&
    results.errors.length === 0;

  console.log(
    `\n${
      allPassed
        ? '🎉 All Branch events working!'
        : '⚠️ Some Branch events failed'
    }`,
  );

  return results;
};

/**
 * Test Branch events with different data types
 */
export const testBranchEventDataTypes = async () => {
  console.log('🧪 Testing Branch Event Data Types...');

  const testCases = [
    {
      name: 'String Data',
      event: 'Test_String_Event',
      data: {text: 'hello', method: 'string_test'},
    },
    {
      name: 'Numeric Data',
      event: 'Test_Numeric_Event',
      data: {count: 42, price: 99.99, quantity: 5},
    },
    {
      name: 'Boolean Data',
      event: 'Test_Boolean_Event',
      data: {enabled: true, verified: false, test: true},
    },
    {
      name: 'Mixed Data',
      event: 'Test_Mixed_Event',
      data: {
        name: 'test_user',
        age: 25,
        active: true,
        score: 95.5,
        tags: ['test', 'branch', 'events'],
      },
    },
  ];

  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n${index + 1}. Testing ${testCase.name}...`);

    try {
      const event = new BranchEvent(testCase.event, {
        ...testCase.data,
        timestamp: Date.now(),
        platform: Platform.OS,
      });

      await new Promise((resolve, reject) => {
        try {
          event.logEvent();
          console.log(`   ✅ ${testCase.name} sent successfully`);
          setTimeout(resolve, 200);
        } catch (error) {
          console.log(`   ❌ ${testCase.name} failed:`, error);
          reject(error);
        }
      });
    } catch (error) {
      console.log(`   ❌ ${testCase.name} error:`, error.message);
    }
  }

  console.log('\n✅ Branch Event Data Types test completed');
};

/**
 * Test Branch event timing and batching
 */
export const testBranchEventTiming = async () => {
  console.log('🧪 Testing Branch Event Timing...');

  const events = [
    {name: 'Event_1', delay: 0},
    {name: 'Event_2', delay: 100},
    {name: 'Event_3', delay: 200},
    {name: 'Event_4', delay: 300},
    {name: 'Event_5', delay: 400},
  ];

  console.log('Sending 5 events with 100ms intervals...');

  for (const [index, event] of events.entries()) {
    setTimeout(async () => {
      try {
        const branchEvent = new BranchEvent(event.name, {
          sequence: index + 1,
          timestamp: Date.now(),
          platform: Platform.OS,
        });

        branchEvent.logEvent();
        console.log(`   ✅ ${event.name} sent (sequence: ${index + 1})`);
      } catch (error) {
        console.log(`   ❌ ${event.name} failed:`, error);
      }
    }, event.delay);
  }

  console.log('✅ Branch Event Timing test initiated');
};

export default {
  testAllBranchEvents,
  testBranchEventDataTypes,
  testBranchEventTiming,
};
