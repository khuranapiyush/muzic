import RNIap, {
  purchaseErrorListener,
  purchaseUpdatedListener,
  ProductPurchase,
  PurchaseError,
} from 'react-native-iap';
import {Platform} from 'react-native';
import config from 'react-native-config';
import {API_URL} from '@env';

// Product IDs for different coin packages
export const PRODUCT_IDS = {
  COINS_100: 'coins_100',
  COINS_500: 'coins_500',
  COINS_1000: 'coins_1000',
};

// Subscription IDs
export const SUBSCRIPTION_IDS = {
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_YEARLY: 'premium_yearly',
};

// Initialize IAP
export const initializeIAP = async () => {
  try {
    const result = await RNIap.initConnection();
    console.log('IAP connection result:', result);
    return result;
  } catch (err) {
    console.error('Error initializing IAP:', err);
    throw err;
  }
};

// Get available products
export const getProducts = async productIds => {
  try {
    const products = await RNIap.getProducts(productIds);
    console.log('Available products:', products);
    return products;
  } catch (err) {
    console.error('Error getting products:', err);
    throw err;
  }
};

// Create pending payment
export const createPendingPayment = async (productId, amount) => {
  try {
    const response = await fetch(`${API_URL}/v1/payments/create-pending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        amount,
      }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error creating pending payment:', err);
    throw err;
  }
};

// Process purchase
export const processPurchase = async purchase => {
  try {
    const response = await fetch(
      `${API_URL}/v1/payments/google-payment-event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseToken: purchase.purchaseToken,
          orderId: purchase.orderId,
          packageName: Platform.select({
            android: config.GOOGLE_PLAY_PACKAGE_NAME,
            ios: config.APP_STORE_BUNDLE_ID,
          }),
          productId: purchase.productId,
        }),
      },
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error processing purchase:', err);
    throw err;
  }
};

// Verify purchase
export const verifyPurchase = async (
  purchaseToken,
  productId,
  isSubscription = false,
) => {
  try {
    const response = await fetch(`${API_URL}/v1/payments/verify-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error verifying purchase:', err);
    throw err;
  }
};

// Request purchase
export const requestPurchase = async productId => {
  try {
    const purchase = await RNIap.requestPurchase(productId);
    return purchase;
  } catch (err) {
    console.error('Error requesting purchase:', err);
    throw err;
  }
};

// Request subscription
export const requestSubscription = async productId => {
  try {
    const purchase = await RNIap.requestSubscription(productId);
    return purchase;
  } catch (err) {
    console.error('Error requesting subscription:', err);
    throw err;
  }
};

// Get available purchases
export const getAvailablePurchases = async () => {
  try {
    const purchases = await RNIap.getAvailablePurchases();
    return purchases;
  } catch (err) {
    console.error('Error getting available purchases:', err);
    throw err;
  }
};

// End IAP connection
export const endIAPConnection = async () => {
  try {
    await RNIap.endConnection();
  } catch (err) {
    console.error('Error ending IAP connection:', err);
    throw err;
  }
};

// Setup purchase listeners
export const setupPurchaseListeners = (onPurchaseUpdate, onPurchaseError) => {
  const purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
    try {
      // Create pending payment
      const pendingPayment = await createPendingPayment(
        purchase.productId,
        getAmountFromProductId(purchase.productId),
      );

      // Process the purchase
      const result = await processPurchase(purchase);

      // Call the update callback
      onPurchaseUpdate(result);
    } catch (err) {
      console.error('Error in purchase update listener:', err);
      onPurchaseError(err);
    }
  });

  const purchaseErrorSubscription = purchaseErrorListener(error => {
    console.error('Purchase error:', error);
    onPurchaseError(error);
  });

  return () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
  };
};

// Helper function to get amount from product ID
const getAmountFromProductId = productId => {
  if (productId.includes('coins_100')) return 100;
  if (productId.includes('coins_500')) return 500;
  if (productId.includes('coins_1000')) return 1000;

  // Extract amount from productId if it follows a pattern like "coins_XX"
  const match = productId.match(/coins_(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  throw new Error(`Invalid product ID: ${productId}`);
};
