/**
 * Branch Purchase Tracking Test Utilities
 * Use these to debug and test Branch purchase events
 */

import {Platform} from 'react-native';
import branch, {BranchEvent} from 'react-native-branch';
import {trackBranchPurchase, ensureBranchIdentity} from './branchUtils';

/**
 * Test Branch purchase tracking with detailed logging
 */
export const testBranchPurchaseTracking = async () => {
  console.log('🧪 Starting Branch Purchase Tracking Test...');

  try {
    // Step 1: Check Branch availability
    console.log('1️⃣ Checking Branch availability...');
    const isTrackingDisabled = await branch.isTrackingDisabled();
    console.log('   Branch tracking disabled:', isTrackingDisabled);

    if (isTrackingDisabled) {
      console.log(
        '❌ Branch tracking is disabled - cannot test purchase events',
      );
      return false;
    }

    // Step 2: Ensure identity is set
    console.log('2️⃣ Setting Branch identity...');
    const identity = await ensureBranchIdentity();
    console.log('   Branch identity set:', identity);

    // Step 3: Test direct BranchEvent.Purchase
    console.log('3️⃣ Testing direct BranchEvent.Purchase...');
    try {
      const directPurchaseEvent = new BranchEvent(BranchEvent.Purchase, {
        revenue: 9.99,
        currency: 'INR',
        transactionID: `test_tx_${Date.now()}`,
        product_id: 'test_product_direct',
        test_mode: true,
        platform: Platform.OS,
      });

      await new Promise((resolve, reject) => {
        try {
          directPurchaseEvent.logEvent();
          console.log('   ✅ Direct BranchEvent.Purchase sent successfully');
          setTimeout(resolve, 200);
        } catch (error) {
          console.log('   ❌ Direct BranchEvent.Purchase failed:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.log('   ❌ Direct BranchEvent.Purchase error:', error);
    }

    // Step 4: Test trackBranchPurchase utility
    console.log('4️⃣ Testing trackBranchPurchase utility...');
    const purchaseData = {
      revenue: 19.99,
      currency: 'INR',
      product_id: 'test_product_utility',
      transaction_id: `test_tx_utility_${Date.now()}`,
      test_mode: true,
      platform: Platform.OS,
    };

    const utilityResult = await trackBranchPurchase(purchaseData);
    console.log('   trackBranchPurchase result:', utilityResult);

    // Step 5: Test with minimal data
    console.log('5️⃣ Testing with minimal purchase data...');
    const minimalData = {
      revenue: 4.99,
      product_id: 'test_minimal',
    };

    const minimalResult = await trackBranchPurchase(minimalData);
    console.log('   Minimal data result:', minimalResult);

    // Step 6: Test custom purchase event
    console.log('6️⃣ Testing custom purchase event...');
    try {
      const customEvent = new BranchEvent('Custom_Purchase', {
        amount: 29.99,
        currency: 'INR',
        product: 'test_custom_product',
        test: true,
      });

      await new Promise((resolve, reject) => {
        try {
          customEvent.logEvent();
          console.log('   ✅ Custom purchase event sent');
          setTimeout(resolve, 200);
        } catch (error) {
          console.log('   ❌ Custom purchase event failed:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.log('   ❌ Custom purchase event error:', error);
    }

    console.log('✅ Branch Purchase Tracking Test completed');
    console.log('📊 Check Branch dashboard in TEST mode for these events:');
    console.log('   - BranchEvent.Purchase (revenue: 9.99)');
    console.log('   - BranchEvent.Purchase (revenue: 19.99)');
    console.log('   - BranchEvent.Purchase (revenue: 4.99)');
    console.log('   - Custom_Purchase (amount: 29.99)');

    return true;
  } catch (error) {
    console.error('❌ Branch Purchase Tracking Test failed:', error);
    return false;
  }
};

/**
 * Test Branch purchase with different revenue values
 */
export const testBranchPurchaseVariations = async () => {
  console.log('🧪 Testing Branch Purchase Variations...');

  const testCases = [
    {revenue: 0.99, currency: 'USD', product_id: 'test_usd'},
    {revenue: 99, currency: 'INR', product_id: 'test_inr'},
    {revenue: 1, currency: 'EUR', product_id: 'test_eur'},
    {revenue: 50.5, currency: 'INR', product_id: 'test_decimal'},
  ];

  for (const [index, testCase] of testCases.entries()) {
    console.log(`Testing case ${index + 1}:`, testCase);

    try {
      const result = await trackBranchPurchase({
        ...testCase,
        transaction_id: `test_variation_${index}_${Date.now()}`,
        test_mode: true,
      });

      console.log(`   Result: ${result ? '✅ Success' : '❌ Failed'}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Branch Purchase Variations test completed');
};

/**
 * Debug Branch purchase event structure
 */
export const debugBranchPurchaseStructure = () => {
  console.log('🔍 Branch Purchase Event Structure Debug:');
  console.log('   BranchEvent.Purchase:', BranchEvent.Purchase);
  console.log('   Available BranchEvent constants:', Object.keys(BranchEvent));
  console.log('   Platform:', Platform.OS);
  console.log(
    '   Branch object methods:',
    Object.getOwnPropertyNames(branch).filter(
      name => typeof branch[name] === 'function',
    ),
  );
};

export default {
  testBranchPurchaseTracking,
  testBranchPurchaseVariations,
  debugBranchPurchaseStructure,
};
