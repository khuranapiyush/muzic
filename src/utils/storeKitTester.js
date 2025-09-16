/**
 * StoreKit Tester Utility
 * This file provides debugging utilities for StoreKit testing in iOS
 */

import * as RNIap from 'react-native-iap';
import {Platform, NativeModules} from 'react-native';

// Product IDs we're testing with
const TEST_PRODUCT_IDS = ['payment_101', 'payment_201', 'payment_301'];

// Function to check if we're in StoreKit Test Environment
export const isInStoreKitTestEnvironment = () => {
  if (Platform.OS !== 'ios') {return false;}

  // Check if we're in a simulator
  const isSimulator =
    !Platform.isPad &&
    !Platform.isTV &&
    (Platform.constants.uiMode?.includes?.('simulator') ||
      (typeof navigator !== 'undefined' &&
        navigator.product === 'ReactNative'));

  return __DEV__ || isSimulator;
};

// Function to test fetching products
export const testFetchProducts = async () => {
  console.log('====== STOREKIT TEST - FETCHING PRODUCTS ======');
  console.log('Platform:', Platform.OS);
  console.log('Testing with product IDs:', TEST_PRODUCT_IDS);

  try {
    // End any existing connection (to be safe)
    try {
      await RNIap.endConnection();
      console.log('Ended existing IAP connection');
    } catch (err) {
      console.log('No existing connection to end');
    }

    // Initialize connection
    await RNIap.initConnection();
    console.log('IAP connection initialized');

    // Try with different parameter combinations
    console.log('Attempt 1: Basic product request');
    const products1 = await RNIap.getProducts({
      skus: TEST_PRODUCT_IDS,
    });
    logProducts(products1, 'Attempt 1');

    // Use a brief delay before next attempt
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try another approach
    console.log('Attempt 2: Force refresh');
    const products2 = await RNIap.getProducts({
      skus: TEST_PRODUCT_IDS,
      forceRefresh: true,
    });
    logProducts(products2, 'Attempt 2');

    return products1.length > 0 ? products1 : products2;
  } catch (error) {
    console.error('Error testing StoreKit:', error);
    return [];
  }
};

// Function to log product details
const logProducts = (products, label) => {
  console.log(`${label} results: Found ${products?.length || 0} products`);

  if (products && products.length > 0) {
    console.log(
      'Product IDs found:',
      products.map(p => p.productId).join(', '),
    );
    products.forEach(product => {
      console.log(`Product: ${product.title || product.productId}`);
      console.log(`  ID: ${product.productId}`);
      console.log(`  Price: ${product.price}`);
      console.log(`  Description: ${product.description || 'N/A'}`);
      console.log('  Raw data:', JSON.stringify(product));
      console.log('  ----------');
    });
  } else {
    console.log('No products found in this attempt');
  }
};

// Function to test a purchase (sandbox mode)
export const testPurchase = async productId => {
  if (!productId || !TEST_PRODUCT_IDS.includes(productId)) {
    console.error('Invalid product ID for testing');
    return false;
  }

  console.log('====== STOREKIT TEST - PURCHASE ======');
  console.log(`Testing purchase for ${productId}`);

  try {
    const purchase = await RNIap.requestPurchase({
      sku: productId,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });

    console.log('Purchase successful:', purchase);
    return purchase;
  } catch (error) {
    console.error('Purchase error:', error);
    return false;
  }
};

export default {
  isInStoreKitTestEnvironment,
  testFetchProducts,
  testPurchase,
  TEST_PRODUCT_IDS,
};
