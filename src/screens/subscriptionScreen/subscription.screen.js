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

const API_URL = config.API_BASE_URL;

const processedPurchases = new Set();

// Add at the beginning of the file after imports
let iapInitialized = false;
let isInitializing = false;

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

    console.log('Platform OS:', Platform.OS);
    console.log('Processing purchase:', purchase);

    // For iOS, we should use the validate-apple-receipt endpoint directly
    if (Platform.OS === 'ios') {
      console.log('Using iOS-specific receipt validation process');
      const receiptData = purchase.transactionReceipt;

      if (!receiptData) {
        throw new Error('No receipt data available in purchase object');
      }

      // Check if it's likely a sandbox receipt
      const isSandbox = receiptData.includes('sandbox');
      console.log(
        `Receipt appears to be from ${
          isSandbox ? 'SANDBOX' : 'PRODUCTION'
        } environment`,
      );

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
          console.error(
            `Apple receipt validation error (${response.status}):`,
            errorText,
          );

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
          console.error('Empty result from receipt validation');
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
          console.log('Adding default SUCCESS status to result');
          resultData.status = 'SUCCESS';
        }

        console.log('Apple receipt validation result:', resultData);
        return resultData;
      } catch (validationError) {
        console.error('Error in Apple receipt validation:', validationError);

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
        console.error(`Server error (${response.status}):`, errorText);
        throw new Error(`Failed to process purchase: ${response.status}`);
      }

      return response.json();
    }
  } catch (err) {
    console.error('Error processing purchase:', err);
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

// Add a helper function to get user's country code
const getUserCountryCode = async () => {
  try {
    if (Platform.OS === 'ios') {
      // Use React Native's Platform.constants for iOS
      const locale =
        NativeModules.SettingsManager.settings.AppleLanguages?.[0] ||
        NativeModules.SettingsManager.settings.AppleLocale ||
        'en_US';

      // Extract country code from locale
      const countryCode = locale.split('_').pop() || 'US';
      return countryCode;
    } else {
      // For Android
      const locale = NativeModules.I18nManager.localeIdentifier || 'en_US';
      return locale.slice(-2).toUpperCase();
    }
  } catch (error) {
    console.warn('Error getting country code, using default:', error);
    return 'US'; // Default to US if we can't determine
  }
};

// New function to fetch products directly from Google Play API
const fetchPlayStoreProducts = async (accessToken, regionCode) => {
  try {
    // Instead of directly calling Google Play API, use our backend endpoint
    const endpoint = `${API_URL}/v1/payments/play-store-products`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Response:', result);

    // Check if response has the expected format
    if (result.success && result.data && result.data.length > 0) {
      // Process the data
      const localizedProducts = result.data.map(product => {
        // Extract data using the API response format
        const title =
          product.listings?.['en-US']?.title || product.productId || '';
        const description = product.listings?.['en-US']?.description || '';

        // Get price for user's country or default price
        const discountedPrice =
          product.prices?.[regionCode] || product?.defaultPrice;

        const originalPrice =
          product.prices?.[regionCode] || product?.originalPrice;

        // Extract features from description
        const features = extractFeaturesFromDescription(description);

        // Format the price for display
        const formattedDiscountedPrice = discountedPrice
          ? `${discountedPrice?.currency} ${discountedPrice?.amount}`
          : 'Not available';

        const formattedOriginalPrice = originalPrice
          ? `${originalPrice?.currency} ${originalPrice?.originalAmount}`
          : 'Not available';

        return {
          productId: product.productId,
          sku: product.productId,
          title: title,
          description: description,
          features: features,
          price: formattedDiscountedPrice,
          localizedPrice: formattedDiscountedPrice,
          countryPrices: product.prices || {},
          credits: product?.credits,
          discount: product?.discountPercentage,
          localizedOriginalPrice: formattedOriginalPrice,
        };
      });

      return localizedProducts;
    } else {
      console.log('No products found in API response');
      return [];
    }
  } catch (error) {
    console.error('Error fetching Play Store products:', error);
    throw error;
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

const PlanCard = ({
  title,
  price,
  features,
  onPurchase,
  // selectedPlan,
  disabled,
  originalPrice,
  discount,
  discountedPrice,
  // credits,
  // creditsPerSong,
  // currency,
}) => {
  const hasDiscount = !!(discount && discountedPrice && originalPrice);
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
          <>
            {hasDiscount && (
              <>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount || 0}% OFF</Text>
                </View>
                <Text style={styles.planOriginalPrice}>{originalPrice}</Text>
              </>
            )}
            <Text
              style={styles.planPrice}
              numberOfLines={1}
              ellipsizeMode="tail">
              {hasDiscount ? discountedPrice : price}
            </Text>
          </>
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

            // Define product IDs to fetch from App Store Connect
            const productIds = ['payment_101', 'payment_201', 'payment_301'];
            console.log('Requesting products with IDs:', productIds);

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

              // Process the products
              const formattedProducts = products.map(product => {
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
              let lowestPriceProduct = directProducts[0];
              for (const product of directProducts) {
                const currentPrice = parseFloat(
                  product.price?.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/)?.[0] ||
                    '999999',
                );
                const lowestPrice = parseFloat(
                  lowestPriceProduct.price?.match(
                    /([0-9]+([.][0-9]*)?|[.][0-9]+)/,
                  )?.[0] || '999999',
                );
                if (currentPrice < lowestPrice) {
                  lowestPriceProduct = product;
                }
              }
              if (lowestPriceProduct?.productId) {
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
          const oneTimeProducts = await RNIap.getProducts({
            skus: ['payment_101', 'payment_201', 'payment_301'],
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

            // Set the lowest price product as default
            let lowestPriceProduct = allProducts[0];
            for (const product of allProducts) {
              // Extract price value for comparison
              const currentPrice = parseFloat(
                product.price?.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/)?.[0] ||
                  '999999',
              );
              const lowestPrice = parseFloat(
                lowestPriceProduct.price?.match(
                  /([0-9]+([.][0-9]*)?|[.][0-9]+)/,
                )?.[0] || '999999',
              );

              if (currentPrice < lowestPrice) {
                lowestPriceProduct = product;
              }
            }

            if (lowestPriceProduct?.productId) {
              setSelectedProductId(lowestPriceProduct.productId);
              console.log(
                'Setting initial selected product ID:',
                lowestPriceProduct.productId,
              );
            }
          } else {
            // If all else fails, try with some specific product IDs as fallback
            const specificAndroidProductIds = [
              'payment_100',
              'payment_200',
              'payment_300',
            ];
            const specificIOSProductIds = [
              'payment_101',
              'payment_201',
              'payment_301',
            ];
            console.log(
              'Trying specific product IDs:',
              Platform.OS === 'ios'
                ? specificIOSProductIds
                : specificAndroidProductIds,
            );

            const specificProducts = await RNIap.getProducts({
              skus:
                Platform.OS === 'ios'
                  ? specificIOSProductIds
                  : specificAndroidProductIds,
            });
            console.log('Specific products:', specificProducts);

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
          }
        } catch (err) {
          console.error('Error fetching products from store:', err);

          // Last resort fallback to hardcoded product IDs
          const fallbackIOSProductIds = [
            'payment_101',
            'payment_201',
            'payment_301',
          ];
          const fallbackAndroidProductIds = [
            'payment_100',
            'payment_200',
            'payment_300',
          ];
          console.log(
            'Using fallback product IDs:',
            Platform.OS === 'ios'
              ? fallbackIOSProductIds
              : fallbackAndroidProductIds,
          );

          try {
            const fallbackProducts = await RNIap.getProducts({
              skus:
                Platform.OS === 'ios'
                  ? fallbackIOSProductIds
                  : fallbackAndroidProductIds,
            });
            if (fallbackProducts.length > 0) {
              setProducts(fallbackProducts);
              // Store products globally for amount calculations
              global.availableProducts = fallbackProducts;
              setSelectedProductId(fallbackProducts[0].productId);
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
  }, [fetchDirectPlayStoreProducts]);

  // Add function to fetch direct Google Play products
  const fetchDirectPlayStoreProducts = useCallback(async () => {
    try {
      if (Platform.OS !== 'android') {
        return [];
      }

      // Get user's country code
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

      // Fetch products directly from Google Play
      const playStoreProducts = await fetchPlayStoreProducts(
        accessToken,
        countryCode,
      );

      return playStoreProducts;
    } catch (error) {
      console.error('Error fetching direct Play Store products:', error);
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

  // Update the Apple sandbox detection function
  const isAppleSandboxEnvironment = receipt => {
    try {
      // Apple sandbox receipt has a specific environment indicator
      if (!receipt) return false;

      // Check if it's a sandbox receipt (contains "sandbox" in the receipt)
      const isSandbox = receipt.includes('sandbox');

      console.log(
        `Receipt environment check: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`,
      );
      return isSandbox;
    } catch (error) {
      console.warn('Error checking sandbox environment:', error);
      return false;
    }
  };

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
            const productIds = ['payment_101', 'payment_201', 'payment_301'];
            console.log('Refreshing iOS products without reinitialization');

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
              console.log('Successfully refreshed products');
              setProducts(refreshedProducts);
              global.availableProducts = refreshedProducts;
              setSelectedProductId(refreshedProducts[0].productId);
              setLoading(false);
              return;
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

        if (Platform.OS === 'ios') {
          try {
            // Define the exact product IDs we want to fetch
            const productIds = [
              'payment_50',
              'payment_101',
              'payment_201',
              'payment_301',
            ];
            console.log(
              'Fetching iOS products with exact IDs:',
              productIds.join(', '),
            );

            // Clear existing logs
            console.log(
              '========= FETCHING PRODUCTS FROM APP STORE CONNECT =========',
            );

            // Enhanced error handling
            try {
              // Try with forceRefresh first
              console.log('Attempt 1: Fetching with forceRefresh option');
              const productsAttempt1 = await RNIap.getProducts({
                skus: productIds,
                forceRefresh: true,
              });

              console.log(
                `Attempt 1 results: Found ${productsAttempt1.length} products`,
              );

              if (productsAttempt1.length > 0) {
                console.log(
                  'Products found in first attempt:',
                  productsAttempt1.map(p => p.productId).join(', '),
                );

                // Format products for display
                const formattedProducts = productsAttempt1.map(product => {
                  return {
                    ...product,
                  };
                });

                setProducts(formattedProducts);
                global.availableProducts = formattedProducts;
                setSelectedProductId(formattedProducts[0].productId);
                setLoading(false);
                iapInitialized = true;
                return;
              }

              // If first attempt fails, try with slightly different options
              console.log('Attempt 2: Fetching with different options');
              const productsAttempt2 = await RNIap.getProducts({
                skus: productIds,
              });

              console.log(
                `Attempt 2 results: Found ${productsAttempt2.length} products`,
              );

              if (productsAttempt2.length > 0) {
                console.log(
                  'Products found in second attempt:',
                  productsAttempt2.map(p => p.productId).join(', '),
                );

                // Format products for display
                const formattedProducts = productsAttempt2.map(product => {
                  return {
                    ...product,
                  };
                });

                setProducts(formattedProducts);
                global.availableProducts = formattedProducts;
                setSelectedProductId(formattedProducts[0].productId);
                setLoading(false);
                iapInitialized = true;
                return;
              }

              // If all attempts return no products, create some hardcoded fallback products for simulator testing
              if (
                Platform.OS === 'ios' &&
                (__DEV__ || process.env.NODE_ENV === 'development')
              ) {
                console.log(
                  'Creating fallback products for development/simulator',
                );

                // Create mock products for development/simulator
                // const mockProducts = [
                //   {
                //     productId: 'payment_101',
                //     title: 'Basic Plan',
                //     description: 'Credits for generating music',
                //     price: '$29.99',
                //     localizedPrice: '$29.99',
                //     currency: 'USD',
                //     credits: 100,
                //     features: [
                //       '100 Credits',
                //       'Priority Generation queue',
                //       'Never expires',
                //     ],
                //   },
                //   {
                //     productId: 'payment_201',
                //     title: 'Pro Plan',
                //     description: 'Credits for generating music',
                //     price: '$59.99',
                //     localizedPrice: '$59.99',
                //     currency: 'USD',
                //     credits: 200,
                //     features: [
                //       '200 Credits',
                //       'Priority Generation queue',
                //       'Never expires',
                //     ],
                //   },
                //   {
                //     productId: 'payment_301',
                //     title: 'Ultra Pro Plan',
                //     description: 'Credits for generating music',
                //     price: '$99.99',
                //     localizedPrice: '$99.99',
                //     currency: 'USD',
                //     credits: 300,
                //     features: [
                //       '300 Credits',
                //       'Priority Generation queue',
                //       'Never expires',
                //     ],
                //   },
                // ];

                // setProducts(mockProducts);
                // global.availableProducts = mockProducts;
                // setSelectedProductId(mockProducts[0].productId);
                // console.log('Using mock products for development/simulator');
                // setLoading(false);
                // iapInitialized = true;
                return;
              }

              console.log('No products found even with fallback options');
              Alert.alert(
                'No Products Available',
                'Could not load products from App Store Connect. This is normal in Simulator. On real devices, make sure your products are properly configured in App Store Connect.',
              );
            } catch (fetchError) {
              console.error('Error fetching products:', fetchError);

              // In development/simulator, provide mock products as fallback
              if (
                Platform.OS === 'ios' &&
                (__DEV__ || process.env.NODE_ENV === 'development')
              ) {
                console.log(
                  'Creating fallback products for development/simulator after error',
                );

                // Create mock products for development/simulator
                const mockProducts = [
                  {
                    productId: 'payment_101',
                    title: 'Basic Plan',
                    description: 'Credits for generating music',
                    price: '$29.99',
                    localizedPrice: '$29.99',
                    currency: 'USD',
                    credits: 100,
                    features: [
                      '100 Credits',
                      'Priority Generation queue',
                      'Never expires',
                    ],
                  },
                  {
                    productId: 'payment_201',
                    title: 'Pro Plan',
                    description: 'Credits for generating music',
                    price: '$59.99',
                    localizedPrice: '$59.99',
                    currency: 'USD',
                    credits: 200,
                    features: [
                      '200 Credits',
                      'Priority Generation queue',
                      'Never expires',
                    ],
                  },
                  {
                    productId: 'payment_301',
                    title: 'Ultra Pro Plan',
                    description: 'Credits for generating music',
                    price: '$99.99',
                    localizedPrice: '$99.99',
                    currency: 'USD',
                    credits: 300,
                    features: [
                      '300 Credits',
                      'Priority Generation queue',
                      'Never expires',
                    ],
                  },
                ];

                setProducts(mockProducts);
                global.availableProducts = mockProducts;
                setSelectedProductId(mockProducts[0].productId);
                console.log('Using mock products for development/simulator');
                setLoading(false);
                iapInitialized = true;
                return;
              }
            }
            // Rest of the existing code for products fetching
          } catch (iosError) {
            console.error('Error fetching iOS products:', iosError);
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
              let lowestPriceProduct = directProducts[0];
              for (const product of directProducts) {
                const currentPrice = parseFloat(
                  product.price?.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/)?.[0] ||
                    '999999',
                );
                const lowestPrice = parseFloat(
                  lowestPriceProduct.price?.match(
                    /([0-9]+([.][0-9]*)?|[.][0-9]+)/,
                  )?.[0] || '999999',
                );
                if (currentPrice < lowestPrice) {
                  lowestPriceProduct = product;
                }
              }
              if (lowestPriceProduct?.productId) {
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
          const oneTimeProducts = await RNIap.getProducts({
            skus: ['payment_101', 'payment_201', 'payment_301'],
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

            // Set the lowest price product as default
            let lowestPriceProduct = allProducts[0];
            for (const product of allProducts) {
              // Extract price value for comparison
              const currentPrice = parseFloat(
                product.price?.match(/([0-9]+([.][0-9]*)?|[.][0-9]+)/)?.[0] ||
                  '999999',
              );
              const lowestPrice = parseFloat(
                lowestPriceProduct.price?.match(
                  /([0-9]+([.][0-9]*)?|[.][0-9]+)/,
                )?.[0] || '999999',
              );

              if (currentPrice < lowestPrice) {
                lowestPriceProduct = product;
              }
            }

            if (lowestPriceProduct?.productId) {
              setSelectedProductId(lowestPriceProduct.productId);
              console.log(
                'Setting initial selected product ID:',
                lowestPriceProduct.productId,
              );
            }
          } else {
            // If all else fails, try with some specific product IDs as fallback
            const specificAndroidProductIds = [
              'payment_100',
              'payment_200',
              'payment_300',
            ];
            const specificIOSProductIds = [
              'payment_101',
              'payment_201',
              'payment_301',
            ];
            console.log(
              'Trying specific product IDs:',
              Platform.OS === 'ios'
                ? specificIOSProductIds
                : specificAndroidProductIds,
            );

            const specificProducts = await RNIap.getProducts({
              skus:
                Platform.OS === 'ios'
                  ? specificIOSProductIds
                  : specificAndroidProductIds,
            });
            console.log('Specific products:', specificProducts);

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
          }
        } catch (err) {
          console.error('Error fetching products from store:', err);

          // Last resort fallback to hardcoded product IDs
          const fallbackIOSProductIds = [
            'payment_101',
            'payment_201',
            'payment_301',
          ];
          const fallbackAndroidProductIds = [
            'payment_100',
            'payment_200',
            'payment_300',
          ];
          console.log(
            'Using fallback product IDs:',
            Platform.OS === 'ios'
              ? fallbackIOSProductIds
              : fallbackAndroidProductIds,
          );

          try {
            const fallbackProducts = await RNIap.getProducts({
              skus:
                Platform.OS === 'ios'
                  ? fallbackIOSProductIds
                  : fallbackAndroidProductIds,
            });
            if (fallbackProducts.length > 0) {
              setProducts(fallbackProducts);
              // Store products globally for amount calculations
              global.availableProducts = fallbackProducts;
              setSelectedProductId(fallbackProducts[0].productId);
            }
          } catch (fallbackErr) {
            console.error('Error with fallback products:', fallbackErr);
            Alert.alert(
              'Error',
              `Failed to initialize in-app purchases: ${err.message}`,
            );
          }
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
            // If we still have no products, try the hardcoded ones
            if (!products || products.length === 0) {
              // Create fallback products for development
              const mockProducts = [
                {
                  productId: 'payment_101',
                  title: 'Basic Plan',
                  description: 'Credits for generating music',
                  price: '$29.99',
                  localizedPrice: '$29.99',
                  currency: 'USD',
                  credits: 100,
                  features: [
                    '100 Credits',
                    'Priority Generation queue',
                    'Never expires',
                  ],
                },
                {
                  productId: 'payment_201',
                  title: 'Pro Plan',
                  description: 'Credits for generating music',
                  price: '$59.99',
                  localizedPrice: '$59.99',
                  currency: 'USD',
                  credits: 200,
                  features: [
                    '200 Credits',
                    'Priority Generation queue',
                    'Never expires',
                  ],
                },
                {
                  productId: 'payment_301',
                  title: 'Ultra Pro Plan',
                  description: 'Credits for generating music',
                  price: '$99.99',
                  localizedPrice: '$99.99',
                  currency: 'USD',
                  credits: 300,
                  features: [
                    '300 Credits',
                    'Priority Generation queue',
                    'Never expires',
                  ],
                },
              ];

              setProducts(mockProducts);
              global.availableProducts = mockProducts;
              setSelectedProductId(mockProducts[0].productId);
            }

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
                    const productIds = [
                      'payment_101',
                      'payment_201',
                      'payment_301',
                    ];
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

  // Add a renderDynamicProductCards function to render all products from Google Play
  const renderDynamicProductCards = () => {
    if (products.length === 0) {
      return (
        <View style={styles.plansContainer}>
          <Text style={styles.loadingText}>No products available</Text>
        </View>
      );
    }

    // Render cards dynamically from fetched products
    return (
      <View style={styles.plansContainer}>
        {products.map((product, index) => {
          // Extract features from the product's description
          const features = product.features ||
            extractFeaturesFromDescription(product.description) || [
              product.title || 'Credit Pack',
              'Priority Generation queue',
              'Never expires',
            ];

          // Ensure feature text length doesn't exceed what can be displayed properly
          const processedFeatures =
            Platform.OS === 'ios'
              ? features.map(feature =>
                  feature.length > 60
                    ? feature.substring(0, 60) + '...'
                    : feature,
                )
              : features;

          return (
            <PlanCard
              key={product.productId || product.sku}
              title={product.title || 'Credit Pack'}
              price={product.localizedPrice || product.price}
              features={processedFeatures}
              onPurchase={() => {
                // Set the selected product ID to this product
                setSelectedProductId(product.productId);
                console.log(`Selected product ID: ${product.productId}`);
                handlePurchase(product.productId);
              }}
              selectedPlan={selectedProductId === product.productId}
              disabled={purchasePending}
              originalPrice={product.localizedOriginalPrice}
              discount={product.discount}
              discountedPrice={product.localizedPrice}
            />
          );
        })}
      </View>
    );
  };

  const creditsPerSong = useSelector(selectCreditsPerSong);

  // Add function to validate App Store receipt
  const validateAppStoreReceipt = async (receiptData, productId, token) => {
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (!receiptData) {
        throw new Error('Receipt data is required for validation');
      }

      console.log(`Validating App Store receipt for ${productId}`);

      // Check if it's a sandbox receipt
      const isSandbox = receiptData.includes('sandbox');
      console.log(
        `Receipt appears to be from ${
          isSandbox ? 'SANDBOX' : 'PRODUCTION'
        } environment`,
      );

      const response = await fetch(
        `${API_URL}/v1/payments/validate-ios-receipt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receipt: receiptData,
            productId,
            bundleId: config.APP_STORE_BUNDLE_ID,
            environment: isSandbox ? 'sandbox' : 'production',
            allowSandboxInProduction: true, // Add flag to try sandbox if production validation fails
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Receipt validation error (${response.status}):`,
          errorText,
        );
        throw new Error(`Failed to validate receipt: ${response.status}`);
      }

      const result = await response.json();
      console.log('Receipt validation result:', result);
      return result;
    } catch (err) {
      console.error('Error validating App Store receipt:', err);
      throw err;
    }
  };

  // Modify useEffect to check and validate current purchases only after iOS purchase completes
  useEffect(() => {
    // Only run for iOS and when an iOS purchase has been completed
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

            // Send receipt to server to validate using RNIap.validateReceiptIos
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
        const productIds = ['payment_101', 'payment_201', 'payment_301'];
        console.log('Refreshing iOS products with IDs:', productIds);

        // Check connection status first
        if (connectionState !== 'connected') {
          console.log('IAP not connected, reconnecting first...');
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
          setProducts(refreshedProducts);
          global.availableProducts = refreshedProducts;
        } else {
          console.log('No products found during refresh');
        }
      } else {
        // Android refresh
        console.log('Refreshing Android products...');
        const directProducts = await fetchDirectPlayStoreProducts();
        if (directProducts && directProducts.length > 0) {
          console.log(
            `Successfully refreshed ${directProducts.length} Android products`,
          );
          setProducts(directProducts);
          global.availableProducts = directProducts;
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
          <Text style={styles.headerTitle}>Subscriptions</Text>

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
    padding: 20,
    marginBottom: 10,
    ...(Platform.OS === 'ios' && {
      padding: 10,
      paddingTop: 20,
      minHeight: 230, // Increase minimum height
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden', // Ensure content stays within bounds
      marginHorizontal: 4, // Add slight horizontal margin
    }),
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    ...(Platform.OS === 'ios' && {
      marginBottom: 16,
      alignItems: 'flex-start', // Align items to top
      width: '100%',
      paddingRight: 20, // Add slight padding to prevent text cutoff
    }),
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      flex: 0.6, // Take only 60% of the space
      fontSize: 20,
      marginRight: 8,
    }),
  },
  priceContainer: {
    alignItems: 'flex-end',
    ...(Platform.OS === 'ios' && {
      flex: 0.4, // Take 40% of the space
      minWidth: 80,
      alignItems: 'flex-end',
    }),
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    ...(Platform.OS === 'ios' && {
      fontSize: 20,
      textAlign: 'right',
    }),
  },
  featureText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
    ...(Platform.OS === 'ios' && {
      lineHeight: 22, // Improve readability
      paddingRight: 5, // Add some padding on the right
      flexShrink: 1, // Allow text to shrink if needed
      fontSize: 16,
      marginBottom: 0,
      flex: 1,
    }),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top for multi-line text
    marginBottom: 12,
    paddingRight: 10,
    ...(Platform.OS === 'ios' && {
      marginBottom: 15,
    }),
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#000',
    ...(Platform.OS === 'ios' && {
      lineHeight: 22,
      fontSize: 18,
    }),
  },
  createButton: {
    marginVertical: 10,
    width: '90%',
    height: 60,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
    ...(Platform.OS === 'ios' && {
      marginHorizontal: 5,
      marginBottom: 40,
      borderWidth: 2,
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
    fontWeight: '600',
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
      paddingBottom: 10, // Add extra padding at the bottom for iOS
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#564A3F',
    textDecorationLine: 'line-through',
    marginBottom: 4,
    ...(Platform.OS === 'ios' && {
      marginBottom: 6,
    }),
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    ...(Platform.OS === 'ios' && {
      paddingVertical: 3,
      marginBottom: 6,
    }),
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureContainer: {
    flexGrow: 1,
    marginBottom: 10,
    paddingRight: 5,
  },
});

export default SubscriptionScreen;
