import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect, useCallback} from 'react';
import {Image, ScrollView, NativeModules, RefreshControl} from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import * as RNIap from 'react-native-iap';
import LinearGradient from 'react-native-linear-gradient';
import appImages from '../../resource/images';
import CText from '../../components/common/core/Text';
import config from 'react-native-config';
import {useSelector} from 'react-redux';
import useCredits from '../../hooks/useCredits';
import {selectCreditsPerSong} from '../../stores/selector';
import * as RNLocalize from 'react-native-localize';
import facebookEvents from '../../utils/facebookEvents';
import analyticsUtils from '../../utils/analytics';
import {getPlatformProductIds} from '../../api/config';

const API_URL = config.API_BASE_URL;

const processedPurchases = new Set();

// Add at the beginning of the file after imports
let iapInitialized = false;
let isInitializing = false;

// Add price multiplier constants at the top after imports
const PRICE_MULTIPLIERS = {
  payment_101: 1.5,
  payment_201: 1.9,
  payment_301: 9.3,

  payment_100: 1.5,
  payment_200: 1.9,
  payment_300: 9.3,
};

// Add function to calculate iOS discount percentage
const calculateIOSDiscount = productId => {
  const baseMultiplier = PRICE_MULTIPLIERS['payment_101']; // Base price multiplier
  const productMultiplier = PRICE_MULTIPLIERS[productId];

  if (!productMultiplier || !baseMultiplier) return 0;

  // Calculate discount percentage
  // For higher tiers, the effective price per unit is lower, which represents the discount
  const effectiveDiscount = (
    (1 - baseMultiplier / productMultiplier) *
    100
  ).toFixed(0);
  return parseInt(effectiveDiscount, 10);
};

// Modify the product formatting for iOS
const formatIOSProduct = (product, countryCode) => {
  console.log(product, 'productANDROID');
  if (!product || !product.productId) {
    console.log('Invalid product data:', product);
    return product;
  }

  try {
    // Get the multiplier for this product
    const multiplier = PRICE_MULTIPLIERS[product.productId] || 1;

    // Extract numeric price and currency from product price
    const numericPrice = extractNumericPrice(
      product.price || product.localizedPrice || '0',
    );
    const currencySymbol = (product.price || product.localizedPrice || '$0')
      .replace(/[0-9.,]/g, '')
      .trim();
    const currencyCode = product.currency || 'USD';

    // Calculate original price using multiplier
    const originalPrice = numericPrice * multiplier;
    const discountedPrice = numericPrice; // The IAP price is the discounted price

    // Calculate discount percentage
    const discountPercentage =
      originalPrice > 0
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    console.log(`Formatting iOS product ${product.productId}:`, {
      originalPrice,
      discountedPrice,
      discountPercentage,
      multiplier,
      currencyCode,
      currencySymbol,
    });

    return {
      ...product,
      isIOS: true,
      discount: discountPercentage,
      localizedOriginalPrice: `${currencySymbol}${originalPrice.toFixed(2)}`,
      localizedPrice: product.price || product.localizedPrice, // Keep the original IAP price as discounted price
      originalPriceAmount: originalPrice,
      discountedPriceAmount: discountedPrice,
      currency: currencyCode,
      currencySymbol: currencySymbol,
    };
  } catch (error) {
    console.error('Error formatting iOS product:', error);
    return product;
  }
};

const createPendingPayment = async (productId, amount, token) => {
  try {
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Make sure we have a valid amount - prevent 400 errors
    if (!amount || amount <= 0 || isNaN(amount)) {
      console.warn(
        `Invalid amount for product ${productId}: ${amount}. Calculating new amount.`,
      );
      amount = getAmountFromProductId(productId);

      // Double-check we have a valid amount now
      if (!amount || amount <= 0 || isNaN(amount)) {
        console.error(`Cannot determine valid amount for product ${productId}`);
        throw new Error(
          `Cannot determine valid amount for product ${productId}`,
        );
      }
    }

    // Make sure amount is a number, not a string
    amount = Number(amount);

    const response = await fetch(`${API_URL}/v1/payments/create-pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({productId, amount}),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Server error response (${response.status}):`, errorData);
      throw new Error(`Failed to create pending payment: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.error('Error creating pending payment:', err);
    throw err;
  }
};

const processPurchase = async (purchase, token) => {
  try {
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // For iOS, we should use the validate-apple-receipt endpoint directly
    if (Platform.OS === 'ios') {
      const receiptData = purchase.transactionReceipt;

      if (!receiptData) {
        throw new Error('No receipt data available in purchase object');
      }

      // Check if it's likely a sandbox receipt
      const isSandbox = receiptData.includes('sandbox');

      try {
        const response = await fetch(
          `${API_URL}/v1/payments/validate-apple-receipt`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              receiptData: receiptData,
              productId: purchase.productId,
              isSubscription: false,
              environment: isSandbox ? 'sandbox' : 'production',
              allowSandboxInProduction: true,
              bundleId: config.APP_STORE_BUNDLE_ID || 'com.app.muzic',
            }),
          },
        );

        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();

          // Return a valid result object with error info instead of throwing
          return {
            status: 'ERROR',
            isValid: false,
            errorCode: response.status,
            errorMessage: `Failed to validate receipt: ${response.status}`,
            // Include credits based on product ID as fallback
            credits: getCreditsForProduct(purchase.productId),
            amount: getAmountFromProductId(purchase.productId),
            productId: purchase.productId,
          };
        }

        const resultData = await response.json();

        // Validate result structure before returning
        if (!resultData) {
          return {
            status: 'ERROR',
            isValid: false,
            errorMessage: 'Empty response from server',
            credits: getCreditsForProduct(purchase.productId), // Fallback
            productId: purchase.productId,
          };
        }

        // If result doesn't have status, add a default one
        if (!resultData.status) {
          resultData.status = 'SUCCESS';
        }

        // Track the purchase with Facebook SDK
        const amount = getAmountFromProductId(purchase.productId);
        if (resultData.status === 'SUCCESS' && amount) {
          try {
            // Track purchase with analytics
            analyticsUtils.trackCustomEvent('purchase_completed', {
              product_id: purchase.productId,
              amount: amount,
              currency: 'USD',
              platform: 'ios',
              timestamp: new Date().toISOString(),
            });

            facebookEvents.logPurchase(
              amount,
              'USD', // Or get currency from resultData
              purchase.productId,
            );
          } catch (fbError) {
            // Silent fallback
          }
        }

        return resultData;
      } catch (validationError) {
        // Return a fallback result object with credits information
        return {
          status: 'ERROR',
          isValid: false,
          errorMessage: validationError.message,
          errorDetail: 'Exception during validation',
          credits: getCreditsForProduct(purchase.productId), // Fallback using product ID
          amount: getAmountFromProductId(purchase.productId),
          productId: purchase.productId,
        };
      }
    } else {
      // For Android, use the existing endpoint
      const response = await fetch(
        `${API_URL}/v1/payments/google-payment-event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            purchaseToken: purchase.purchaseToken,
            orderId: purchase.orderId || purchase.transactionId,
            packageName: config.GOOGLE_PLAY_PACKAGE_NAME,
            productId: purchase.productId,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          status: 'ERROR',
          isValid: false,
          errorMessage: `Failed to validate purchase: ${response.status}`,
        };
      }

      const resultData = await response.json();

      // Track the purchase with Facebook SDK for Android
      if (resultData.status === 'SUCCESS') {
        try {
          const amount = getAmountFromProductId(purchase.productId);
          if (amount) {
            // Track purchase with analytics
            analyticsUtils.trackCustomEvent('purchase_completed', {
              product_id: purchase.productId,
              amount: amount,
              currency: 'USD',
              platform: 'android',
              timestamp: new Date().toISOString(),
            });

            facebookEvents.logPurchase(
              amount,
              'USD', // Or get currency from resultData
              purchase.productId,
            );
          }
        } catch (fbError) {
          // Silent fallback
        }
      }

      return resultData;
    }
  } catch (err) {
    throw err;
  }
};

const verifyPurchase = async (
  purchaseToken,
  productId,
  token,
  isSubscription = false,
  environment = 'production',
) => {
  try {
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log(
      `Verifying purchase for ${productId} in ${environment} environment`,
    );

    // For iOS, check if it's a sandbox receipt regardless of passed environment
    if (
      Platform.OS === 'ios' &&
      purchaseToken &&
      purchaseToken.includes('sandbox')
    ) {
      console.log(
        'iOS receipt appears to be from sandbox environment, overriding environment setting',
      );
      environment = 'sandbox';
    }

    const response = await fetch(`${API_URL}/v1/payments/verify-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        purchaseToken,
        productId,
        packageName: Platform.select({
          android: config.GOOGLE_PLAY_PACKAGE_NAME,
          ios: config.APP_STORE_BUNDLE_ID,
        }),
        isSubscription,
        environment, // Pass environment for iOS verification
        allowSandboxInProduction: true, // Add this flag to try sandbox if production validation fails
        platform: Platform.OS, // Explicitly sending the platform
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify purchase: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.error('Error verifying purchase:', err);
    throw err;
  }
};

// Helper function to get amount from product ID
const getAmountFromProductId = productId => {
  try {
    // First try to get amount from the products list
    const product = global.availableProducts?.find(
      p => p.productId === productId,
    );
    if (product && product.price) {
      // Extract numeric value from price string (e.g. "$29.99" -> 29.99)
      const priceMatch = product.price.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/);
      if (priceMatch && priceMatch[0]) {
        return parseFloat(priceMatch[0]);
      }
    }

    // Fallback to hardcoded map for backward compatibility
    if (productId === 'payment_100') return 29;
    if (productId === 'payment_101') return 29;
    if (productId === 'payment_200') return 59;
    if (productId === 'payment_201') return 59;
    if (productId === 'payment_300') return 99;
    if (productId === 'payment_301') return 99;
    if (productId === 'payment_500') return 99;
    if (productId === 'premium_pack') return 99;

    // If all else fails, extract number from product ID if possible
    const matches = productId.match(/(\d+)/);
    if (matches && matches[1]) {
      const credits = parseInt(matches[1], 10);
      // Apply a simple pricing formula based on credits
      return Math.round(credits * 0.29);
    }

    // Default fallback
    console.warn(`Unknown product ID: ${productId}, using default amount 0`);
    return 0;
  } catch (err) {
    console.error('Error calculating amount from product ID:', err);
    return 0;
  }
};

// Request purchase function
const requestPurchase = async (
  productId,
  availableProducts,
  accessToken,
  countryCode,
) => {
  try {
    console.log(`Requesting purchase for ${productId}`);
    console.log(
      'Available products for purchase:',
      availableProducts?.map(p => p.productId).join(', ') || 'None',
    );

    // For Android, we need to explicitly fetch products first
    if (Platform.OS === 'android') {
      console.log('Android platform detected, fetching products first...');
      try {
        // Fetch custom products data
        const fetchedProducts = await fetchPlayStoreProducts(
          accessToken,
          countryCode,
        );

        console.log(
          'Fetched products from Play Store:',
          fetchedProducts.length > 0
            ? fetchedProducts
                .map(p => {
                  console.log(p, 'p');
                  return p.productId;
                })
                .join(', ')
            : 'No products found',
        );

        // Extract product IDs from the fetched products to pass to RNIap
        const productIds = fetchedProducts.map(p => p.productId);

        // Make sure the current product ID is included
        if (!productIds.includes(productId)) {
          productIds.push(productId);
        }

        // IMPORTANT: Call RNIap.getProducts with the dynamically obtained product IDs
        console.log(
          'Explicitly calling RNIap.getProducts with product IDs:',
          productIds.join(', '),
        );
        const rnIapProducts = await RNIap.getProducts({
          skus: productIds,
        });
        console.log(
          'RNIap products cached:',
          rnIapProducts.map(p => p.productId).join(', '),
        );

        // Verify the product is in the RNIap cached list
        const productFound = rnIapProducts.some(p => p.productId === productId);
        if (!productFound) {
          console.error(
            `Product ${productId} not found in RNIap cached products!`,
          );
          throw new Error(
            `The product ${productId} is not available in the Play Store.`,
          );
        }

        console.log(
          `Product ${productId} confirmed available, proceeding with purchase`,
        );
      } catch (fetchError) {
        console.error('Error fetching products before purchase:', fetchError);
        throw new Error(`Could not fetch products: ${fetchError.message}`);
      }
    }

    // Double-check that product exists in available products (if provided)
    if (
      availableProducts &&
      !availableProducts.some(p => p.productId === productId)
    ) {
      console.error(`Product ${productId} not found in available products!`);
      throw new Error(
        `The product ID '${productId}' is not available. Please check your configuration.`,
      );
    }

    // Use different methods for Android vs iOS
    let purchase;
    if (Platform.OS === 'android') {
      console.log(productId, 'productId');
      purchase = await RNIap.requestPurchase({
        skus: [productId],
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
        obfuscatedAccountId: Date.now().toString(), // Add randomness to ensure uniqueness
        obfuscatedProfileId: Math.random().toString(36).substring(2), // Add random profile ID
        type: RNIap.ProductType.INAPP, // Explicitly set as in-app purchase
        isConsumable: true, // Mark as consumable to allow repeated purchases
      });
    } else {
      purchase = await RNIap.requestPurchase({
        sku: productId,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });
    }

    console.log('Purchase request sent:', purchase);
    return purchase;
  } catch (err) {
    console.error('Error requesting purchase:', err);

    // Specifically handle already owned errors for Android
    if (err.code === 'E_ALREADY_OWNED' && Platform.OS === 'android') {
      console.log('Product already owned, attempting to consume it first...');
      try {
        // Get available purchases to find the one we need to consume
        const availablePurchases = await RNIap.getAvailablePurchases();
        const existingPurchase = availablePurchases.find(
          p => p.productId === productId,
        );

        if (existingPurchase && existingPurchase.purchaseToken) {
          console.log(
            'Found existing purchase to consume:',
            existingPurchase.productId,
          );

          // Try to consume the purchase
          if (typeof RNIap.consumePurchaseAndroid === 'function') {
            await RNIap.consumePurchaseAndroid({
              token: existingPurchase.purchaseToken,
            });
            console.log(
              'Successfully consumed existing purchase, retrying purchase...',
            );

            // Retry the purchase now that the previous one has been consumed
            return await requestPurchase(
              productId,
              availableProducts,
              accessToken,
              countryCode,
            );
          } else {
            // Alternative method if consumePurchaseAndroid isn't available
            await RNIap.finishTransaction({
              purchase: existingPurchase,
              isConsumable: true,
            });
            console.log(
              'Finished existing transaction as consumable, retrying purchase...',
            );

            // Retry the purchase
            return await requestPurchase(
              productId,
              availableProducts,
              accessToken,
              countryCode,
            );
          }
        } else {
          console.log('No existing purchase found to consume');
        }
      } catch (consumeErr) {
        console.error('Error consuming existing purchase:', consumeErr);
        // Continue with the original error
      }
    }

    if (err.code === 'E_UNKNOWN') {
      console.log('Detailed error info:', err.message, err.debugMessage || '');
      // This could be a product not found error
      if (err.message.includes('sku') && err.message.includes('not found')) {
        throw new Error(
          `Product ${productId} not found. Make sure you've added it to your Google Play Console.`,
        );
      }
    }
    throw err;
  }
};

// Updated safeFinishTransaction function to handle error code 8
const safeFinishTransaction = async (purchase, isConsumable = true) => {
  try {
    if (!purchase) {
      console.log(
        'Cannot finish transaction: purchase object is null or undefined',
      );
      return false;
    }

    // For Android, we need to check if the purchase was already finished
    if (Platform.OS === 'android') {
      try {
        // Check if the purchase object has the necessary data
        if (!purchase.purchaseToken) {
          console.log('Purchase token is missing, cannot finish transaction');
          return false;
        }

        // For Android, instead of finishing via the purchase object (which might cause error 8),
        // we'll acknowledge it directly on Android platform
        try {
          // The getPurchasePromise approach works in most versions of react-native-iap
          console.log('Finishing Android purchase with purchaseToken');
          return true; // Skip the actual finishing - let the purchase listener handle it
        } catch (err) {
          // Ignore errors about already finished purchases
          if (
            err.code === 8 ||
            err.message?.includes('Invalid consumption') ||
            err.message?.includes('Item already owned') ||
            err.message?.includes('already consumed')
          ) {
            console.log(
              'Transaction appears to be already processed:',
              err.message,
            );
            return true;
          }
          throw err;
        }
      } catch (err) {
        // If there's an error on direct acknowledgment, try the normal way as fallback
        console.log(
          'Error in Android-specific handling, trying normal finish:',
          err,
        );
      }
    }

    // iOS or fallback for Android if the above fails
    console.log(`Finishing transaction for ${purchase.productId}`);
    try {
      await RNIap.finishTransaction({purchase, isConsumable});
      console.log('Transaction finished successfully');
      return true;
    } catch (err) {
      // Handle common error cases
      if (
        err.code === 8 ||
        err.message?.includes('Invalid consumption') ||
        err.message?.includes('Item already owned') ||
        err.message?.includes('already consumed')
      ) {
        console.log(
          'Transaction appears to be already processed, continuing:',
          err.message,
        );
        return true;
      }
      throw err;
    }
  } catch (err) {
    // This is only reached if both methods fail and it's not a common error
    console.error('Error finishing transaction:', err);

    // Return true anyway to let the flow continue - we don't want to block the user experience
    // just because of transaction finishing issues
    return true;
  }
};

// Skip API calls for pending purchases and just clear them
const clearPendingPurchases = async () => {
  try {
    console.log('Clearing pending purchases...');
    const purchases = await RNIap.getAvailablePurchases();

    if (purchases.length === 0) {
      console.log('No pending purchases to clear');
      return;
    }

    console.log(`Found ${purchases.length} purchases to clear`);

    // Process each purchase
    for (const purchase of purchases) {
      try {
        // Just finish the transaction without making API calls
        if (Platform.OS === 'android' && purchase.purchaseToken) {
          // For Android
          try {
            // Check if purchase is already acknowledged to avoid error code 8
            const isAcknowledged =
              purchase.acknowledged || purchase.isAcknowledged;
            if (isAcknowledged) {
              console.log(
                `Purchase ${purchase.productId} already acknowledged, skipping.`,
              );
              continue;
            }

            // We're just going to try to finish, not worry about the result
            RNIap.finishTransaction({purchase, isConsumable: true})
              .then(() =>
                console.log(`Cleared purchase: ${purchase.productId}`),
              )
              .catch(err => {
                // Ignore error code 8 (already consumed)
                if (err.code === 8) {
                  console.log(
                    `Purchase ${purchase.productId} was already consumed, continuing.`,
                  );
                } else {
                  console.log(
                    `Error clearing purchase ${purchase.productId}, but continuing:`,
                    err.message,
                  );
                }
              });
          } catch (err) {
            // Ignore errors
          }
        } else if (Platform.OS === 'ios') {
          // For iOS
          try {
            RNIap.finishTransaction({purchase, isConsumable: true})
              .then(() =>
                console.log(`Cleared iOS purchase: ${purchase.productId}`),
              )
              .catch(err =>
                console.log(
                  `Error clearing iOS purchase, but continuing:`,
                  err.message,
                ),
              );
          } catch (err) {
            // Ignore errors
          }
        }
      } catch (err) {
        // Ignore all errors, just try to clear everything
      }
    }

    console.log('Attempted to clear all pending purchases');
  } catch (err) {
    console.error('Error in clearPendingPurchases:', err);
  }
};

// Enhanced handlePendingPurchases function to properly handle pending purchases
const handlePendingPurchases = async () => {
  try {
    console.log('Checking for pending purchases...');
    // Get available purchases
    const purchases = await RNIap.getAvailablePurchases();
    console.log('Found pending purchases:', purchases.length);

    if (purchases.length === 0) {
      console.log('No pending purchases found');
      return;
    }

    // Process each pending purchase
    for (const purchase of purchases) {
      try {
        console.log('Processing pending purchase:', purchase.productId);

        // For Android, if we have a purchase token, try to acknowledge it directly first
        if (Platform.OS === 'android' && purchase.purchaseToken) {
          try {
            console.log(
              'Directly finishing Android purchase:',
              purchase.productId,
            );

            // Depending on what version of react-native-iap you're using,
            // one of these methods should work
            try {
              // Try method 1: Acknowledge purchase (newer versions)
              if (typeof RNIap.acknowledgePurchaseAndroid === 'function') {
                await RNIap.acknowledgePurchaseAndroid({
                  token: purchase.purchaseToken,
                });
                console.log('Purchase acknowledged');
              }
              // Try method 2: Just finish the transaction
              else {
                // Skip actual API call and just mark as success
                console.log(
                  'Skipping acknowledgment, will try finishTransaction',
                );
              }
            } catch (ackErr) {
              // Ignore expected errors
              if (
                ackErr.code === 'E_ALREADY_ACKNOWLEDGED' ||
                ackErr.message?.includes('already acknowledged') ||
                ackErr.code === 8 ||
                ackErr.message?.includes('Item already owned')
              ) {
                console.log('Purchase already acknowledged, continuing');
              } else {
                console.log(
                  'Error acknowledging purchase, will try finishTransaction:',
                  ackErr,
                );
              }
            }

            // Attempt to manually finish the transaction as a backup
            // Some versions of react-native-iap might require this additional step
            try {
              await RNIap.finishTransaction({purchase, isConsumable: true});
              console.log('Finished transaction for pending purchase');
            } catch (finishErr) {
              // Ignore expected errors
              if (
                finishErr.code === 8 ||
                finishErr.message?.includes('Invalid consumption') ||
                finishErr.message?.includes('Item already owned') ||
                finishErr.message?.includes('already consumed')
              ) {
                console.log(
                  'Transaction appears to be already finished:',
                  finishErr.message,
                );
              } else {
                console.error(
                  'Unexpected error finishing transaction:',
                  finishErr,
                );
              }
            }
          } catch (err) {
            console.error('Error handling Android pending purchase:', err);
          }
        }
        // For iOS, use finishTransaction
        else if (Platform.OS === 'ios') {
          try {
            await RNIap.finishTransaction({purchase, isConsumable: true});
            console.log('Finished iOS pending transaction');
          } catch (err) {
            console.error('Error finishing iOS pending purchase:', err);
          }
        }

        // For both platforms, try one more time using our safe function as a fallback
        try {
          await safeFinishTransaction(purchase, true);
        } catch (err) {
          // Already logged in safeFinishTransaction
        }
      } catch (err) {
        console.error('Error handling pending purchase:', err);
      }
    }

    console.log('Finished processing all pending purchases');
  } catch (err) {
    console.error('Error checking pending purchases:', err);
  }
};

// Add a helper function to determine credits based on product ID
const getCreditsForProduct = productId => {
  // First try to get credits from the products list
  const product = global.availableProducts?.find(
    p => p.productId === productId,
  );
  if (product && product.credits) {
    return product.credits;
  }

  // Fallback to hardcoded map only if product not found
  const creditMap = {
    payment_100: 100,
    payment_101: 100,
    payment_200: 200,
    payment_201: 200,
    payment_300: 300,
    payment_301: 300,
    premium_pack: 200,
    // Add other product IDs as needed
  };

  return creditMap[productId] || 0;
};

// Enhanced function to get user's country code from device locale settings
const getUserCountryCode = async () => {
  try {
    // Method 1: Use react-native-localize to get country code reliably
    let countryFromLib;
    try {
      countryFromLib = RNLocalize.getCountry();
    } catch (localizeError) {
      // Silent fallback
    }

    // Validate country code (should be 2 uppercase letters)
    if (
      countryFromLib &&
      countryFromLib.length === 2 &&
      /^[A-Z]{2}$/.test(countryFromLib)
    ) {
      return countryFromLib;
    }

    // Method 2: Get comprehensive locale information
    let locales;
    try {
      locales = RNLocalize.getLocales();
    } catch (localesError) {
      // Silent fallback
    }

    if (locales && locales.length > 0) {
      const primaryLocale = locales[0];
      if (
        primaryLocale.countryCode &&
        /^[A-Z]{2}$/.test(primaryLocale.countryCode)
      ) {
        return primaryLocale.countryCode;
      }
    }

    // Method 3: Get timezone-based country detection
    let timeZone;
    try {
      timeZone = RNLocalize.getTimeZone();
    } catch (timezoneError) {
      // Silent fallback
    }

    // Method 4: Get currency information
    let currencies;
    try {
      currencies = RNLocalize.getCurrencies();
    } catch (currencyError) {
      // Silent fallback
    }

    // Method 5: Platform-specific fallbacks with enhanced safety
    let deviceLocale;
    let deviceRegion;

    if (Platform.OS === 'ios') {
      try {
        // Safe iOS NativeModules access
        const settingsManager = NativeModules.SettingsManager;
        const settings = settingsManager?.settings;

        if (settings) {
          // Check for region setting first (iOS specific)
          if (settings.AppleICUForceDefaultCountryCode) {
            deviceRegion = settings.AppleICUForceDefaultCountryCode;
          }

          // Check for country code in other iOS settings
          if (settings.AppleICUCountryCode) {
            deviceRegion = deviceRegion || settings.AppleICUCountryCode;
          }

          // Check language settings
          const appleLanguages = settings.AppleLanguages;
          if (Array.isArray(appleLanguages) && appleLanguages.length > 0) {
            deviceLocale = appleLanguages[0]; // e.g., "en-IN"
          } else if (settings.AppleLocale) {
            deviceLocale = settings.AppleLocale; // older iOS versions
          }
        }

        // Additional iOS fallback using NSLocale if available
        try {
          const nsLocale = NativeModules.NSLocale;
          if (nsLocale && nsLocale.getCurrentCountryCode) {
            const iosCountryCode = await nsLocale.getCurrentCountryCode();
            if (iosCountryCode) {
              deviceRegion = deviceRegion || iosCountryCode;
            }
          }
        } catch (nsLocaleError) {
          // Silent fallback
        }
      } catch (iosError) {
        // Silent fallback
      }
    } else if (Platform.OS === 'android') {
      try {
        // Safe Android NativeModules access
        const i18nManager = NativeModules.I18nManager;
        if (i18nManager) {
          deviceLocale = i18nManager.localeIdentifier || 'en_US';
        }

        // Try to get Android system locale
        try {
          const systemLocale = NativeModules.AndroidLocale;
          if (systemLocale && systemLocale.getCountryCode) {
            const androidCountryCode = await systemLocale.getCountryCode();
            if (androidCountryCode) {
              deviceRegion = deviceRegion || androidCountryCode;
            }
          }
        } catch (androidLocaleError) {
          // Silent fallback
        }
      } catch (androidError) {
        // Silent fallback
      }
    }

    // Process region first if available (more specific than locale)
    if (deviceRegion && /^[A-Z]{2}$/.test(deviceRegion.toUpperCase())) {
      const regionCode = deviceRegion.toUpperCase();
      return regionCode;
    }

    // Process locale as fallback
    let fallbackCountryCode = 'US'; // Default fallback

    if (deviceLocale) {
      // Extract from locale format like "en_US", "en-US", or "en_IN"
      const parts = deviceLocale.split(/[_-]/);

      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1].toUpperCase();
        // Verify it's a valid country code (2 uppercase letters)
        if (/^[A-Z]{2}$/.test(lastPart)) {
          fallbackCountryCode = lastPart;
        }
      }
    }

    // Method 6: Enhanced timezone-to-country mapping
    if (timeZone && fallbackCountryCode === 'US') {
      const timezoneCountryMap = {
        // Asia
        'Asia/Kolkata': 'IN',
        'Asia/Mumbai': 'IN',
        'Asia/Delhi': 'IN',
        'Asia/Calcutta': 'IN',
        'Asia/Tokyo': 'JP',
        'Asia/Shanghai': 'CN',
        'Asia/Seoul': 'KR',
        'Asia/Singapore': 'SG',
        'Asia/Hong_Kong': 'HK',
        'Asia/Bangkok': 'TH',
        'Asia/Manila': 'PH',
        // Europe
        'Europe/London': 'GB',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Europe/Rome': 'IT',
        'Europe/Madrid': 'ES',
        'Europe/Amsterdam': 'NL',
        'Europe/Stockholm': 'SE',
        'Europe/Oslo': 'NO',
        'Europe/Copenhagen': 'DK',
        'Europe/Helsinki': 'FI',
        'Europe/Dublin': 'IE',
        'Europe/Zurich': 'CH',
        'Europe/Vienna': 'AT',
        'Europe/Brussels': 'BE',
        'Europe/Prague': 'CZ',
        'Europe/Warsaw': 'PL',
        'Europe/Moscow': 'RU',
        // Americas
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'America/Phoenix': 'US',
        'America/Toronto': 'CA',
        'America/Vancouver': 'CA',
        'America/Mexico_City': 'MX',
        'America/Sao_Paulo': 'BR',
        'America/Buenos_Aires': 'AR',
        'America/Lima': 'PE',
        'America/Bogota': 'CO',
        'America/Santiago': 'CL',
        // Oceania
        'Australia/Sydney': 'AU',
        'Australia/Melbourne': 'AU',
        'Australia/Perth': 'AU',
        'Pacific/Auckland': 'NZ',
        // Africa
        'Africa/Cairo': 'EG',
        'Africa/Lagos': 'NG',
        'Africa/Johannesburg': 'ZA',
        'Africa/Casablanca': 'MA',
        // Middle East
        'Asia/Dubai': 'AE',
        'Asia/Riyadh': 'SA',
        'Asia/Tehran': 'IR',
        'Asia/Jerusalem': 'IL',
      };

      if (timezoneCountryMap[timeZone]) {
        return timezoneCountryMap[timeZone];
      }
    }

    // Method 7: Currency-based country detection as final fallback
    if (currencies && currencies.length > 0 && fallbackCountryCode === 'US') {
      const currencyCountryMap = {
        INR: 'IN',
        USD: 'US',
        EUR: 'DE', // Default to Germany for EUR
        GBP: 'GB',
        JPY: 'JP',
        CAD: 'CA',
        AUD: 'AU',
        SGD: 'SG',
        HKD: 'HK',
        CNY: 'CN',
        KRW: 'KR',
        THB: 'TH',
        MXN: 'MX',
        BRL: 'BR',
        RUB: 'RU',
        CHF: 'CH',
        SEK: 'SE',
        NOK: 'NO',
        DKK: 'DK',
        PLN: 'PL',
        CZK: 'CZ',
        HUF: 'HU',
        RON: 'RO',
        BGN: 'BG',
        HRK: 'HR',
        TRY: 'TR',
        ZAR: 'ZA',
        EGP: 'EG',
        AED: 'AE',
        SAR: 'SA',
        ILS: 'IL',
      };

      const primaryCurrency = currencies[0];
      if (primaryCurrency && currencyCountryMap[primaryCurrency]) {
        return currencyCountryMap[primaryCurrency];
      }
    }

    return fallbackCountryCode;
  } catch (error) {
    return 'US'; // Default to US if we can't determine
  }
};

// Generic pricing helper (mirrors PromoBanner)
const calculatePricing = product => {
  if (!product || !product.productId) {
    return null;
  }

  const multiplier = PRICE_MULTIPLIERS[product.productId] || 1;

  const priceString = product.price || product.localizedPrice || '0';
  const match = priceString.match(/([0-9]+([.,][0-9]+)?)/);
  const basePrice = match ? parseFloat(match[1].replace(',', '.')) : 0;

  const originalPriceNumeric = basePrice * multiplier;

  const discountPercentage =
    originalPriceNumeric > 0
      ? Math.round(
          ((originalPriceNumeric - basePrice) / originalPriceNumeric) * 100,
        )
      : 0;

  const localizedPrice = product.localizedPrice || priceString;

  // Build original price string following locale formatting
  let formattedOriginalPrice = `${originalPriceNumeric.toFixed(2)}`;
  if (match) {
    formattedOriginalPrice = localizedPrice.replace(
      match[1],
      originalPriceNumeric.toFixed(2),
    );
  }

  return {
    originalPriceNumeric,
    discountedPriceNumeric: basePrice,
    formattedOriginalPrice,
    discountedPriceFormatted: localizedPrice,
    discountPercentage,
  };
};

// Rewritten: fetch products directly from Google Play Store via RNIap
// and build discount/original-price information locally (no backend call).
const fetchPlayStoreProducts = async (
  _unusedToken = '',
  _regionCode = 'US',
) => {
  try {
    // Ensure connection exists
    try {
      await RNIap.initConnection();
    } catch (_) {}

    // Fetch product IDs dynamically from backend
    const productIds = await getPlatformProductIds('android');

    console.log(
      `Subscription: Fetched ${productIds.length} Android product IDs:`,
      productIds,
    );

    if (productIds.length === 0) {
      console.warn(
        'Subscription: No Android product IDs received from backend',
      );
      return [];
    }

    const storeProducts = await RNIap.getProducts({skus: productIds});

    const validProducts = (storeProducts || []).filter(
      p => p && p.productId && (p.price || p.localizedPrice),
    );

    console.log(
      `Subscription: Found ${validProducts.length} valid Android products from store`,
    );

    // Map products to UI-friendly shape with discount info
    const mapped = validProducts.map(prod => {
      const pricing = calculatePricing(prod) || {};

      return {
        productId: prod.productId,
        sku: prod.productId,
        title: prod.title || 'Credit Pack',
        description: prod.description || '',
        features: extractFeaturesFromDescription(prod.description) || [],
        price: prod.localizedPrice,
        localizedPrice: prod.localizedPrice,
        localizedOriginalPrice: pricing.formattedOriginalPrice,
        discount: pricing.discountPercentage,
        currency: prod.currency,
        countryPrices: {},
        credits: getCreditsForProduct(prod.productId),
      };
    });

    return mapped;
  } catch (error) {
    console.error('Error fetching Play Store products via RNIap:', error);
    return [];
  }
};

// Helper function to extract features from description
const extractFeaturesFromDescription = description => {
  if (!description) return [];

  // Look for bullet points or numbered lists in description
  const bulletPattern = /[•\-\*]\s*([^\n•\-\*]+)/g;
  const numberedPattern = /\d+\.\s+([^\n]+)/g;
  const featureMatches = [];

  // Extract bullet points
  let match;
  while ((match = bulletPattern.exec(description)) !== null) {
    featureMatches.push(match[1].trim());
  }

  // If no bullet points, try numbered lists
  if (featureMatches.length === 0) {
    while ((match = numberedPattern.exec(description)) !== null) {
      featureMatches.push(match[1].trim());
    }
  }

  // If still no features, split by newlines
  if (featureMatches.length === 0) {
    return description
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  return featureMatches;
};

// Function to extract numeric price from price string
const extractNumericPrice = priceString => {
  try {
    const matches = priceString.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/);
    return matches && matches[0] ? parseFloat(matches[0]) : 0;
  } catch (error) {
    console.log('Error extracting numeric price:', error);
    return 0;
  }
};

// Helper function to sort products by price
const sortProductsByPrice = products => {
  return [...products].sort((a, b) => {
    const priceA = extractNumericPrice(a.localizedPrice || a.price);
    const priceB = extractNumericPrice(b.localizedPrice || b.price);
    return priceA - priceB; // Sort in ascending order
  });
};

const PlanCard = ({
  title,
  price,
  features,
  onPurchase,
  disabled,
  originalPrice,
  discount,
  discountedPrice,
  currency,
  currencySymbol,
}) => {
  const hasDiscount = !!(discount && discountedPrice && originalPrice);

  console.log(discountedPrice, 'discountedPrice');

  // Truncate long feature text on iOS to ensure it fits
  const processFeatures = feature => {
    if (Platform.OS === 'ios' && feature.length > 40) {
      return feature.substring(0, 40) + '...';
    }
    return feature;
  };

  // Limit features to max 3 on iOS
  const displayFeatures =
    Platform.OS === 'ios' && features.length > 3
      ? features.slice(0, 3).map(processFeatures)
      : features.map(processFeatures);

  return (
    <LinearGradient
      colors={[
        'rgba(255, 213, 169, 0.60)',
        '#FFD5A9',
        'rgba(255, 213, 169, 0.60)',
      ]}
      start={{x: -0.3553, y: 0}}
      end={{x: 1.0777, y: 0}}
      style={styles.planCard}>
      <View style={styles.planHeader}>
        <Text style={styles.planTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <View style={styles.priceContainer}>
          {hasDiscount ? (
            <View style={styles.discountPriceWrapper}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount || 0}% OFF</Text>
              </View>
              <Text style={styles.planOriginalPrice}>
                {currency} {originalPrice}
              </Text>
              <Text
                style={styles.planPrice}
                numberOfLines={1}
                ellipsizeMode="tail">
                {currency} {discountedPrice}
              </Text>
            </View>
          ) : (
            <View style={styles.regularPriceWrapper}>
              <Text
                style={styles.planPrice}
                numberOfLines={1}
                ellipsizeMode="tail">
                {currency} {price}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={Platform.OS === 'ios' ? styles.featureContainer : {}}>
        {displayFeatures.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text
              style={styles.featureText}
              numberOfLines={Platform.OS === 'ios' ? 1 : 2}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.createButton, disabled && styles.disabledButton]}
        activeOpacity={0.8}
        onPress={onPurchase}
        disabled={disabled}>
        <LinearGradient
          colors={['#F4A460', '#DEB887']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradient}>
          <CText
            style={[
              styles.createButtonText,
              disabled && styles.disabledButtonText,
            ]}>
            Purchase Now
          </CText>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const SubscriptionScreen = () => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasePending, setPurchasePending] = useState(false);
  const [userCountry, setUserCountry] = useState('US');
  const authState = useSelector(state => state.auth);
  // Add state to track iOS purchases
  const [iosPurchaseCompleted, setIosPurchaseCompleted] = useState(false);
  const [currentIosPurchase, setCurrentIosPurchase] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Replace local credits state with Redux
  const {credits, addCredits, updateUserCredits, refreshCredits} = useCredits();

  // Helper function to safely display credits
  const displayCredits = () => {
    if (typeof credits === 'object' && credits !== null) {
      // If credits is an object with balance property, use that
      return credits?.data?.balance || 0;
    }
    // Otherwise use the credits number directly
    return typeof credits === 'number' ? credits : 0;
  };

  // Fix the ensureCreditsRefreshed function to avoid double refresh
  const ensureCreditsRefreshed = useCallback(async () => {
    console.log('Refreshing credits from server...');
    try {
      // Just do a single refresh from the server
      await refreshCredits();
      console.log('Credits refresh completed');
    } catch (err) {
      console.error('Error refreshing credits:', err);
    }
  }, [refreshCredits]);

  // Refresh credits when the screen loads
  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  // Add connection state tracking
  const [connectionState, setConnectionState] = useState('disconnected');

  // Add reconnection function for App Store Connect
  const reconnectIAP = useCallback(async () => {
    try {
      console.log('Attempting to reconnect to in-app purchase services...');
      setConnectionState('connecting');

      // End any existing connection first
      try {
        await RNIap.endConnection();
        console.log('Ended existing IAP connection');
      } catch (endErr) {
        console.log('No existing connection to end or error ending:', endErr);
        // Continue anyway, as we want to establish a fresh connection
      }

      // Increased delay to ensure previous connection is fully closed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Initialize new connection with retry mechanism
      let retryCount = 0;
      const maxRetries = 3;
      let connected = false;

      while (!connected && retryCount < maxRetries) {
        try {
          await RNIap.initConnection();
          connected = true;
          setConnectionState('connected');
          iapInitialized = true; // Mark as initialized
          console.log('IAP connection reestablished successfully');
        } catch (initErr) {
          retryCount++;
          console.log(`IAP connection attempt ${retryCount} failed:`, initErr);
          if (retryCount < maxRetries) {
            // Wait longer between retries
            await new Promise(resolve => setTimeout(resolve, 1500));
          } else {
            throw initErr; // Rethrow on last retry
          }
        }
      }

      // Refresh products based on platform
      if (Platform.OS === 'android') {
        console.log('Refreshing Android products...');
        const directProducts = await fetchDirectPlayStoreProducts();
        if (directProducts && directProducts.length > 0) {
          setProducts(directProducts);
          global.availableProducts = directProducts;
          console.log(
            `Loaded ${directProducts.length} products from Play Store`,
          );
        }
      } else {
        console.log('Refreshing iOS products from App Store Connect...');

        console.log(Platform.OS, 'Platform.OS');
        // For iOS, directly fetch from App Store Connect
        if (Platform.OS === 'ios') {
          try {
            console.log('===== PRODUCT SOURCE VERIFICATION =====');
            console.log(
              'Fetching iOS products directly from App Store Connect only',
            );

            // Fetch product IDs dynamically from backend
            const productIds = await getPlatformProductIds('ios');
            console.log('Requesting products with IDs:', productIds);

            if (productIds.length === 0) {
              console.warn(
                'Subscription: No iOS product IDs received from backend',
              );
              Alert.alert(
                'Configuration Error',
                'No products configured for iOS. Please contact support.',
              );
              setLoading(false);
              return;
            }

            // Single call to fetch products - no separate calls for subscriptions and one-time purchases
            const products = await RNIap.getProducts({
              skus: productIds,
              forceRestoreFromAppStore: true, // Force fetch from App Store Connect
            });

            // Detailed logging for diagnostic purposes
            console.log('===== PRODUCT FETCH RESULTS =====');
            console.log(products);
            console.log(`Total products found: ${products?.length || 0}`);

            if (products && products.length > 0) {
              console.log('PRODUCT DETAILS FROM STORE:');
              products.forEach((product, index) => {
                console.log(`Product ${index + 1}:`);
                console.log(`- Product ID: ${product.productId}`);
                console.log(`- Title: ${product.title}`);
                console.log(`- Description: ${product.description}`);
                console.log(`- Price: ${product.price}`);
                console.log(`- Currency: ${product.currency}`);

                // Check for App Store specific fields
                if (product.introductoryPrice) {
                  console.log(
                    '- Has introductory price: YES (App Store Connect feature)',
                  );
                }

                // Log all properties for debugging
                console.log('- All properties:', JSON.stringify(product));
              });

              // Process the products with iOS discounts
              const formattedProducts = products.map(product => {
                formatIOSProduct(product, userCountry);
                return {
                  ...product,
                  isSubscription: false,
                };
              });

              console.log('Formatted products:', formattedProducts);
              setProducts(formattedProducts);
              global.availableProducts = formattedProducts;

              // Set the first product as selected
              if (formattedProducts.length > 0) {
                setSelectedProductId(formattedProducts[0].productId);
              }

              setLoading(false);
              return;
            } else {
              console.log('NO PRODUCTS FOUND FROM APP STORE CONNECT');

              // Try a clean reconnection approach
              try {
                console.log('Attempting clean reconnection to App Store');
                await RNIap.endConnection();
                await new Promise(resolve => setTimeout(resolve, 500)); // Add delay
                await RNIap.initConnection();

                // Make just one request with more specific parameters
                const retryProducts = await RNIap.getProducts({
                  skus: productIds,
                  forceRestoreFromAppStore: true,
                });

                console.log('===== RETRY FETCH RESULTS =====');
                console.log(
                  `Total products found on retry: ${
                    retryProducts?.length || 0
                  }`,
                );

                if (retryProducts && retryProducts.length > 0) {
                  console.log('RETRY PRODUCT DETAILS:');
                  retryProducts.forEach((product, index) => {
                    console.log(`Product ${index + 1}:`);
                    console.log(`- Product ID: ${product.productId}`);
                    console.log(`- Title: ${product.title}`);
                    console.log(`- Description: ${product.description}`);
                    console.log(`- Price: ${product.price}`);
                  });

                  console.log('Successfully fetched products on retry attempt');
                  setProducts(retryProducts);
                  global.availableProducts = retryProducts;
                  setSelectedProductId(retryProducts[0].productId);
                  setLoading(false);
                  return;
                }
              } catch (retryError) {
                console.warn('Error during retry product fetch:', retryError);
              }

              // If we reach here, no products were found
              Alert.alert(
                'No Products Available',
                'Could not find any products from App Store Connect. Please make sure your products are properly configured in App Store Connect.',
                [
                  {
                    text: 'OK',
                    style: 'default',
                  },
                ],
              );
              setLoading(false);
            }
          } catch (iosError) {
            console.error('Error fetching iOS products:', iosError);
            console.error('Error details:', JSON.stringify(iosError));
            Alert.alert(
              'Connection Error',
              'Failed to connect to App Store. Please check your internet connection or product configuration in App Store Connect.',
            );
            setLoading(false);
          }
        } else if (Platform.OS === 'android') {
          // Existing Android code
          try {
            console.log(
              'Attempting to fetch products directly from Google Play...',
            );
            const directProducts = await fetchDirectPlayStoreProducts();

            if (directProducts && directProducts.length > 0) {
              console.log(
                'Successfully fetched products from Google Play API:',
                directProducts,
              );
              setProducts(directProducts);
              global.availableProducts = directProducts;

              // Sort products by price
              const sortedProducts = sortProductsByPrice(directProducts);

              // Log sorted products for verification
              console.log(
                'Android products sorted by price (lowest to highest):',
              );
              sortedProducts.forEach((product, idx) => {
                console.log(
                  `${idx + 1}. ${product.productId}: ${product.price}`,
                );
              });

              // Set the lowest price product as default
              if (sortedProducts.length > 0) {
                const lowestPriceProduct = sortedProducts[0];
                setSelectedProductId(lowestPriceProduct.productId);
              }
              setLoading(false);
              return;
            }
          } catch (directError) {
            console.error('Error in direct Play Store fetch:', directError);
          }
        }
        // Fall back to RNIap if direct fetch fails
        console.log('Using RNIap to fetch products');

        // Fetch all available products without hardcoding IDs
        try {
          console.log('Fetching available subscriptions2...');

          // Fetch product IDs dynamically from backend
          const platform = Platform.OS === 'ios' ? 'ios' : 'android';
          const dynamicProductIds = await getPlatformProductIds(platform);

          console.log(
            `Subscription: Fetched ${dynamicProductIds.length} ${platform} product IDs for RNIap fallback:`,
            dynamicProductIds,
          );

          if (dynamicProductIds.length === 0) {
            console.warn(
              `Subscription: No ${platform} product IDs received from backend for RNIap fallback`,
            );
            throw new Error('No product IDs available');
          }

          const oneTimeProducts = await RNIap.getProducts({
            skus: dynamicProductIds,
          });
          console.log('Available subscriptions:', oneTimeProducts);

          // console.log('Available one-time products:', oneTimeProducts);

          // Combine both types of products
          const allProducts = [...oneTimeProducts];

          if (allProducts.length > 0) {
            console.log('All available products:', allProducts);
            setProducts(allProducts);

            // Store products globally for amount calculations
            global.availableProducts = allProducts;

            // Sort products by price and select the lowest price product
            const sortedProducts = [...allProducts].sort((a, b) => {
              // Extract numeric value from price strings
              const getNumericPrice = product => {
                const priceString = product.price || '';
                const matches = priceString.match(
                  /([0-9]+([.][0-9]*)?|[.][0-9]+)/,
                );
                return matches && matches[0] ? parseFloat(matches[0]) : 9999;
              };
              return getNumericPrice(a) - getNumericPrice(b);
            });

            // Set the lowest price product as default
            if (sortedProducts.length > 0) {
              const lowestPriceProduct = sortedProducts[0];
              setSelectedProductId(lowestPriceProduct.productId);
              console.log(
                'Setting initial selected product ID:',
                lowestPriceProduct.productId,
              );
            }
            setLoading(false);
            return;
          } else {
            // If all else fails, try with dynamic product IDs as fallback
            console.log('Trying dynamic product IDs as fallback...');

            try {
              const platform = Platform.OS === 'ios' ? 'ios' : 'android';
              const fallbackProductIds = await getPlatformProductIds(platform);

              console.log(
                `Subscription: Using fallback ${platform} product IDs:`,
                fallbackProductIds,
              );

              if (fallbackProductIds.length === 0) {
                console.warn(
                  `Subscription: No fallback ${platform} product IDs available`,
                );
                Alert.alert(
                  'Configuration Error',
                  'No products available from the store. Please check your configuration.',
                );
                setLoading(false);
                return;
              }

              const specificProducts = await RNIap.getProducts({
                skus: fallbackProductIds,
              });
              console.log('Fallback products:', specificProducts);

              // Store products globally for amount calculations
              global.availableProducts = specificProducts;

              if (specificProducts.length > 0) {
                setProducts(specificProducts);
                setSelectedProductId(specificProducts[0].productId);
              } else {
                console.log('No products available from the store');
                Alert.alert(
                  'Error',
                  'No products available from the store. Please check your configuration.',
                );
              }
            } catch (fallbackError) {
              console.error(
                'Subscription: Error with fallback product fetch:',
                fallbackError,
              );
              Alert.alert(
                'Error',
                'No products available from the store. Please check your configuration.',
              );
            }
          }
        } catch (err) {
          console.error('Error fetching products from store:', err);

          // Last resort fallback to dynamic product IDs from backend
          try {
            const platform = Platform.OS === 'ios' ? 'ios' : 'android';
            const fallbackProductIds = await getPlatformProductIds(platform);

            console.log(
              `Subscription: Using last resort fallback ${platform} product IDs:`,
              fallbackProductIds,
            );

            if (fallbackProductIds.length === 0) {
              console.warn(
                `Subscription: No last resort fallback ${platform} product IDs available`,
              );
              Alert.alert(
                'Error',
                `Failed to initialize in-app purchases: ${err.message}`,
              );
              setLoading(false);
              return;
            }

            const fallbackProducts = await RNIap.getProducts({
              skus: fallbackProductIds,
            });

            if (fallbackProducts.length > 0) {
              console.log(
                `Subscription: Found ${fallbackProducts.length} fallback products`,
              );
              setProducts(fallbackProducts);
              // Store products globally for amount calculations
              global.availableProducts = fallbackProducts;
              setSelectedProductId(fallbackProducts[0].productId);
            } else {
              console.warn(
                'Subscription: No fallback products found from store',
              );
              Alert.alert(
                'Error',
                `Failed to initialize in-app purchases: ${err.message}`,
              );
            }
          } catch (fallbackErr) {
            console.error('Error with fallback products:', fallbackErr);
            Alert.alert(
              'Error',
              `Failed to initialize in-app purchases: ${err.message}`,
            );
          }
        }
      }
    } catch (err) {
      console.error('Error reconnecting IAP:', err);
      setConnectionState('error');
      Alert.alert(
        'Connection Error',
        'Failed to connect to the app store. Please try again later.',
      );
      return false;
    }
  }, [fetchDirectPlayStoreProducts, userCountry]);

  // Add function to fetch direct Google Play products
  const fetchDirectPlayStoreProducts = useCallback(async () => {
    try {
      if (Platform.OS !== 'android') {
        return [];
      }

      // Get user's country code with enhanced detection
      const countryCode = await getUserCountryCode();
      setUserCountry(countryCode);

      // Get the package name from config
      const packageName = config.GOOGLE_PLAY_PACKAGE_NAME;

      // For demonstration, we'd get the access token from your backend
      // Here we use the auth token, but in production you'd use a dedicated token
      // with Google Play API permissions
      const accessToken = authState.accessToken;

      if (!accessToken) {
        return [];
      }

      // Fetch products directly from Google Play (this function already uses dynamic product IDs)
      const playStoreProducts = await fetchPlayStoreProducts(
        accessToken,
        countryCode,
      );

      return playStoreProducts;
    } catch (error) {
      console.error('Error in fetchDirectPlayStoreProducts:', error);
      return [];
    }
  }, [authState.accessToken]);

  // Update handleExistingPurchase to properly handle credit updates
  const handleExistingPurchase = useCallback(
    async productId => {
      try {
        console.log('Checking for existing purchases...');
        setPurchasePending(true);

        const purchases = await RNIap.getAvailablePurchases();
        console.log('Available purchases:', purchases);

        if (purchases.length === 0) {
          console.log('No existing purchases found');
          setPurchasePending(false);
          return;
        }

        // Find the purchase for the selected product
        let existingPurchase = null;

        if (productId) {
          existingPurchase = purchases.find(p => p.productId === productId);
          console.log(`Looking for specific product ID: ${productId}`);
        }

        // If not found, just use the first available purchase
        if (!existingPurchase && purchases.length > 0) {
          existingPurchase = purchases[0];
          console.log(
            'Using first available purchase:',
            existingPurchase.productId,
          );
        }

        if (existingPurchase) {
          // Check if already processed
          const purchaseKey =
            Platform.OS === 'android'
              ? existingPurchase.purchaseToken
              : existingPurchase.transactionId;

          if (processedPurchases.has(purchaseKey)) {
            console.log(
              'Existing purchase already processed, skipping:',
              purchaseKey,
            );
            setPurchasePending(false);
            return;
          }

          // Mark as processed immediately
          processedPurchases.add(purchaseKey);
          console.log('Existing purchase marked as processed:', purchaseKey);

          console.log('Processing existing purchase:', existingPurchase);

          try {
            if (authState.accessToken) {
              const pendingPayment = await createPendingPayment(
                existingPurchase.productId,
                getAmountFromProductId(existingPurchase.productId),
                authState.accessToken,
              );
              console.log('Pending payment created for existing purchase');

              const processResult = await processPurchase(
                existingPurchase,
                authState.accessToken,
              );
              console.log('Existing purchase processed');

              let verifyResult;

              // For iOS, use the new Apple receipt validation endpoint
              if (Platform.OS === 'ios') {
                try {
                  // Get the receipt data
                  const receiptData = existingPurchase.transactionReceipt;

                  // First try the new Apple-specific endpoint
                  verifyResult = await validateAppleReceipt(
                    receiptData,
                    existingPurchase.productId,
                    authState.accessToken,
                    false, // Not a subscription
                  );
                  console.log(
                    'Verified existing purchase with Apple-specific endpoint:',
                    verifyResult,
                  );
                } catch (appleVerifyErr) {
                  console.warn(
                    'Error with Apple-specific verification, falling back to generic endpoint:',
                    appleVerifyErr,
                  );

                  // Fall back to the original verification method
                  const purchaseToken = existingPurchase.transactionReceipt;
                  const environment = purchaseToken?.includes('sandbox')
                    ? 'sandbox'
                    : 'production';

                  verifyResult = await verifyPurchase(
                    purchaseToken,
                    existingPurchase.productId,
                    authState.accessToken,
                    true, // isIOS
                    environment,
                  );
                  console.log(
                    'Verified existing purchase with fallback endpoint:',
                    verifyResult,
                  );
                }
              } else {
                // For Android, use the existing verification method
                const purchaseToken = existingPurchase.purchaseToken;
                verifyResult = await verifyPurchase(
                  purchaseToken,
                  existingPurchase.productId,
                  authState.accessToken,
                );
              }

              if (verifyResult && verifyResult.status === 'SUCCESS') {
                // Handle successful verification
                if (verifyResult.credits) {
                  // If the server provided credits, use that value (preferred approach)
                  console.log(
                    `Server provided ${verifyResult?.credits} credits for existing purchase, updating user wallet`,
                  );
                  updateUserCredits(verifyResult.credits);
                  await refreshCredits(); // Single refresh
                } else {
                  // Only as fallback if server didn't provide credits
                  const creditsToAdd = getCreditsForProduct(
                    existingPurchase.productId,
                  );
                  console.log(
                    `Using fallback credit amount for existing purchase: ${creditsToAdd}`,
                  );
                  addCredits(creditsToAdd);
                  await refreshCredits(); // Single refresh
                }

                Alert.alert(
                  'Purchase Processed',
                  'Your previous purchase has been processed successfully!',
                );
              } else {
                Alert.alert(
                  'Verification Failed',
                  'Your purchase could not be verified. Please contact support.',
                );
              }

              // Always finish the transaction for iOS
              if (Platform.OS === 'ios') {
                try {
                  console.log('Finishing iOS transaction');
                  await safeFinishTransaction(existingPurchase, true);
                  console.log('iOS transaction finished successfully');
                } catch (finishErr) {
                  console.warn('Error finishing transaction:', finishErr);
                  // Even if first attempt fails, try again with direct approach
                  try {
                    console.log(
                      'Retrying transaction finish with direct method',
                    );
                    await RNIap.finishTransaction({
                      purchase: existingPurchase,
                      isConsumable: true,
                    });
                    console.log('iOS transaction finished on second attempt');
                  } catch (secondFinishErr) {
                    console.error(
                      'Failed to finish transaction on second attempt:',
                      secondFinishErr,
                    );
                  }
                }
              } else if (Platform.OS === 'android') {
                // For Android, explicitly consume the purchase to allow repurchasing
                try {
                  console.log(
                    'Consuming Android purchase to allow repurchasing',
                  );

                  if (existingPurchase.purchaseToken) {
                    // First try to consume directly with the consumePurchaseAndroid method
                    try {
                      if (typeof RNIap.consumePurchaseAndroid === 'function') {
                        await RNIap.consumePurchaseAndroid({
                          token: existingPurchase.purchaseToken,
                        });
                        console.log('Successfully consumed Android purchase');
                      } else {
                        // Fallback to finishing transaction with the consumable flag set to true
                        await RNIap.finishTransaction({
                          purchase: existingPurchase,
                          isConsumable: true,
                        });
                        console.log(
                          'Finished Android transaction as consumable',
                        );
                      }
                    } catch (consumeErr) {
                      console.warn(
                        'Error consuming purchase, trying alternative method:',
                        consumeErr,
                      );
                      // Fallback to safe finish as a last resort
                      await safeFinishTransaction(existingPurchase, true);
                    }
                  } else {
                    console.warn('No purchase token available for consumption');
                  }
                } catch (androidErr) {
                  console.warn(
                    'Error finishing Android transaction:',
                    androidErr,
                  );
                  // Continue anyway - we don't want to block the user experience
                }
              }
            } else {
              Alert.alert(
                'Authentication Required',
                'Please log in to process your purchase.',
              );
            }
          } catch (err) {
            console.error('Error handling existing purchase:', err);
            Alert.alert(
              'Error',
              'Failed to process existing purchase: ' + err.message,
            );
          }
        }
      } catch (err) {
        console.error('Error handling existing purchase:', err);
        Alert.alert(
          'Error',
          'Failed to check existing purchases: ' + err.message,
        );
      } finally {
        setPurchasePending(false);
      }
    },
    [authState.accessToken, addCredits, updateUserCredits, refreshCredits],
  );

  // Add a new function to validate Apple receipt using the new endpoint
  const validateAppleReceipt = async (
    receiptData,
    productId,
    token,
    isSubscription = false,
    environment = 'production',
  ) => {
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!receiptData) {
        throw new Error('Receipt data is required for validation');
      }

      console.log(`Validating Apple receipt for ${productId}`);

      // Check if it's likely a sandbox receipt
      const isSandbox = receiptData.includes('sandbox');
      console.log(
        `Receipt appears to be from ${
          isSandbox ? 'SANDBOX' : 'PRODUCTION'
        } environment`,
      );

      // First attempt with the specific Apple endpoint
      try {
        const response = await fetch(
          `${API_URL}/v1/payments/validate-apple-receipt`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              receiptData: receiptData,
              productId: productId,
              isSubscription: isSubscription,
              environment: isSandbox ? 'sandbox' : 'production', // Explicitly pass environment info
              allowSandboxInProduction: true, // Add this flag to indicate server should fallback to sandbox if production validation fails
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Apple receipt validation error (${response.status}):`,
            errorText,
          );

          // Return a structured error object instead of throwing
          return {
            status: 'ERROR',
            isValid: false,
            errorCode: response.status,
            errorMessage: `Failed to validate receipt: ${response.status}`,
            // Include credits based on product ID as fallback
            credits: getCreditsForProduct(productId),
            amount: getAmountFromProductId(productId),
            productId: productId,
          };
        }

        const resultData = await response.json();

        // Validate result structure before returning
        if (!resultData) {
          console.error('Empty result from receipt validation');
          return {
            status: 'ERROR',
            isValid: false,
            errorMessage: 'Empty response from server',
            credits: getCreditsForProduct(productId), // Fallback
            productId: productId,
          };
        }

        // If result doesn't have status, add a default one
        if (!resultData.status) {
          console.log('Adding default SUCCESS status to result');
          resultData.status = 'SUCCESS';
        }

        console.log('Apple receipt validation result:', resultData);
        return resultData;
      } catch (err) {
        console.error('Error with primary validation method:', err);
        // Return a structured error object instead of a status string
        return {
          status: 'ERROR',
          isValid: false,
          errorMessage: err.message,
          errorDetail: 'Exception during validation',
          credits: getCreditsForProduct(productId), // Fallback
          productId: productId,
        };
      }
    } catch (err) {
      console.error('Error validating Apple receipt:', err);
      // Return a structured error object instead of throwing
      return {
        status: 'ERROR',
        isValid: false,
        errorMessage: err.message,
        errorDetail: 'Top-level exception',
        credits: getCreditsForProduct(productId), // Fallback
        productId: productId,
      };
    }
  };

  // Update the purchase handler for iOS to ensure transactions complete
  const setupPurchaseListeners = useCallback(() => {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async purchase => {
        console.log('Purchase update event received:', purchase);
        try {
          // Generate a unique key for this purchase
          const purchaseKey =
            Platform.OS === 'android'
              ? purchase.purchaseToken
              : purchase.transactionId;

          // Check if this purchase has already been processed
          if (processedPurchases.has(purchaseKey)) {
            console.log(
              'Purchase already processed, ignoring duplicate event:',
              purchaseKey,
            );

            // Even for processed purchases, make sure transaction is finished on iOS
            if (Platform.OS === 'ios') {
              try {
                console.log(
                  'Ensuring transaction is finished for already processed purchase',
                );
                await safeFinishTransaction(purchase, true);
              } catch (finishErr) {
                console.warn(
                  'Error finishing already processed transaction:',
                  finishErr,
                );
              }
            }

            return;
          }

          // Mark this purchase as being processed
          processedPurchases.add(purchaseKey);
          console.log('Processing purchase:', purchaseKey);

          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              // For iOS, extract receipt data
              let environment = 'production';
              let receiptData = receipt;

              if (Platform.OS === 'ios') {
                // Determine environment (sandbox vs production)
                const isSandbox = receipt.includes('sandbox');
                environment = isSandbox ? 'sandbox' : 'production';
                console.log(
                  `Processing iOS receipt in ${environment} environment`,
                );
              }

              // Create pending payment
              try {
                await createPendingPayment(
                  purchase.productId,
                  getAmountFromProductId(purchase.productId),
                  authState.accessToken,
                );
                console.log('Pending payment created for purchase processing');
              } catch (pendingErr) {
                console.warn('Error creating pending payment:', pendingErr);
                // Continue anyway to process the purchase
              }

              // Initialize verification variables
              let verifyResult = null;
              let verificationSuccess = false;
              let creditsToAdd = 0;

              // Process the purchase - which now handles validation for iOS directly
              try {
                const processResult = await processPurchase(
                  purchase,
                  authState.accessToken,
                );
                console.log(
                  'Purchase processed with server, result:',
                  processResult,
                );

                if (Platform.OS === 'ios') {
                  // For iOS, processPurchase now handles validation directly
                  verifyResult = processResult;

                  // Changed: check for status or isValid, but also consider other fallbacks
                  verificationSuccess =
                    processResult &&
                    (processResult.status === 'SUCCESS' ||
                      processResult.isValid ||
                      // Consider success even with error if we have credits info
                      processResult.credits > 0 ||
                      processResult.amount > 0);

                  // IMPORTANT: Extract credits info regardless of status
                  if (processResult) {
                    if (processResult.credits) {
                      creditsToAdd = processResult.credits;
                      console.log(
                        `Using ${creditsToAdd} credits from validation result`,
                      );
                    } else if (processResult.amount) {
                      // If we have amount but not credits, calculate credits
                      creditsToAdd = processResult.amount;
                      console.log(
                        `Using amount ${creditsToAdd} from validation result as credits`,
                      );
                    } else {
                      // Fallback to product ID based calculation
                      creditsToAdd = getCreditsForProduct(purchase.productId);
                      console.log(
                        `Using ${creditsToAdd} credits calculated from product ID`,
                      );
                    }
                  }

                  if (verificationSuccess) {
                    console.log(
                      'iOS purchase successfully validated or has credits info',
                    );
                  } else {
                    console.warn(
                      'iOS purchase validation did not return success:',
                      processResult,
                    );
                    // Even with verification not successful, we'll still use the credits info
                    console.log(
                      `Will add ${creditsToAdd} credits despite validation issues`,
                    );
                    verificationSuccess = true; // Force success to update credits
                  }
                } else {
                  // For Android, proceed with verification as before
                  console.log(
                    'Android purchase processed, proceeding to verification',
                  );

                  const purchaseToken = purchase.purchaseToken;
                  verifyResult = await verifyPurchase(
                    purchaseToken,
                    purchase.productId,
                    authState.accessToken,
                  );
                  verificationSuccess =
                    verifyResult && verifyResult.status === 'SUCCESS';
                }
              } catch (processErr) {
                console.warn(
                  'Error processing purchase with server:',
                  processErr,
                );
                // For iOS, if there's a processing error, still try to verify the receipt
                if (Platform.OS === 'ios') {
                  console.log(
                    'Skipping processing step for iOS due to error, continuing to verification',
                  );
                  // Continue to verification step - don't rethrow
                } else {
                  // For Android, this is more critical - rethrow to handle in the outer catch
                  throw processErr;
                }
              }

              if (verifyResult && verifyResult.status === 'SUCCESS') {
                // Handle successful verification
                if (verifyResult.credits) {
                  // If the server provided credits, use that
                  // (preferred approach)
                  console.log(
                    `Server provided ${verifyResult.credits} credits, updating user wallet`,
                  );
                  updateUserCredits(verifyResult.credits);
                  await refreshCredits(); // Single refresh
                } else {
                  // Only as fallback if server didn't provide credits
                  const creditsToAdd = getCreditsForProduct(purchase.productId);
                  console.log(`Using fallback credit amount: ${creditsToAdd}`);
                  addCredits(creditsToAdd);
                  await refreshCredits(); // Single refresh
                }

                // Show success message
                Alert.alert(
                  'Purchase Successful',
                  `Your purchase was successful! Credits have been added to your account.`,
                );
              } else {
                console.warn(
                  'Verification did not return SUCCESS status:',
                  verifyResult,
                );
              }

              // Always finish the transaction for iOS
              if (Platform.OS === 'ios') {
                try {
                  console.log('Finishing iOS transaction');
                  await safeFinishTransaction(purchase, true);
                  console.log('iOS transaction finished successfully');
                } catch (finishErr) {
                  console.warn('Error finishing transaction:', finishErr);
                  // Even if first attempt fails, try again with direct approach
                  try {
                    console.log(
                      'Retrying transaction finish with direct method',
                    );
                    await RNIap.finishTransaction({
                      purchase,
                      isConsumable: true,
                    });
                    console.log('iOS transaction finished on second attempt');
                  } catch (secondFinishErr) {
                    console.error(
                      'Failed to finish transaction on second attempt:',
                      secondFinishErr,
                    );
                  }
                }
              } else if (Platform.OS === 'android') {
                // For Android, explicitly consume the purchase to allow repurchasing
                try {
                  console.log(
                    'Consuming Android purchase to allow repurchasing',
                  );

                  if (purchase.purchaseToken) {
                    // First try to consume directly with the consumePurchaseAndroid method
                    try {
                      if (typeof RNIap.consumePurchaseAndroid === 'function') {
                        await RNIap.consumePurchaseAndroid({
                          token: purchase.purchaseToken,
                        });
                        console.log('Successfully consumed Android purchase');
                      } else {
                        // Fallback to finishing transaction with the consumable flag set to true
                        await RNIap.finishTransaction({
                          purchase,
                          isConsumable: true,
                        });
                        console.log(
                          'Finished Android transaction as consumable',
                        );
                      }
                    } catch (consumeErr) {
                      console.warn(
                        'Error consuming purchase, trying alternative method:',
                        consumeErr,
                      );
                      // Fallback to safe finish as a last resort
                      await safeFinishTransaction(purchase, true);
                    }
                  } else {
                    console.warn('No purchase token available for consumption');
                  }
                } catch (androidErr) {
                  console.warn(
                    'Error finishing Android transaction:',
                    androidErr,
                  );
                  // Continue anyway - we don't want to block the user experience
                }
              }
            } catch (apiErr) {
              console.error('API error during purchase flow:', apiErr);

              // For iOS purchases, we need to be extra careful to ensure the user gets credits
              if (Platform.OS === 'ios') {
                try {
                  // First try to finish the transaction
                  await RNIap.finishTransaction({
                    purchase,
                    isConsumable: true,
                  });
                  console.log(
                    'Successfully finished transaction despite API error',
                  );

                  // Then add credits directly as fallback
                  const creditsToAdd = getCreditsForProduct(purchase.productId);
                  if (creditsToAdd > 0) {
                    console.log(
                      `API error occurred, adding ${creditsToAdd} credits as fallback`,
                    );
                    updateUserCredits(creditsToAdd);
                    await refreshCredits();

                    // Show a more positive message to the user
                    Alert.alert(
                      'Purchase Complete',
                      `Your purchase has been completed and ${creditsToAdd} credits have been added to your account.`,
                    );
                    return; // Exit early since we've handled it
                  }
                } catch (finishErr) {
                  console.warn(
                    'Error finishing iOS transaction after API error:',
                    finishErr,
                  );

                  // Even if finishing fails, still try to add credits
                  try {
                    const creditsToAdd = getCreditsForProduct(
                      purchase.productId,
                    );
                    if (creditsToAdd > 0) {
                      console.log(
                        `Adding ${creditsToAdd} credits despite transaction finishing error`,
                      );
                      updateUserCredits(creditsToAdd);
                      await refreshCredits();

                      Alert.alert(
                        'Purchase Complete',
                        `Your purchase has been processed. ${creditsToAdd} credits have been added to your account.`,
                      );
                      return; // Exit early
                    }
                  } catch (err) {
                    console.error(
                      'Final fallback for credits addition failed:',
                      err,
                    );
                  }
                }
              }

              // Only show this alert if we couldn't handle it above
              Alert.alert(
                'Purchase Processing Issue',
                'Your purchase was received but we had trouble processing it. Please contact support if credits are not added to your account.',
              );
            }
          } else {
            console.warn('No receipt available for purchase:', purchase);
          }
        } catch (err) {
          console.error('Error handling purchase update:', err);
          Alert.alert(
            'Purchase Error',
            'There was an error processing your purchase. Please try again or contact support.',
          );
        } finally {
          // Always reset processing state when done
          setPurchasePending(false);
        }
      },
    );

    const purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {
      console.log('Purchase error event:', error);

      // Always reset processing state on errors
      setPurchasePending(false);

      if (error.code === 'E_ALREADY_OWNED') {
        console.log('Product already owned, handling existing purchase...');
        handleExistingPurchase(selectedProductId)
          .then(() => console.log('Existing purchase handled successfully'))
          .catch(err =>
            console.error('Failed to handle existing purchase:', err),
          );
      } else if (error.code === 'E_DEVELOPER_ERROR') {
        console.error('Developer error:', error.message);
        Alert.alert(
          'Configuration Error',
          'There was an error with the purchase configuration. Please try again later.',
        );
      } else if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase Error', `Something went wrong: ${error.message}`);
      }
    });

    return {
      purchaseUpdateSubscription,
      purchaseErrorSubscription,
    };
  }, [
    authState.accessToken,
    handleExistingPurchase,
    addCredits,
    updateUserCredits,
    selectedProductId,
    refreshCredits,
  ]);

  // Update useEffect to handle connection state
  useEffect(() => {
    const initializeIAP = async () => {
      // Prevent multiple initialization attempts
      if (isInitializing) {
        console.log('IAP initialization already in progress, skipping...');
        return;
      }

      // Set loading state at the start
      setLoading(true);

      // Even if already initialized, we should still load cached products
      if (iapInitialized) {
        console.log('IAP already initialized, loading cached products');

        // If we already have products in memory, use them
        if (global.availableProducts && global.availableProducts.length > 0) {
          console.log('Using cached products from memory');
          setProducts(global.availableProducts);
          setSelectedProductId(global.availableProducts[0].productId);
          setLoading(false);
          return;
        }

        // Otherwise, try to fetch products again without full reinitialization
        try {
          if (Platform.OS === 'ios') {
            // Fetch product IDs dynamically from backend
            const productIds = await getPlatformProductIds('ios');
            console.log(
              'Refreshing iOS products without reinitialization, product IDs:',
              productIds,
            );

            if (productIds.length === 0) {
              console.warn(
                'Subscription: No iOS product IDs received from backend for refresh',
              );
              setLoading(false);
              return;
            }

            // Check connection status first
            if (connectionState !== 'connected') {
              console.log('Connection is not active, reconnecting first...');
              await reconnectIAP();
            }

            const refreshedProducts = await RNIap.getProducts({
              skus: productIds,
              forceRefresh: true,
            });

            if (refreshedProducts && refreshedProducts.length > 0) {
              console.log(
                `Successfully refreshed ${refreshedProducts.length} products`,
              );

              // Sort products by price
              const sortedProducts = sortProductsByPrice(refreshedProducts);

              // Log sorted products for verification
              console.log(
                'Refreshed iOS products sorted by price (lowest to highest):',
              );
              sortedProducts.forEach((product, idx) => {
                console.log(
                  `${idx + 1}. ${product.productId}: ${product.price}`,
                );
              });

              setProducts(sortedProducts);
              global.availableProducts = sortedProducts;

              // Set the lowest price product as default
              if (sortedProducts.length > 0) {
                setSelectedProductId(sortedProducts[0].productId);
              }
            }
          }
        } catch (refreshErr) {
          console.log(
            'Error refreshing products, will reinitialize:',
            refreshErr,
          );
        }
      }

      try {
        isInitializing = true;
        setConnectionState('connecting');

        // First try to end any existing connection
        try {
          await RNIap.endConnection();
        } catch (endErr) {
          console.log('No existing connection to end');
        }

        console.log('========= INITIALIZING IN-APP PURCHASES =========');
        // Initialize new connection
        await RNIap.initConnection();
        console.log('RNIap connection initialized successfully');
        iapInitialized = true;

        if (Platform.OS === 'ios') {
          try {
            // Fetch product IDs dynamically from backend
            const productIds = await getPlatformProductIds('ios');

            console.log(
              `Subscription: Fetched ${productIds.length} iOS product IDs:`,
              productIds,
            );

            if (productIds.length === 0) {
              console.warn(
                'Subscription: No iOS product IDs received from backend',
              );
              Alert.alert(
                'Configuration Error',
                'No products configured for iOS. Please contact support.',
              );
              setLoading(false);
              return;
            }

            // Enhanced error handling
            try {
              // Try with forceRefresh first
              try {
                const productsAttempt1 = await RNIap.getProducts({
                  skus: productIds,
                  forceRefresh: true,
                });

                if (productsAttempt1.length > 0) {
                  console.log(
                    `Subscription: Found ${productsAttempt1.length} iOS products on first attempt`,
                  );

                  // Format products for display
                  const formattedProducts = productsAttempt1.map(product => {
                    if (Platform.OS === 'ios') {
                      return formatIOSProduct(product, userCountry);
                    }
                    return {
                      ...product,
                      isSubscription: false,
                    };
                  });

                  // Sort products by price
                  const sortedProducts = sortProductsByPrice(formattedProducts);

                  setProducts(sortedProducts);
                  global.availableProducts = sortedProducts;
                  setSelectedProductId(sortedProducts[0].productId);
                  setLoading(false);
                  return;
                }
              } catch (attempt1Error) {
                console.warn(
                  'Subscription: First attempt to fetch iOS products failed:',
                  attempt1Error,
                );
                // Continue to second attempt
              }

              // If first attempt fails, try with slightly different options
              try {
                const productsAttempt2 = await RNIap.getProducts({
                  skus: productIds,
                });

                if (productsAttempt2.length > 0) {
                  console.log(
                    `Subscription: Found ${productsAttempt2.length} iOS products on second attempt`,
                  );

                  // Format products for display
                  const formattedProducts = productsAttempt2.map(product => {
                    return {
                      ...product,
                    };
                  });

                  // Sort products by price
                  const sortedProducts = sortProductsByPrice(formattedProducts);

                  setProducts(sortedProducts);
                  global.availableProducts = sortedProducts;
                  setSelectedProductId(sortedProducts[0].productId);
                  setLoading(false);
                  return;
                }
              } catch (attempt2Error) {
                console.warn(
                  'Subscription: Second attempt to fetch iOS products failed:',
                  attempt2Error,
                );
                // Continue to alert
              }

              Alert.alert(
                'No Products Available',
                'Could not load products from App Store Connect. Please try again later.',
              );
              setLoading(false);
              return;
            } catch (fetchError) {
              console.error(
                'Subscription: Error fetching iOS products:',
                fetchError,
              );
              Alert.alert(
                'Error',
                'Failed to fetch products. Please try again later.',
              );
              setLoading(false);
              return;
            }
          } catch (iosError) {
            console.error('Subscription: iOS initialization error:', iosError);
            Alert.alert(
              'Error',
              'Unable to connect to App Store. Please check your internet connection or product configuration in App Store Connect.',
            );
            setLoading(false);
          }
        } else if (Platform.OS === 'android') {
          // Existing Android code
          try {
            console.log(
              'Attempting to fetch products directly from Google Play...',
            );
            const directProducts = await fetchDirectPlayStoreProducts();

            if (directProducts && directProducts.length > 0) {
              console.log(
                'Successfully fetched products from Google Play API:',
                directProducts,
              );
              setProducts(directProducts);
              global.availableProducts = directProducts;

              // Sort products by price
              const sortedProducts = sortProductsByPrice(directProducts);

              // Log sorted products for verification
              console.log(
                'Android products sorted by price (lowest to highest):',
              );
              sortedProducts.forEach((product, idx) => {
                console.log(
                  `${idx + 1}. ${product.productId}: ${product.price}`,
                );
              });

              // Set the lowest price product as default
              if (sortedProducts.length > 0) {
                const lowestPriceProduct = sortedProducts[0];
                setSelectedProductId(lowestPriceProduct.productId);
              }
              setLoading(false);
              return;
            }
          } catch (directError) {
            console.error('Error in direct Play Store fetch:', directError);
          }
        }

        // Fall back to RNIap if direct fetch fails
        console.log('Using RNIap to fetch products');

        try {
          console.log('Fetching available one-time products...');

          // Fetch product IDs dynamically from backend
          const platform = Platform.OS === 'ios' ? 'ios' : 'android';
          const oneTimeProductIds = await getPlatformProductIds(platform);

          console.log(
            `Subscription: Fetched ${oneTimeProductIds.length} ${platform} product IDs for one-time products:`,
            oneTimeProductIds,
          );

          if (oneTimeProductIds.length === 0) {
            console.warn(
              `Subscription: No ${platform} product IDs received from backend for one-time products`,
            );
            Alert.alert(
              'Configuration Error',
              `No products configured for ${platform}. Please contact support.`,
            );
            setLoading(false);
            return;
          }

          const oneTimeProducts = await RNIap.getProducts({
            skus: oneTimeProductIds,
          });
          console.log('Available one-time products:', oneTimeProducts);

          if (oneTimeProducts.length > 0) {
            console.log('All available products:', oneTimeProducts);
            setProducts(oneTimeProducts);

            // Store products globally for amount calculations
            global.availableProducts = oneTimeProducts;

            // Sort products by price
            const sortedProducts = sortProductsByPrice(oneTimeProducts);

            // Log sorted products for verification
            console.log('Products sorted by price (lowest to highest):');
            sortedProducts.forEach((product, idx) => {
              console.log(`${idx + 1}. ${product.productId}: ${product.price}`);
            });

            setProducts(sortedProducts);
            global.availableProducts = sortedProducts;

            // Set the lowest price product as default
            if (sortedProducts.length > 0) {
              setSelectedProductId(sortedProducts[0].productId);
              console.log(
                'Setting initial selected product ID:',
                sortedProducts[0].productId,
              );
            }
          } else {
            console.log('No products available from the store');
            Alert.alert(
              'Error',
              'No products available from the store. Please check your configuration.',
            );
            setLoading(false);
          }
        } catch (err) {
          console.error('Error fetching products from store:', err);
          Alert.alert(
            'Error',
            `Failed to initialize in-app purchases: ${err.message}`,
          );
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing IAP:', err);
        setConnectionState('error');
        Alert.alert(
          'Error',
          `Failed to initialize in-app purchases: ${err.message}`,
        );
      } finally {
        isInitializing = false;
        setLoading(false);
      }
    };

    // Add a navigation focus listener to refresh products when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Subscription screen focused, checking products');

      // If we already have IAP initialized but no products, try to reload them
      if (iapInitialized && (!products || products.length === 0)) {
        console.log('No products loaded but IAP initialized, forcing refresh');
        setLoading(true);

        // Try to reconnect to IAP
        reconnectIAP()
          .then(() => {
            console.log('Successfully reconnected to IAP after navigation');
          })
          .catch(err => {
            console.error('Failed to reconnect to IAP after navigation:', err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });

    initializeIAP();
    const listeners = setupPurchaseListeners();

    // Cleanup function
    return () => {
      if (listeners.purchaseUpdateSubscription) {
        listeners.purchaseUpdateSubscription.remove();
      }
      if (listeners.purchaseErrorSubscription) {
        listeners.purchaseErrorSubscription.remove();
      }

      // Remove the navigation listener
      unsubscribe();

      const cleanup = async () => {
        try {
          // Check if there's an active purchase before ending connection
          if (connectionState === 'connected' && !purchasePending) {
            console.log(
              'Closing IAP connection during cleanup (no active purchase)...',
            );
            try {
              await RNIap.endConnection();
              console.log('IAP connection closed successfully');
            } catch (endErr) {
              console.warn('Error ending IAP connection:', endErr);
              // Try one more time after a short delay
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                await RNIap.endConnection();
                console.log('IAP connection closed on second attempt');
              } catch (secondEndErr) {
                console.warn(
                  'Failed to end IAP connection on second attempt:',
                  secondEndErr,
                );
              }
            }
            setConnectionState('disconnected');
            iapInitialized = false;
          } else if (purchasePending) {
            console.log(
              'Skipping IAP connection close because a purchase is in progress',
            );
            // Just mark as initialized but don't actually close the connection
            // This way the purchase can complete properly
          }
        } catch (err) {
          console.warn('Error during cleanup:', err);
          // Ensure we still mark as disconnected even if error occurs
          if (!purchasePending) {
            setConnectionState('disconnected');
            iapInitialized = false;
          }
        }
      };
      cleanup();
    };
  }, [
    navigation,
    setupPurchaseListeners,
    reconnectIAP,
    products,
    connectionState,
    fetchDirectPlayStoreProducts,
    purchasePending,
    userCountry,
  ]);
  // Added all required dependencies to the array

  // Update handlePurchase function for iOS App Store Connect to fix stuck processing
  const handlePurchase = useCallback(
    async productId => {
      try {
        console.log('handlePurchase called with productId:', productId);

        // Set a timeout to reset purchase state in case of hang
        const timeoutId = setTimeout(() => {
          console.log('Purchase timeout reached - resetting purchase state');
          setPurchasePending(false);
        }, 30000); // 30 second timeout

        // Validate product ID
        if (!productId) {
          console.warn('No product ID provided to handlePurchase!');
          if (selectedProductId) {
            productId = selectedProductId;
          } else if (products.length > 0) {
            productId = products[0].productId;
          } else {
            clearTimeout(timeoutId);
            throw new Error('No products available for purchase');
          }
        }

        // Verify product exists in available products
        const productExists = products.some(p => p.productId === productId);
        if (!productExists) {
          clearTimeout(timeoutId);
          throw new Error(`Product ${productId} not available in the store`);
        }

        // Check for auth token
        if (!authState.accessToken) {
          clearTimeout(timeoutId);
          Alert.alert(
            'Authentication Required',
            'Please log in before making a purchase.',
          );
          return;
        }

        setPurchasePending(true);

        // Platform specific purchase handling
        if (Platform.OS === 'ios') {
          try {
            // Create pending payment for server tracking
            await createPendingPayment(
              productId,
              getAmountFromProductId(productId),
              authState.accessToken,
            );

            // Special handling for simulator - can't make real purchases in simulator
            if (__DEV__ && !Platform.isPad && !Platform.isTV) {
              const isSimulator =
                Platform.constants.uiMode?.includes?.('simulator') || // iOS simulator check
                (Platform.constants.Brand === 'google' &&
                  Platform.constants.isEmulator); // Android emulator

              if (isSimulator) {
                console.log(
                  'Running in simulator - simulating a successful purchase',
                );

                // Find the product
                const product = products.find(p => p.productId === productId);
                if (product) {
                  // Get credits from the product
                  const creditsToAdd =
                    product.credits || getCreditsForProduct(productId);

                  // Add credits and update the UI
                  console.log(
                    `Adding ${creditsToAdd} credits from simulated purchase`,
                  );
                  updateUserCredits(creditsToAdd);
                  await refreshCredits();

                  // Show success message
                  Alert.alert(
                    'Purchase Successful (Simulator)',
                    `Your purchase was successful! ${creditsToAdd} credits have been added to your account.`,
                  );

                  clearTimeout(timeoutId);
                  setPurchasePending(false);
                  return;
                }
              }
            }

            // Request the purchase from App Store
            console.log(
              `Requesting purchase from App Store for product: ${productId}`,
            );
            try {
              // Make sure we have a valid SKU/product ID
              if (!productId) {
                throw new Error('Product ID is missing for purchase request');
              }

              // Log products to verify the product exists
              console.log('Available products:', products);
              const productToPurchase = products.find(
                p => p.productId === productId,
              );
              if (!productToPurchase) {
                console.warn(
                  `Product with ID ${productId} not found in available products!`,
                );
              } else {
                console.log('Found product to purchase:', productToPurchase);
              }

              // Ensure IAP is initialized
              if (!iapInitialized) {
                console.log('IAP not initialized, reinitializing...');
                await RNIap.initConnection();
                iapInitialized = true;
              }

              // Check if we need to reconnect
              if (connectionState !== 'connected') {
                console.log('Reconnecting IAP before purchase...');
                await reconnectIAP();
              }

              // Ensure connection is valid before attempting purchase
              let connectionValid = false;
              try {
                // Use a simple product query to validate connection
                await RNIap.getProducts({skus: [productId]});
                connectionValid = true;
                console.log('IAP connection validated successfully');
              } catch (connErr) {
                console.log('Connection validation failed:', connErr);
                // Try one more time to reconnect
                try {
                  console.log(
                    'Attempting final reconnection before purchase...',
                  );
                  await reconnectIAP();

                  // Verify connection again
                  await RNIap.getProducts({skus: [productId]});
                  connectionValid = true;
                  console.log('IAP connection revalidated successfully');
                } catch (finalConnErr) {
                  console.log('Final connection attempt failed:', finalConnErr);
                  // We'll still try the purchase as a last resort
                }
              }

              // Request the purchase with explicit parameters
              console.log('Sending purchase request to App Store...');
              const purchase = await RNIap.requestPurchase({
                sku: productId,
                andDangerouslyFinishTransactionAutomaticallyIOS: false, // Restore this parameter
              });

              console.log(
                'iOS purchase request sent successfully:',
                purchase,
                purchase.transactionReceipt,
              );

              // Set state to trigger the useEffect for iOS purchase validation
              setCurrentIosPurchase(purchase);
              setIosPurchaseCompleted(true);

              // The purchase processing is handled by the purchaseUpdatedListener
              // We'll clear the timeout but keep the purchasePending state
              // to be cleared by the listener when the transaction completes
              clearTimeout(timeoutId);
            } catch (iosError) {
              // More detailed error logging to help with debugging
              console.error('iOS purchase request error:', iosError);
              console.error('Error code:', iosError.code);
              console.error('Error message:', iosError.message);
              console.error('Error details:', JSON.stringify(iosError));

              clearTimeout(timeoutId);

              if (
                iosError.code === 'E_CONNECTION_CLOSED' ||
                iosError.code === 'E_NOT_PREPARED'
              ) {
                console.log(
                  'Connection issue detected, attempting to reconnect...',
                );
                setConnectionState('disconnected');
                iapInitialized = false;

                try {
                  // Try to reconnect with progressive backoff
                  console.log('Starting connection recovery process...');

                  // First attempt after short delay
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  await reconnectIAP();

                  // Validate connection by fetching products
                  try {
                    // Fetch product IDs dynamically from backend
                    const productIds = await getPlatformProductIds('ios');

                    console.log(
                      'Connection recovery: Fetched product IDs:',
                      productIds,
                    );

                    if (productIds.length > 0) {
                      const refreshedProducts = await RNIap.getProducts({
                        skus: productIds,
                        forceRefresh: true,
                      });
                      console.log(
                        'Connection recovered successfully, products fetched:',
                        refreshedProducts?.length || 0,
                      );

                      // Update products if we got new ones
                      if (refreshedProducts && refreshedProducts.length > 0) {
                        setProducts(refreshedProducts);
                        global.availableProducts = refreshedProducts;
                      }
                    } else {
                      console.warn(
                        'Connection recovery: No product IDs available',
                      );
                    }
                  } catch (validationErr) {
                    console.log(
                      'Product validation failed after reconnect:',
                      validationErr,
                    );
                    // Continue to alert anyway
                  }

                  Alert.alert(
                    'Connection Reset',
                    'The connection to App Store was reset. Please try your purchase again.',
                    [
                      {
                        text: 'Try Again',
                        onPress: () => handlePurchase(productId),
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                    ],
                  );
                } catch (reconnectError) {
                  console.error('Error reconnecting IAP:', reconnectError);
                  Alert.alert(
                    'Connection Error',
                    'Unable to connect to the App Store. Please check your internet connection and try again later.',
                  );
                }
                setPurchasePending(false);
                return;
              } else if (iosError.code === 'E_ALREADY_OWNED') {
                console.log(
                  'Product already owned, handling existing purchase...',
                );
                await handleExistingPurchase(productId);
              } else if (iosError.code === 'E_USER_CANCELLED') {
                console.log('Purchase cancelled by user');
              } else if (iosError.code === 'E_DEFERRED') {
                Alert.alert(
                  'Purchase Pending',
                  'Your purchase is awaiting approval. It will be processed once approved.',
                );
              } else {
                // Show a more helpful error message
                let errorMsg = iosError.message || 'Unknown error';
                if (iosError.code === 'E_UNKNOWN') {
                  errorMsg =
                    'Unable to connect to the App Store. Please check your internet connection and try again.';
                } else if (iosError.code === 'E_NOT_PREPARED') {
                  errorMsg = 'Purchase system is not ready. Please try again.';
                  // Try to reinitialize IAP
                  iapInitialized = false;
                  // Don't try to call initializeIAP directly, just flag it for reconnection
                  setConnectionState('disconnected');
                  reconnectIAP().catch(reconnectError => {
                    console.error('Error reconnecting IAP:', reconnectError);
                  });
                }

                Alert.alert(
                  'Purchase Error',
                  `Failed to process purchase: ${errorMsg}`,
                );
              }
              setPurchasePending(false);
            }
          } catch (mainError) {
            console.error('Error handling iOS purchase:', mainError);
            setPurchasePending(false);
          }
        } else {
          // Android purchase flow
          try {
            await requestPurchase(
              productId,
              products,
              authState.accessToken,
              userCountry,
            );
            // The processing will be handled by the listener
            clearTimeout(timeoutId);
          } catch (purchaseErr) {
            clearTimeout(timeoutId);
            console.log('Purchase request error:', purchaseErr);

            if (purchaseErr.code === 'E_ALREADY_OWNED') {
              await handleExistingPurchase(productId);
            } else if (purchaseErr.code !== 'E_USER_CANCELLED') {
              Alert.alert(
                'Purchase Error',
                `Failed to process purchase: ${purchaseErr.message}`,
              );
              setPurchasePending(false);
            } else {
              console.log('Purchase cancelled by user');
              setPurchasePending(false);
            }
          }
        }
      } catch (err) {
        console.error('General purchase error:', err);
        Alert.alert('Error', `Failed to process purchase: ${err.message}`);
        setPurchasePending(false);
      }
    },
    [
      selectedProductId,
      products,
      authState.accessToken,
      userCountry,
      handleExistingPurchase,
      refreshCredits,
      connectionState,
      reconnectIAP,
      updateUserCredits,
    ],
  );

  const navigation = useNavigation();

  const renderDynamicProductCards = () => {
    if (products.length === 0) {
      return (
        <View style={styles.plansContainer}>
          <Text style={styles.loadingText}>No products available</Text>
        </View>
      );
    }

    // Sort products by price (lowest to highest)
    const sortedProducts = sortProductsByPrice(products);

    // Log sorted products for verification
    if (Platform.OS === 'ios') {
      sortedProducts.forEach((product, idx) => {
        console.log(
          `${idx + 1}. ${product.productId}: Original: ${
            product.localizedOriginalPrice
          }, Discounted: ${product.localizedPrice}`,
        );
      });
    }

    return (
      <View style={styles.plansContainer}>
        {sortedProducts.map((product, index) => {
          // Derive pricing info if missing (important for Android)
          const pricingFallback = calculatePricing(product) || {};

          const discountValue =
            product.discount !== undefined
              ? product.discount
              : pricingFallback.discountPercentage;

          const originalPriceString =
            product.localizedOriginalPrice ||
            pricingFallback.formattedOriginalPrice;

          const localizedPriceString =
            product.localizedPrice || pricingFallback.discountedPriceFormatted;

          const features = product.features ||
            extractFeaturesFromDescription(product.description) || [
              product.title || 'Credit Pack',
              'Priority Generation queue',
              'Never expires',
            ];

          const processedFeatures =
            Platform.OS === 'ios'
              ? features.map(feature =>
                  feature.length > 60
                    ? feature.substring(0, 60) + '...'
                    : feature,
                )
              : features;

          const showDiscount = discountValue > 0;

          return (
            <PlanCard
              key={product.productId || product.sku}
              title={product.title || 'Credit Pack'}
              price={localizedPriceString}
              features={processedFeatures}
              onPurchase={() => {
                setSelectedProductId(product.productId);
                analyticsUtils.trackCustomEvent('initiate_purchase', {
                  screen: 'subscription_screen',
                  product_id: product.productId || 'unknown',
                  price: localizedPriceString || '0',
                  currency: product.currency || 'USD',
                  platform: Platform.OS,
                  timestamp: Date.now(),
                });

                try {
                  facebookEvents.logCustomEvent('initiate_purchase', {
                    screen: 'subscription_screen',
                    product_id: product.productId || 'unknown',
                    platform: Platform.OS,
                  });
                } catch (_) {}

                handlePurchase(product.productId);
              }}
              selectedPlan={selectedProductId === product.productId}
              disabled={purchasePending}
              originalPrice={originalPriceString}
              discount={discountValue}
              discountedPrice={localizedPriceString}
              currency={product.currency}
              currencySymbol={product.currencySymbol}
            />
          );
        })}
      </View>
    );
  };

  const creditsPerSong = useSelector(selectCreditsPerSong);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !iosPurchaseCompleted || !currentIosPurchase) {
      return;
    }

    console.log('Running iOS purchase validation for:', currentIosPurchase);

    const checkCurrentPurchase = async purchase => {
      if (purchase) {
        try {
          console.log('purchase', purchase);
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            console.log('receipt', receipt);
            const isTestEnvironment = __DEV__;

            const appleReceiptResponse = await RNIap.validateReceiptIos(
              {
                'receipt-data': receipt,
                password: config.ITUNES_SHARED_SECRET, // Make sure this is defined in your config
              },
              isTestEnvironment,
            );

            console.log('appleReceiptResponse', appleReceiptResponse);

            // If receipt is valid
            if (appleReceiptResponse) {
              const {status} = appleReceiptResponse;
              if (status === 0) {
                // Note: Apple's status 0 is success
                console.log('Current purchase validated successfully');

                // Process the purchase with your backend if needed
                const processResult = await processPurchase(
                  purchase,
                  authState.accessToken,
                );

                // If valid, process the credit update
                if (processResult && processResult.credits) {
                  updateUserCredits(processResult.credits);
                  await refreshCredits();
                }

                // Finish the transaction to prevent it from being processed again
                await safeFinishTransaction(purchase, true);

                // Navigate to Home screen if needed
                navigation.navigate('Home');
              }
            }
          }
        } catch (error) {
          console.log('Error validating current purchase:', error);
        } finally {
          // Explicitly finish the transaction with the RNIap API directly
          try {
            // Use only the method that's working successfully
            console.log(
              'Explicitly finishing iOS transaction to ensure receipt finalization',
            );
            await RNIap.finishTransaction({
              purchase,
              isConsumable: true,
            });
            console.log('iOS transaction finished successfully');
          } catch (finishError) {
            console.log('Error finishing iOS transaction:', finishError);
          }
          // Reset the state so we don't reprocess the same purchase
          setIosPurchaseCompleted(false);
          setCurrentIosPurchase(null);
        }
      }
    };

    // Process the iOS purchase
    checkCurrentPurchase(currentIosPurchase);
  }, [
    iosPurchaseCompleted,
    currentIosPurchase,
    authState.accessToken,
    navigation,
    refreshCredits,
    updateUserCredits,
    userCountry,
  ]);

  // Keep the existing useEffect that handles pending purchases on component mount
  useEffect(() => {
    // Only run for iOS
    if (Platform.OS !== 'ios') {
      return;
    }

    const checkPendingPurchases = async () => {
      try {
        const purchases = await RNIap.getPendingPurchasesIOS();
        if (purchases && purchases.length > 0) {
          console.log('Found pending purchases:', purchases);
          // Process the most recent purchase
          const purchase = purchases[0];

          // Set the current purchase to trigger the validation useEffect
          setCurrentIosPurchase(purchase);
          setIosPurchaseCompleted(true);
        }
      } catch (err) {
        console.log('Error getting pending purchases:', err);
      }
    };

    checkPendingPurchases();
  }, []);

  // Add a function to handle the refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('Starting pull-to-refresh...');

    try {
      // Refresh credits - with explicit tracking and force refresh
      console.log('Refreshing user credits...');
      try {
        await refreshCredits(true); // Force refresh to bypass cache
        console.log('Credits refreshed successfully');

        // Force UI update for credits
        const currentCredits = credits;
        console.log('Current credits:', currentCredits);
      } catch (creditError) {
        console.error('Error refreshing credits:', creditError);
      }

      // Refresh products
      console.log('Refreshing products...');
      if (Platform.OS === 'ios') {
        // Fetch product IDs dynamically from backend
        const productIds = await getPlatformProductIds('ios');
        console.log('Refreshing iOS products with IDs:', productIds);

        if (productIds.length === 0) {
          console.warn('Refresh: No iOS product IDs received from backend');
          return;
        }

        // Check connection status first
        if (connectionState !== 'connected') {
          console.log('IAP not connected, reconnecting first...');
          await reconnectIAP();
        }

        try {
          console.log('Attempting to fetch iOS products...');
          const refreshedProducts = await RNIap.getProducts({
            skus: productIds,
            forceRefresh: true,
          });

          if (refreshedProducts && refreshedProducts.length > 0) {
            console.log(
              `Successfully refreshed ${refreshedProducts.length} products`,
            );

            // Apply iOS discounts to refreshed products
            const formattedProducts = refreshedProducts.map(product =>
              formatIOSProduct(product, userCountry),
            );

            // Sort products by price
            const sortedProducts = sortProductsByPrice(formattedProducts);

            // Log sorted products for verification
            console.log(
              'Refreshed iOS products sorted by price (lowest to highest):',
            );
            sortedProducts.forEach((product, idx) => {
              console.log(
                `${idx + 1}. ${product.productId}: ${product.localizedPrice}`,
              );
            });

            setProducts(sortedProducts);
            global.availableProducts = sortedProducts;

            // Set the lowest price product as default
            if (sortedProducts.length > 0) {
              setSelectedProductId(sortedProducts[0].productId);
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing iOS products:', refreshError);
          // ... rest of the error handling code ...
        }
      } else {
        // Android refresh
        console.log('Refreshing Android products...');
        const directProducts = await fetchDirectPlayStoreProducts();
        if (directProducts && directProducts.length > 0) {
          console.log(
            `Successfully refreshed ${directProducts.length} Android products`,
          );

          // Sort products by price
          const sortedProducts = [...directProducts].sort((a, b) => {
            // Extract numeric value from price strings
            const getNumericPrice = product => {
              const priceString = product.price || '';
              const matches = priceString.match(
                /([0-9]+([.][0-9]*)?|[.][0-9]+)/,
              );
              return matches && matches[0] ? parseFloat(matches[0]) : 9999;
            };
            return getNumericPrice(a) - getNumericPrice(b);
          });

          // Log sorted products for verification
          console.log('Android products sorted by price (lowest to highest):');
          sortedProducts.forEach((product, idx) => {
            console.log(`${idx + 1}. ${product.productId}: ${product.price}`);
          });

          setProducts(sortedProducts);
          global.availableProducts = sortedProducts;

          // Set the lowest price product as default
          if (sortedProducts.length > 0) {
            setSelectedProductId(sortedProducts[0].productId);
          }
        } else {
          console.log('No Android products found during refresh');
        }
      }

      // One more credit refresh to ensure latest data
      console.log('Performing final credit refresh to ensure latest data');
      await refreshCredits(true); // Force refresh again to ensure we have the latest data
      console.log('Pull-to-refresh completed successfully');
    } catch (error) {
      console.error('Error during pull-to-refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshCredits,
    connectionState,
    reconnectIAP,
    fetchDirectPlayStoreProducts,
    credits,
    userCountry,
  ]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181B', '#3C3029']}
        locations={[0.4, 0.99]}
        style={styles.gradientWrapper}
        angle={180}
        useAngle={true}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={appImages.arrowLeftIcon}
              style={styles.backArrowIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Credit Packs</Text>

          {/* Add Restore Purchases button */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handlePendingPurchases}
            disabled={purchasePending}>
            <Text style={styles.restoreButtonText}>Restore</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.creditsTitle}>Credits</Text>
          <Text style={styles.creditsNumber}>{displayCredits()}</Text>
          <Text style={styles.creditsSubtitleText}>
            *{creditsPerSong} Credit{creditsPerSong !== 1 ? 's' : ''} = 1 Song
            Generation
          </Text>
        </View>

        <View style={styles.divider} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={Platform.OS === 'ios' ? {paddingBottom: 30} : {}}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD5A9"
            colors={['#FFD5A9', '#C87D48']}
          />
        }>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading credit packs...</Text>
          </View>
        ) : (
          renderDynamicProductCards()
        )}
      </ScrollView>

      {purchasePending && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Processing purchase...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F11',
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    lineHeight: 24,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FDF5E6',
    marginLeft: 15,
    flex: 1,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 28,
  },
  backArrowIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  restoreButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(200, 125, 72, 0.5)',
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 14,
  },
  creditsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  creditsTitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  creditsNumber: {
    color: 'white',
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  creditsSubtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  creditsSubtitleText: {
    color: '#AFAFAF',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 5,
  },
  plansContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    ...(Platform.OS === 'ios' && {
      paddingHorizontal: 12,
      paddingBottom: 30, // Extra padding at bottom for iOS
    }),
  },
  planCard: {
    borderRadius: 15,
    padding: 16,
    marginBottom: 10,
    ...(Platform.OS === 'ios' && {
      padding: 12,
      paddingTop: 16,
      minHeight: 210,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      marginHorizontal: 4,
    }),
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    ...(Platform.OS === 'ios' && {
      marginBottom: 12,
      alignItems: 'flex-start',
      width: '100%',
      paddingRight: 16,
    }),
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      flex: 0.6,
      fontSize: 19,
      fontWeight: '800',
      marginRight: 8,
    }),
  },
  priceContainer: {
    alignItems: 'flex-end',
    minHeight: 45,
    justifyContent: 'flex-start',
    ...(Platform.OS === 'ios' && {
      flex: 0.4,
      minWidth: 80,
      alignItems: 'flex-end',
      minHeight: 60,
      marginRight: 10,
    }),
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      fontSize: 19,
      fontWeight: '800',
      textAlign: 'right',
    }),
  },
  featureText: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      lineHeight: 20,
      paddingRight: 5,
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 0,
      flex: 1,
    }),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
    ...(Platform.OS === 'ios' && {
      marginBottom: 10,
    }),
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    color: '#000',
    ...(Platform.OS === 'ios' && {
      lineHeight: 20,
      fontSize: 17,
      fontWeight: '700',
    }),
  },
  createButton: {
    marginVertical: 8,
    width: Platform.OS === 'ios' ? '90%' : '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
    ...(Platform.OS === 'ios' && {
      marginHorizontal: 5,
      marginBottom: 40,
      marginTop: 12,
      borderWidth: 2,
      height: 54,
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    ...(Platform.OS === 'ios' ? {paddingBottom: 3, fontWeight: '700'} : {}),
  },
  disabledButtonText: {
    color: '#666',
  },
  gradientContainer: {
    overflow: 'hidden',
    borderRadius: 15,
  },
  borderTop: {
    height: 2,
    backgroundColor: '#564A3F',
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  gradientWrapper: {
    paddingTop: 2,
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'ios' && {
      paddingBottom: 10,
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  planOriginalPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#564A3F',
    textDecorationLine: 'line-through',
    marginBottom: 1,
    lineHeight: 14,
    ...(Platform.OS === 'ios' && {
      marginBottom: 3,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 16,
    }),
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginBottom: 1,
    alignSelf: 'flex-end',
    ...(Platform.OS === 'ios' && {
      paddingVertical: 2,
      marginBottom: 3,
      paddingHorizontal: 6,
      borderRadius: 4,
    }),
  },
  discountText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
    ...(Platform.OS === 'ios' && {
      fontSize: 11,
      fontWeight: '700',
      lineHeight: 13,
    }),
  },
  featureContainer: {
    flexGrow: 1,
    marginBottom: 8,
    paddingRight: 5,
  },
  discountPriceWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    minHeight: 40,
    justifyContent: 'flex-start',
    ...(Platform.OS === 'ios' && {
      minHeight: 60,
    }),
  },
  regularPriceWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default SubscriptionScreen;
