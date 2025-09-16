import config from 'react-native-config';

const API_URL = config.API_BASE_URL;

/**
 * Fetch product configuration from backend
 * @returns {Promise<{oneTime: {ios: string[], android: string[]}, subscription: {ios: string[], android: string[]}, defaultPlan: {ios: string, android: string}}>}
 */
export const fetchProductConfig = async () => {
  try {
    const response = await fetch(`${API_URL}/v1/config/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product config: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'SUCCESS' && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to get product configuration');
    }
  } catch (error) {
    console.error('Error fetching product config:', error);

    // Return fallback product configuration if API fails
    return {
      oneTime: {
        ios: ['payment_101', 'payment_201', 'payment_301'],
        android: ['payment_100', 'payment_200', 'payment_300'],
      },
      subscription: {
        ios: ['subplan_1', 'subplan_2', 'subplan_3'],
        android: ['subplan_1', 'subplan_2', 'subplan_3'],
      },
      defaultPlan: {
        ios: 'payment_101',
        android: 'payment_100',
      },
    };
  }
};

/**
 * Get platform-specific product IDs
 * @param {string} platform - 'ios' or 'android'
 * @param {string} type - 'subscription' or 'oneTime' (default: 'subscription')
 * @returns {Promise<string[]>}
 */
export const getPlatformProductIds = async (
  platform = 'ios',
  type = 'subscription',
) => {
  try {
    const config = await fetchProductConfig();

    if (type === 'oneTime' && config.oneTime && config.oneTime[platform]) {
      return config.oneTime[platform];
    } else if (
      type === 'subscription' &&
      config.subscription &&
      config.subscription[platform]
    ) {
      return config.subscription[platform];
    }

    // Fallback to default values if config is not available
    if (type === 'oneTime') {
      return platform === 'ios'
        ? ['payment_101', 'payment_201', 'payment_301']
        : ['payment_100', 'payment_200', 'payment_300'];
    } else {
      return ['subplan_1', 'subplan_2', 'subplan_3'];
    }
  } catch (error) {
    console.error('Error getting platform product IDs:', error);

    // Fallback to default values
    if (type === 'oneTime') {
      return platform === 'ios'
        ? ['payment_101', 'payment_201', 'payment_301']
        : ['payment_100', 'payment_200', 'payment_300'];
    } else {
      return ['subplan_1', 'subplan_2', 'subplan_3'];
    }
  }
};

/**
 * Get default product ID for a specific platform
 * @param {string} platform - 'ios' or 'android'
 * @returns {Promise<string>}
 */
export const getDefaultProductId = async (platform = 'ios') => {
  try {
    const config = await fetchProductConfig();
    return (
      config.defaultPlan?.[platform] ||
      (platform === 'ios' ? 'payment_101' : 'payment_100')
    );
  } catch (error) {
    console.error('Error getting default product ID:', error);

    return platform === 'ios' ? 'payment_101' : 'payment_100';
  }
};

/**
 * Get one-time purchase product IDs for a specific platform
 * @param {string} platform - 'ios' or 'android'
 * @returns {Promise<string[]>}
 */
export const getOneTimeProductIds = async (platform = 'ios') => {
  return getPlatformProductIds(platform, 'oneTime');
};

/**
 * Get subscription product IDs for a specific platform
 * @param {string} platform - 'ios' or 'android'
 * @returns {Promise<string[]>}
 */
export const getSubscriptionProductIds = async (platform = 'ios') => {
  return getPlatformProductIds(platform, 'subscription');
};

/**
 * Get all product IDs (both one-time and subscription) for a specific platform
 * @param {string} platform - 'ios' or 'android'
 * @returns {Promise<{oneTime: string[], subscription: string[]}>}
 */
export const getAllProductIds = async (platform = 'ios') => {
  try {
    const [oneTimeIds, subscriptionIds] = await Promise.all([
      getOneTimeProductIds(platform),
      getSubscriptionProductIds(platform),
    ]);

    return {
      oneTime: oneTimeIds,
      subscription: subscriptionIds,
    };
  } catch (error) {
    console.error('Error getting all product IDs:', error);

    // Return fallback values
    return {
      oneTime:
        platform === 'ios'
          ? ['payment_101', 'payment_201', 'payment_301']
          : ['payment_100', 'payment_200', 'payment_300'],
      subscription: ['subplan_1', 'subplan_2', 'subplan_3'],
    };
  }
};

/**
 * Check if a product ID is a one-time purchase
 * @param {string} productId - Product ID to check
 * @param {string} platform - 'ios' or 'android'
 * @returns {Promise<boolean>}
 */
export const isOneTimeProduct = async (productId, platform = 'ios') => {
  try {
    const oneTimeIds = await getOneTimeProductIds(platform);
    return oneTimeIds.includes(productId);
  } catch (error) {
    console.error('Error checking if product is one-time:', error);
    return false;
  }
};

/**
 * Check if a product ID is a subscription
 * @param {string} productId - Product ID to check
 * @param {string} platform - 'ios' or 'android'
 * @returns {Promise<boolean>}
 */
export const isSubscriptionProduct = async (productId, platform = 'ios') => {
  try {
    const subscriptionIds = await getSubscriptionProductIds(platform);
    return subscriptionIds.includes(productId);
  } catch (error) {
    console.error('Error checking if product is subscription:', error);
    return false;
  }
};
