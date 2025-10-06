/**
 * Branch Implementation Validation Script
 * Comprehensive validation of all Branch configuration and tracking
 */

import {Platform} from 'react-native';
import branch, {BranchEvent} from 'react-native-branch';
import {
  trackBranchPurchase,
  trackBranchEvent,
  ensureBranchIdentity,
} from './branchUtils';

/**
 * Validate Branch configuration and setup
 */
export const validateBranchSetup = async () => {
  console.log('🔍 Starting Branch Setup Validation...');

  const validation = {
    branchAvailable: false,
    trackingEnabled: false,
    identitySet: false,
    testMode: false,
    eventTracking: false,
    purchaseTracking: false,
    errors: [],
    warnings: [],
  };

  try {
    // 1. Check if Branch is available
    console.log('1️⃣ Checking Branch availability...');
    if (!branch) {
      validation.errors.push('Branch object is not available');
      return validation;
    }
    validation.branchAvailable = true;
    console.log('   ✅ Branch object available');

    // 2. Check tracking status
    console.log('2️⃣ Checking tracking status...');
    try {
      const isTrackingDisabled = await branch.isTrackingDisabled();
      validation.trackingEnabled = !isTrackingDisabled;
      console.log(
        `   ${validation.trackingEnabled ? '✅' : '❌'} Tracking enabled: ${
          validation.trackingEnabled
        }`,
      );

      if (isTrackingDisabled) {
        validation.warnings.push('Branch tracking is disabled');
      }
    } catch (error) {
      validation.errors.push(
        `Failed to check tracking status: ${error.message}`,
      );
    }

    // 3. Check test mode
    console.log('3️⃣ Checking test mode...');
    try {
      const params = await branch.getLatestReferringParams();
      validation.testMode =
        params?.$test_mode === true || params?.test_mode === true;
      console.log(
        `   ${validation.testMode ? '✅' : '❌'} Test mode: ${
          validation.testMode
        }`,
      );

      if (!validation.testMode) {
        validation.warnings.push(
          'Not in test mode - events will go to LIVE dashboard',
        );
      }
    } catch (error) {
      validation.warnings.push(
        `Could not determine test mode: ${error.message}`,
      );
    }

    // 4. Check identity
    console.log('4️⃣ Checking identity...');
    try {
      const identity = await ensureBranchIdentity();
      validation.identitySet = !!identity;
      console.log(
        `   ${validation.identitySet ? '✅' : '❌'} Identity set: ${
          identity || 'none'
        }`,
      );

      if (!identity) {
        validation.warnings.push(
          'No user identity set - events may not be attributed',
        );
      }
    } catch (error) {
      validation.errors.push(`Failed to set identity: ${error.message}`);
    }

    // 5. Test basic event tracking
    console.log('5️⃣ Testing basic event tracking...');
    try {
      const eventResult = await trackBranchEvent('Validation_Test_Event', {
        test: true,
        timestamp: Date.now(),
        platform: Platform.OS,
      });
      validation.eventTracking = eventResult;
      console.log(
        `   ${eventResult ? '✅' : '❌'} Basic event tracking: ${eventResult}`,
      );
    } catch (error) {
      validation.errors.push(`Basic event tracking failed: ${error.message}`);
    }

    // 6. Test purchase tracking
    console.log('6️⃣ Testing purchase tracking...');
    try {
      const purchaseResult = await trackBranchPurchase({
        revenue: 1.99,
        currency: 'INR',
        product_id: 'validation_test_purchase',
        transaction_id: `validation_${Date.now()}`,
        test: true,
      });
      validation.purchaseTracking = purchaseResult;
      console.log(
        `   ${
          purchaseResult ? '✅' : '❌'
        } Purchase tracking: ${purchaseResult}`,
      );
    } catch (error) {
      validation.errors.push(`Purchase tracking failed: ${error.message}`);
    }

    // 7. Test direct BranchEvent
    console.log('7️⃣ Testing direct BranchEvent...');
    try {
      const directEvent = new BranchEvent('Direct_Validation_Test', null, {
        customData: {
          test: String(true),
          timestamp: String(Date.now()),
          platform: String(Platform.OS),
        },
      });

      await new Promise((resolve, reject) => {
        try {
          directEvent.logEvent();
          console.log('   ✅ Direct BranchEvent sent');
          setTimeout(resolve, 200);
        } catch (error) {
          console.log('   ❌ Direct BranchEvent failed:', error);
          reject(error);
        }
      });
    } catch (error) {
      validation.warnings.push(`Direct BranchEvent failed: ${error.message}`);
    }
  } catch (error) {
    validation.errors.push(`Validation failed: ${error.message}`);
  }

  // Summary
  console.log('\n📊 Branch Validation Summary:');
  console.log(
    `   Branch Available: ${validation.branchAvailable ? '✅' : '❌'}`,
  );
  console.log(
    `   Tracking Enabled: ${validation.trackingEnabled ? '✅' : '❌'}`,
  );
  console.log(`   Test Mode: ${validation.testMode ? '✅' : '❌'}`);
  console.log(`   Identity Set: ${validation.identitySet ? '✅' : '❌'}`);
  console.log(`   Event Tracking: ${validation.eventTracking ? '✅' : '❌'}`);
  console.log(
    `   Purchase Tracking: ${validation.purchaseTracking ? '✅' : '❌'}`,
  );

  if (validation.errors.length > 0) {
    console.log('\n❌ Errors:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  const allGood =
    validation.branchAvailable &&
    validation.trackingEnabled &&
    validation.eventTracking &&
    validation.purchaseTracking &&
    validation.errors.length === 0;

  console.log(
    `\n${
      allGood
        ? '🎉 All validations passed!'
        : '⚠️ Some validations failed - check errors above'
    }`,
  );

  return validation;
};

/**
 * Test Branch purchase with all standard event types
 */
export const testAllBranchPurchaseTypes = async () => {
  console.log('🧪 Testing All Branch Purchase Types...');

  const purchaseTypes = [
    {
      name: 'Standard Purchase',
      event: BranchEvent.Purchase,
      data: {revenue: 9.99, currency: 'INR', product_id: 'standard_test'},
    },
    {
      name: 'Initiate Purchase',
      event: BranchEvent.InitiatePurchase,
      data: {product_id: 'initiate_test'},
    },
    {
      name: 'Custom Purchase',
      event: 'Custom_Purchase_Test',
      data: {amount: 19.99, currency: 'INR', product: 'custom_test'},
    },
    {
      name: 'Subscription Purchase',
      event: BranchEvent.Subscribe,
      data: {revenue: 29.99, currency: 'INR', product_id: 'subscription_test'},
    },
  ];

  for (const [index, purchaseType] of purchaseTypes.entries()) {
    console.log(`\n${index + 1}. Testing ${purchaseType.name}...`);

    try {
      const event = new BranchEvent(purchaseType.event, null, {
        customData: {
          ...Object.fromEntries(
            Object.entries(purchaseType.data).map(([k, v]) => [k, String(v)]),
          ),
          test: String(true),
          timestamp: String(Date.now()),
          platform: String(Platform.OS),
        },
      });

      await new Promise((resolve, reject) => {
        try {
          event.logEvent();
          console.log(`   ✅ ${purchaseType.name} sent successfully`);
          setTimeout(resolve, 200);
        } catch (error) {
          console.log(`   ❌ ${purchaseType.name} failed:`, error);
          reject(error);
        }
      });
    } catch (error) {
      console.log(`   ❌ ${purchaseType.name} error:`, error.message);
    }
  }

  console.log('\n✅ All Branch purchase types tested');
  console.log('📊 Check Branch dashboard for these events:');
  purchaseTypes.forEach(type => {
    console.log(`   - ${type.name} (${type.event})`);
  });
};

/**
 * Debug Branch configuration details
 */
export const debugBranchConfiguration = () => {
  console.log('🔍 Branch Configuration Debug:');
  console.log(`   Platform: ${Platform.OS}`);
  console.log(`   BranchEvent constants:`, Object.keys(BranchEvent));
  console.log(
    `   Branch methods:`,
    Object.getOwnPropertyNames(branch).filter(
      name => typeof branch[name] === 'function',
    ),
  );
  console.log(`   Branch object:`, branch);

  // Check if we're in debug mode
  console.log(`   Debug mode: ${__DEV__}`);
  console.log(`   Test mode expected: true`);
  console.log(`   Dashboard environment: TEST`);
};

export default {
  validateBranchSetup,
  testAllBranchPurchaseTypes,
  debugBranchConfiguration,
};
