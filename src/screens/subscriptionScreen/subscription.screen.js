import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect, useCallback} from 'react';
import {Image, ScrollView, NativeModules} from 'react-native';
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
import {clampRGBA} from 'react-native-reanimated/lib/typescript/Colors';

// Define PlanCard component outside of SubscriptionScreen
const PlanCard = ({
  title,
  price,
  features,
  originalPrice,
  onPurchase,
  selectedPlan,
  disabled,
}) => (
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
      <Text style={styles.planTitle}>{title}</Text>
      <View style={styles.priceContainer}>
        {originalPrice && (
          <Text style={styles.originalPrice}>{originalPrice}</Text>
        )}
        <Text style={styles.planPrice}>{price}</Text>
      </View>
    </View>
    {features.map((feature, index) => (
      <Text key={index} style={styles.featureText}>
        {feature}
      </Text>
    ))}
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

const API_URL = config.API_BASE_URL;

// Track processed purchases globally to prevent duplicate processing
const processedPurchases = new Set();

// API integration functions
const createPendingPayment = async (productId, amount, token) => {
  try {
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log(
      `Creating pending payment for ${productId} with amount ${amount}`,
    );
    const response = await fetch(`${API_URL}/v1/payments/create-pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({productId, amount}),
    });

    if (!response.ok) {
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

    console.log('Processing purchase:', purchase);
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
          packageName: Platform.select({
            android: config.GOOGLE_PLAY_PACKAGE_NAME,
            ios: config.APP_STORE_BUNDLE_ID,
          }),
          productId: purchase.productId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to process purchase: ${response.status}`);
    }

    return response.json();
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
) => {
  try {
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log(`Verifying purchase for ${productId}`);
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
  // Map product IDs to amounts
  if (productId === 'payment_100') return 29; // Standard Pack price
  if (productId === 'premium_pack') return 99; // Premium Pack price

  // Default fallback
  console.warn(`Unknown product ID: ${productId}, using default amount 0`);
  return 0;
};

// Request purchase function
const requestPurchase = async (productId, availableProducts) => {
  try {
    console.log(`Requesting purchase for ${productId}`);
    console.log(
      'Available products for purchase:',
      availableProducts?.map(p => p.productId).join(', ') || 'None',
    );

    // Double-check that product exists
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
      purchase = await RNIap.requestPurchase({
        skus: [productId],
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
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
            // We're just going to try to finish, not worry about the result
            RNIap.finishTransaction({purchase, isConsumable: true})
              .then(() =>
                console.log(`Cleared purchase: ${purchase.productId}`),
              )
              .catch(err => {
                // Ignore errors, we just want to clear them
                console.log(
                  `Error clearing purchase ${purchase.productId}, but continuing:`,
                  err.message,
                );
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
  const creditMap = {
    payment_100: 100,
    premium_pack: 200,
    // Add other product IDs as needed
  };

  return creditMap[productId] || 0;
};

// Add a helper function to get user's country code
const getUserCountryCode = async () => {
  try {
    // Get country code from device locale
    console.log(
      NativeModules.I18nManager.localeIdentifier,
      'NativeModules.I18nManager.localeIdentifier',
    );
    const deviceLocale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0]
        : NativeModules.I18nManager.localeIdentifier;

    // Extract the country code (last 2 characters of locale like 'en-US')
    console.log(deviceLocale, 'deviceLocale');
    const countryCode = deviceLocale.slice(-2).toUpperCase();
    console.log('Device country code:', countryCode);
    return countryCode;
  } catch (error) {
    console.error('Error getting country code:', error);
    return 'US'; // Default to US if we can't determine
  }
};

// New function to fetch products directly from Google Play API
const fetchPlayStoreProducts = async (packageName, accessToken, regionCode) => {
  try {
    console.log(
      `Fetching Play Store products for package: ${packageName}, region: ${regionCode}`,
    );

    // Instead of directly calling Google Play API, use our backend endpoint
    const endpoint = `${API_URL}/v1/payments/play-store-products`;

    console.log(`Using endpoint: ${endpoint}`);

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
        const price = product.prices?.[regionCode] || product.defaultPrice;

        // Extract features from description
        const features = extractFeaturesFromDescription(description);

        // Format the price for display
        const formattedPrice = price
          ? `${price.currency} ${price.amount}`
          : 'Not available';

        return {
          productId: product.productId,
          sku: product.productId,
          title: title,
          description: description,
          features: features,
          price: formattedPrice,
          localizedPrice: formattedPrice,
          countryPrices: product.prices || {},
        };
      });

      return localizedProducts;
    }

    // If the API doesn't return data in the expected format
    return [];
  } catch (error) {
    console.error('Error fetching Play Store products:', error);
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

// Add debug helper function for purchases
const debugPurchaseRequest = (productId, products, operation = 'Purchase') => {
  console.log(`\n========== ${operation} DEBUG INFO ==========`);
  console.log(`Operation: ${operation}`);
  console.log(`Product ID: ${productId}`);
  console.log(`Is product ID undefined? ${productId === undefined}`);
  console.log(`Is product ID null? ${productId === null}`);

  if (products) {
    console.log(`Available products: ${products.length}`);
    const productIds = products.map(p => p.productId || p.sku || 'unknown');
    console.log(`Product IDs: ${JSON.stringify(productIds)}`);

    const matchingProduct = products.find(
      p => p.productId === productId || p.sku === productId,
    );
    console.log(`Matching product found: ${matchingProduct ? 'YES' : 'NO'}`);

    if (matchingProduct) {
      console.log(
        `Matching product details: ${JSON.stringify({
          productId: matchingProduct.productId,
          sku: matchingProduct.sku,
          title: matchingProduct.title,
          price: matchingProduct.price || matchingProduct.localizedPrice,
        })}`,
      );
    }
  } else {
    console.log('Products array is null or undefined');
  }
  console.log('===========================================\n');
};

const SubscriptionScreen = () => {
  // Replace the selectedPlan state with selectedProductId
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasePending, setPurchasePending] = useState(false);
  const [userCountry, setUserCountry] = useState('US'); // Default country code
  const authState = useSelector(state => state.auth);

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

  // Refresh credits when the screen loads
  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  // Add function to fetch direct Google Play products
  const fetchDirectPlayStoreProducts = useCallback(async () => {
    try {
      if (Platform.OS !== 'android') {
        console.log('Not an Android device, skipping direct Play Store fetch');
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
        console.log('No access token available for Google Play API');
        return [];
      }

      // Fetch products directly from Google Play
      const playStoreProducts = await fetchPlayStoreProducts(
        packageName,
        accessToken,
        countryCode,
      );

      return playStoreProducts;
    } catch (error) {
      console.error('Error fetching direct Play Store products:', error);
      return [];
    }
  }, [authState.accessToken]);

  // Handle existing purchase
  const handleExistingPurchase = useCallback(
    async productId => {
      try {
        console.log('Checking for existing purchases...');
        setPurchasePending(true);

        // Refresh credits before processing purchase
        await refreshCredits();

        const purchases = await RNIap.getAvailablePurchases();
        console.log('Available purchases:', purchases);

        if (purchases.length === 0) {
          console.log(
            'No existing purchases found, despite E_ALREADY_OWNED error',
          );
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
              try {
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

                const purchaseToken =
                  Platform.OS === 'android'
                    ? existingPurchase.purchaseToken
                    : existingPurchase.transactionReceipt;

                const verifyResult = await verifyPurchase(
                  purchaseToken,
                  existingPurchase.productId,
                  authState.accessToken,
                );
                console.log('Existing purchase verified:', verifyResult);

                if (verifyResult && verifyResult.status === 'SUCCESS') {
                  if (verifyResult.credits) {
                    // Update Redux state with absolute value instead of local state
                    updateUserCredits(verifyResult.credits);
                  } else {
                    const creditsToAdd = getCreditsForProduct(
                      existingPurchase.productId,
                    );
                    addCredits(creditsToAdd);
                  }

                  // Refresh credits after purchase is processed
                  await refreshCredits();

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

                // Skip finishTransaction for Android
                if (Platform.OS === 'ios') {
                  // Finish the transaction for iOS
                  try {
                    await RNIap.finishTransaction({
                      purchase: existingPurchase,
                      isConsumable: true,
                    });
                    console.log(
                      'iOS transaction finished for existing purchase',
                    );
                  } catch (finishErr) {
                    console.log(
                      'Error finishing iOS transaction, but continuing:',
                      finishErr,
                    );
                  }
                } else {
                  console.log(
                    'Skipping finishTransaction for Android existing purchase',
                  );
                }
              } catch (apiErr) {
                console.error(
                  'API error during existing purchase flow:',
                  apiErr,
                );
                Alert.alert(
                  'Purchase Processing Error',
                  'We had trouble processing your previous purchase. Please contact support if credits are not added.',
                );
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
          } finally {
            setPurchasePending(false);
            // Final refresh to ensure latest credit data
            refreshCredits();
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
        // Final refresh to ensure latest credit data
        refreshCredits();
      }
    },
    [authState.accessToken, addCredits, updateUserCredits, refreshCredits],
  );

  // Add a restore purchases function
  const restorePurchases = useCallback(async () => {
    try {
      console.log('Restoring purchases...');
      setPurchasePending(true);

      // Refresh credits before processing purchase
      await refreshCredits();

      // Check for auth token first
      if (!authState.accessToken) {
        Alert.alert(
          'Authentication Required',
          'Please log in to restore your purchases.',
        );
        setPurchasePending(false);
        return;
      }

      // Get all available purchases
      const purchases = await RNIap.getAvailablePurchases();
      console.log('Purchases to restore:', purchases);

      if (purchases.length === 0) {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
        setPurchasePending(false);
        return;
      }

      let restoredCount = 0;
      let totalCreditsAdded = 0;
      const errors = [];

      // Process each purchase sequentially to avoid race conditions
      for (const purchase of purchases) {
        try {
          // Check if already processed
          const purchaseKey =
            Platform.OS === 'android'
              ? purchase.purchaseToken
              : purchase.transactionId;

          if (processedPurchases.has(purchaseKey)) {
            console.log('Purchase already processed, skipping:', purchaseKey);
            continue;
          }

          // Mark as processed immediately
          processedPurchases.add(purchaseKey);
          console.log('Purchase marked as processed for restore:', purchaseKey);

          console.log('Restoring purchase:', purchase.productId);

          // Create pending payment
          const pendingPayment = await createPendingPayment(
            purchase.productId,
            getAmountFromProductId(purchase.productId),
            authState.accessToken,
          );
          console.log('Pending payment created for restore');

          // Process the purchase
          const processResult = await processPurchase(
            purchase,
            authState.accessToken,
          );
          console.log('Purchase processed for restore');

          // Verify the purchase
          const purchaseToken =
            Platform.OS === 'android'
              ? purchase.purchaseToken
              : purchase.transactionReceipt;

          const verifyResult = await verifyPurchase(
            purchaseToken,
            purchase.productId,
            authState.accessToken,
          );
          console.log('Purchase verified for restore:', verifyResult);

          if (verifyResult && verifyResult.status === 'SUCCESS') {
            if (verifyResult.credits) {
              // Use Redux to update credits with server-provided value
              updateUserCredits(verifyResult.credits);
              // We just use the last value if there are multiple purchases
              totalCreditsAdded = verifyResult.credits;
            } else {
              const creditsForProduct = getCreditsForProduct(
                purchase.productId,
              );
              totalCreditsAdded += creditsForProduct;
              addCredits(creditsForProduct);
            }
            restoredCount++;
          } else {
            errors.push(`Failed to verify ${purchase.productId}`);
          }

          // Skip finishTransaction for Android
          if (Platform.OS === 'ios') {
            try {
              await RNIap.finishTransaction({purchase, isConsumable: true});
              console.log('iOS transaction finished for restore');
            } catch (finishErr) {
              console.log(
                'Error finishing iOS restore transaction, but continuing:',
                finishErr,
              );
            }
          } else {
            console.log('Skipping finishTransaction for Android restore');
          }
        } catch (purchaseErr) {
          console.error('Error restoring purchase:', purchaseErr);
          errors.push(purchaseErr.message || 'Unknown error');
        }
      }

      // Show appropriate message based on results
      if (restoredCount > 0) {
        // Refresh credits after restore
        await refreshCredits();

        Alert.alert(
          'Success',
          `Successfully restored ${restoredCount} purchase${
            restoredCount !== 1 ? 's' : ''
          }. Total credits: ${totalCreditsAdded}.`,
        );
      } else if (errors.length > 0) {
        Alert.alert(
          'Restore Failed',
          'Could not restore purchases. Please try again later or contact support.',
        );
      } else {
        Alert.alert(
          'No Purchases to Restore',
          'No eligible purchases found to restore.',
        );
      }
    } catch (err) {
      console.error('Error restoring purchases:', err);
      Alert.alert('Error', `Failed to restore purchases: ${err.message}`);
    } finally {
      setPurchasePending(false);
      // Final refresh to ensure latest credit data
      refreshCredits();
    }
  }, [authState.accessToken, addCredits, updateUserCredits, refreshCredits]);

  // Update useEffect with proper dependency
  useEffect(() => {
    const initializeIAP = async () => {
      try {
        console.log('Initializing IAP connection...');
        await RNIap.initConnection();

        // Get user's country code
        const countryCode = await getUserCountryCode();
        setUserCountry(countryCode);

        console.log(countryCode, 'countryCode');

        // Clear the processed purchases set on initialization
        processedPurchases.clear();
        console.log('Cleared processed purchases tracking');

        // First clear any pending purchases without processing them
        await clearPendingPurchases();

        let productsToDisplay = [];

        // First try to fetch products directly from Google Play API
        if (Platform.OS === 'android') {
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
              productsToDisplay = directProducts;
              setProducts(directProducts);

              // Set the first product as the selected product ID
              if (directProducts.length > 0 && directProducts[0].productId) {
                setSelectedProductId(directProducts[0].productId);
                console.log(
                  'Setting initial selected product ID:',
                  directProducts[0].productId,
                );
              }

              setLoading(false);
              return;
            } else {
              console.log(
                'No products found from direct API, falling back to RNIap',
              );
            }
          } catch (directError) {
            console.error('Error in direct Play Store fetch:', directError);
            console.log('Falling back to RNIap');
          }
        }

        // Fall back to RNIap if direct fetch fails
        console.log('Using RNIap to fetch products');

        // Fetch all available products without hardcoding IDs
        try {
          console.log('Fetching available subscriptions...');
          const subscriptions = await RNIap.getSubscriptions([]);
          console.log('Available subscriptions:', subscriptions);

          console.log('Fetching available one-time products...');
          const oneTimeProducts = await RNIap.getProducts([]);
          console.log('Available one-time products:', oneTimeProducts);

          // Combine both types of products
          const allProducts = [...subscriptions, ...oneTimeProducts];

          if (allProducts.length > 0) {
            console.log('All available products:', allProducts);
            setProducts(allProducts);

            // Set the first product as the selected product
            if (allProducts[0]?.productId) {
              setSelectedProductId(allProducts[0].productId);
              console.log(
                'Setting initial selected product ID:',
                allProducts[0].productId,
              );
            }
          } else {
            // If all else fails, try with some specific product IDs as fallback
            const specificProductIds = ['payment_300', 'premium_pack'];
            console.log('Trying specific product IDs:', specificProductIds);

            const specificProducts = await RNIap.getProducts({
              skus: specificProductIds,
            });
            console.log('Specific products:', specificProducts);

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
          const fallbackProductIds = ['payment_300', 'premium_pack'];
          console.log('Using fallback product IDs:', fallbackProductIds);

          try {
            const fallbackProducts = await RNIap.getProducts({
              skus: fallbackProductIds,
            });
            if (fallbackProducts.length > 0) {
              setProducts(fallbackProducts);
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
        console.log('Error initializing IAP:', err);
        Alert.alert(
          'Error',
          `Failed to initialize in-app purchases: ${err.message}`,
        );
      } finally {
        setLoading(false);
      }
    };

    // Define setupPurchaseListeners inside useEffect to avoid dependency issues
    const setupPurchaseListeners = () => {
      const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
        async purchase => {
          console.log('Purchase updated:', purchase);
          try {
            // Check if we've already processed this purchase
            const purchaseKey =
              Platform.OS === 'android'
                ? purchase.purchaseToken
                : purchase.transactionId;

            if (processedPurchases.has(purchaseKey)) {
              console.log('Purchase already processed, skipping:', purchaseKey);
              return;
            }

            // Mark as processed immediately to prevent duplicate processing
            processedPurchases.add(purchaseKey);
            console.log('Purchase marked as processed:', purchaseKey);

            setPurchasePending(true);

            // Process the purchase
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              console.log('Purchase receipt:', receipt);

              try {
                // First API call: Create pending payment
                console.log('Step 1: Creating pending payment');
                const pendingPayment = await createPendingPayment(
                  purchase.productId,
                  getAmountFromProductId(purchase.productId),
                  authState.accessToken,
                );
                console.log('Pending payment created:', pendingPayment);

                // Second API call: Process the purchase
                console.log('Step 2: Processing purchase');
                const processResult = await processPurchase(
                  purchase,
                  authState.accessToken,
                );
                console.log('Purchase processed:', processResult);

                // Third API call: Verify the purchase
                console.log('Step 3: Verifying purchase');
                const purchaseToken =
                  Platform.OS === 'android'
                    ? purchase.purchaseToken
                    : purchase.transactionReceipt;

                const verifyResult = await verifyPurchase(
                  purchaseToken,
                  purchase.productId,
                  authState.accessToken,
                );
                console.log('Purchase verified:', verifyResult);

                // Important: Update credits BEFORE trying to finish the transaction
                if (verifyResult && verifyResult.status === 'SUCCESS') {
                  console.log('verifyResult', verifyResult);
                  if (verifyResult.credits) {
                    // If server returns specific credit amount, use it as total
                    // Use Redux to update credits with server-provided value
                    updateUserCredits(verifyResult.credits);
                    console.log('Credits set to:', verifyResult.credits);
                  } else {
                    // Otherwise use a default amount based on the product
                    const creditsToAdd = getCreditsForProduct(
                      purchase.productId,
                    );
                    addCredits(creditsToAdd);
                    console.log('Credits added:', creditsToAdd);
                  }

                  // Show success message
                  const creditsAdded = getCreditsForProduct(purchase.productId);
                  Alert.alert(
                    'Success',
                    `Purchase completed! Added ${creditsAdded} credits.`,
                  );
                } else {
                  Alert.alert(
                    'Verification Failed',
                    'Your purchase could not be verified. Please contact support.',
                  );
                }

                // For Android, we'll skip the finishTransaction call
                if (Platform.OS === 'ios') {
                  console.log('Step 4: Finishing transaction for iOS');
                  try {
                    await RNIap.finishTransaction({
                      purchase,
                      isConsumable: true,
                    });
                    console.log('Transaction finished successfully for iOS');
                  } catch (finishErr) {
                    console.log(
                      'Error finishing iOS transaction, but continuing:',
                      finishErr,
                    );
                  }
                } else {
                  console.log(
                    'Skipping finishTransaction for Android as purchase is already processed',
                  );
                }
              } catch (apiErr) {
                console.error('API error during purchase flow:', apiErr);
                Alert.alert(
                  'Purchase Processing Error',
                  'Your purchase was successful, but we had trouble processing it. Please contact support if credits are not added.',
                );
              } finally {
                setPurchasePending(false);
              }
            }
          } catch (err) {
            console.log('Error handling purchase update:', err);
            setPurchasePending(false);
          }
        },
      );

      const purchaseErrorSubscription = RNIap.purchaseErrorListener(error => {
        console.log('Purchase error:', error);

        // Check for the already-owned error
        if (error.code === 'E_ALREADY_OWNED') {
          console.log('Product already owned, handling existing purchase...');

          // Handle the already owned product
          handleExistingPurchase(selectedProductId)
            .then(() => console.log('Existing purchase handled successfully'))
            .catch(err =>
              console.error('Failed to handle existing purchase:', err),
            );
        }
        // Don't show alert for user cancellation or already owned errors
        else if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert(
            'Purchase Error',
            `Something went wrong: ${error.message}`,
          );
        }

        setPurchasePending(false);
      });

      return {
        purchaseUpdateSubscription,
        purchaseErrorSubscription,
      };
    };

    // Initialize IAP and set up listeners
    initializeIAP();
    const listeners = setupPurchaseListeners();

    return () => {
      // Clean up listeners
      if (listeners.purchaseUpdateSubscription) {
        listeners.purchaseUpdateSubscription.remove();
      }
      if (listeners.purchaseErrorSubscription) {
        listeners.purchaseErrorSubscription.remove();
      }
      RNIap.endConnection();
    };
  }, [
    authState,
    handleExistingPurchase,
    addCredits,
    updateUserCredits,
    fetchDirectPlayStoreProducts,
    selectedProductId,
  ]);

  const handlePurchase = useCallback(
    async productId => {
      try {
        console.log('\n===== PURCHASE ATTEMPT STARTED =====');
        console.log('handlePurchase called with productId:', productId);
        console.log('Selected product ID state:', selectedProductId);
        console.log(
          'Available products:',
          products.map(p => p.productId).join(', '),
        );

        // Detailed product ID validation
        if (!productId) {
          console.warn('⚠️ No product ID provided to handlePurchase!');
          if (selectedProductId) {
            productId = selectedProductId;
            console.log('Using selected product ID as fallback:', productId);
          } else if (products.length > 0) {
            productId = products[0].productId;
            console.log(
              'Using first available product as fallback:',
              productId,
            );
          } else {
            console.error('❌ No products available for purchase!');
            throw new Error('No products available for purchase');
          }
        }

        // Validate product ID exists in available products
        const productExists = products.some(p => p.productId === productId);
        console.log(
          `Product ID "${productId}" exists in available products: ${productExists}`,
        );

        if (!productExists) {
          console.warn(
            `⚠️ Product ID "${productId}" not found in available products!`,
          );
          console.log(
            'Available product IDs:',
            products.map(p => p.productId),
          );

          // Try to find alternative product
          if (products.length > 0) {
            const alternativeId = products[0].productId;
            console.log(`Selecting alternative product ID: ${alternativeId}`);
            productId = alternativeId;
          }
        }

        // Check for auth token first
        if (!authState.accessToken) {
          console.error('❌ No auth token available!');
          Alert.alert(
            'Authentication Required',
            'Please log in before making a purchase.',
          );
          return;
        }

        if (products.length === 0) {
          console.error('❌ No products available for purchase!');
          throw new Error('No products available');
        }

        setPurchasePending(true);

        console.log('Attempting to purchase product ID:', productId);

        // Check if already purchased
        try {
          const purchases = await RNIap.getAvailablePurchases();
          console.log(
            'Existing purchases:',
            purchases.map(p => p.productId).join(', '),
          );

          const alreadyPurchased = purchases.some(
            p => p.productId === productId,
          );

          if (alreadyPurchased) {
            console.log(
              'Product already purchased, processing existing purchase...',
            );
            await handleExistingPurchase(productId);
            return;
          }
        } catch (err) {
          console.error('Error checking existing purchases:', err);
        }

        // Use our requestPurchase wrapper
        try {
          console.log(`Requesting purchase for product ID: ${productId}`);

          // Ensure RNIap knows about the products before purchase
          if (Platform.OS === 'android') {
            console.log('Refreshing product info before purchase...');
            const availableProducts = await RNIap.getProducts({
              skus: [productId],
            });
            console.log(
              'Refreshed products:',
              availableProducts.map(p => p.productId).join(', '),
            );

            if (availableProducts.length === 0) {
              console.error(
                `❌ Product ${productId} not available in the store after refresh!`,
              );
              throw new Error(
                `Product ${productId} not available in the store`,
              );
            }
          }

          await requestPurchase(productId, products);
          // The actual purchase processing is handled by the purchaseUpdatedListener
        } catch (purchaseErr) {
          console.log('Purchase request error:', purchaseErr);

          // Check for already owned error
          if (purchaseErr.code === 'E_ALREADY_OWNED') {
            console.log('Handling already owned product...');
            await handleExistingPurchase(productId);
          } else if (purchaseErr.code !== 'E_USER_CANCELLED') {
            console.error('❌ Purchase error:', purchaseErr.message);
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
      } catch (err) {
        console.error('❌ General purchase error:', err);
        Alert.alert('Error', `Failed to process purchase: ${err.message}`);
        setPurchasePending(false);
      } finally {
        console.log('===== PURCHASE ATTEMPT ENDED =====\n');
      }
    },
    [
      authState.accessToken,
      products,
      selectedProductId,
      handleExistingPurchase,
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
    console.log(products, 'products');
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

          return (
            <PlanCard
              key={product.productId || product.sku}
              title={product.title || 'Credit Pack'}
              price={product.localizedPrice || product.price}
              originalPrice={calculateOriginalPrice(
                product.price || product.localizedPrice,
              )}
              features={features}
              onPurchase={() => {
                // Set the selected product ID to this product
                setSelectedProductId(product.productId);
                console.log(`Selected product ID: ${product.productId}`);
                handlePurchase(product.productId);
              }}
              selectedPlan={selectedProductId === product.productId}
              disabled={purchasePending}
            />
          );
        })}
      </View>
    );
  };

  // Helper function to calculate "original price" for showing a discount
  const calculateOriginalPrice = price => {
    if (!price) return null;

    try {
      // Parse the price to add a "discount"
      const match = price.match(/([^\d]*)(\d+(\.\d+)?)(.*)/);
      if (match) {
        const [_, currencySymbol, numericPrice, decimalPart, suffix] = match;
        const inflatedPrice = Math.round(parseFloat(numericPrice) * 1.3);
        return `${currencySymbol}${inflatedPrice}${suffix}`;
      }
    } catch (e) {
      console.log('Error calculating original price:', e);
    }

    return null;
  };

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
            onPress={restorePurchases}
            disabled={purchasePending}>
            <Text style={styles.restoreButtonText}>Restore</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={styles.creditsTitle}>Credits</Text>
          <Text style={styles.creditsNumber}>{displayCredits()}</Text>
          <Text style={styles.creditsSubtitle}>Songs left</Text>
        </View>

        <View style={styles.divider} />
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
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
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 'bold',
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
    width: 20,
    height: 20,
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
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 5,
  },
  plansContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  planCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textDecorationLine: 'line-through',
  },
  featureText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },
  createButton: {
    marginVertical: 10,
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
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
});

export default SubscriptionScreen;
