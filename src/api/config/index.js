import config from 'react-native-config';

const API_URL = config.API_BASE_URL;

/**
 * Fetch product IDs from backend configuration
 * @returns {Promise<{ios: string[], android: string[], defaultPlan: {ios: string, android: string}}>}
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

    // Return fallback product IDs if API fails
    return {
      ios: ['payment_101', 'payment_201', 'payment_301'],
      android: ['payment_100', 'payment_200', 'payment_300'],
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
 * @returns {Promise<string[]>}
 */
export const getPlatformProductIds = async (platform = 'ios') => {
  try {
    const config = await fetchProductConfig();
    console.log(config, 'config');
    return config[platform] || [];
  } catch (error) {
    console.error('Error getting platform product IDs:', error);

    if (platform === 'ios') {
      return ['payment_101', 'payment_201', 'payment_301'];
    } else {
      return ['payment_100', 'payment_200', 'payment_300'];
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
    console.log(config, 'config for default product');
    return (
      config.defaultPlan?.[platform] ||
      (platform === 'ios' ? 'payment_101' : 'payment_100')
    );
  } catch (error) {
    console.error('Error getting default product ID:', error);

    return platform === 'ios' ? 'payment_101' : 'payment_100';
  }
};
