import {store} from '../stores';
import {updateToken} from '../stores/slices/auth';
import {getData} from './asyncStorage';
import fetcher from '../dataProvider';
import config from 'react-native-config';

// Flag to track if a token refresh is in progress
let isRefreshingToken = false;
// Queue of requests waiting for token refresh
let refreshQueue = [];

/**
 * Process the queue of waiting requests with the new token
 * @param {Error|null} error - Error if token refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  refreshQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

/**
 * Refresh the access token using refresh token
 * @returns {Promise<string>} New access token
 */
export const refreshAccessToken = async () => {
  try {
    // Get current state
    const state = store.getState();
    const refreshToken = state?.auth?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // If already refreshing, wait for it to complete
    if (isRefreshingToken) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve,
          reject,
        });
      });
    }

    // Set flag to avoid multiple refresh requests
    isRefreshingToken = true;

    // Call refresh token API
    const response = await fetcher.post(
      `${config.API_URL}/v2/auth/refresh-tokens`,
      {refreshToken},
      {},
      'raw', // Use raw instance to avoid auth interceptors
    );

    // Extract new tokens
    const access = response.data.access?.token;
    const refresh = response.data.refresh?.token;

    // Update Redux store with new tokens
    store.dispatch(updateToken({access, refresh}));

    // Process any waiting requests
    processQueue(null, access);

    return access;
  } catch (error) {
    // Handle refresh token failure
    console.error('Failed to refresh token:', error);

    // Clear tokens if refresh failed
    store.dispatch(updateToken({access: '', refresh: ''}));

    // Process queue with error
    processQueue(error);

    throw error;
  } finally {
    isRefreshingToken = false;
  }
};

/**
 * Get the current authorization token
 * @returns {Promise<string|null>} Current token or null if not available
 */
export const getAuthToken = async () => {
  // Try to get token from Redux store
  const state = store.getState();
  let token = state?.auth?.accessToken;

  // If not in Redux, try from AsyncStorage
  if (!token) {
    const authData = await getData('persist:auth');
    if (authData && authData.accessToken) {
      token = authData.accessToken?.replace(/^"|"$/g, '');
    }
  }

  return token;
};

/**
 * Make an authenticated API request with token refresh support
 * @param {Function} apiCall - Function that makes the actual API call
 * @returns {Promise<any>} API response
 */
export const makeAuthenticatedRequest = async apiCall => {
  try {
    // First attempt with current token
    return await apiCall();
  } catch (error) {
    // If error is 401 Unauthorized, try to refresh token
    if (error.response && error.response.status === 401) {
      try {
        // Refresh the token
        await refreshAccessToken();

        // Retry the API call with new token
        return await apiCall();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw refreshError;
      }
    }

    // If error is not 401 or refresh failed, throw the original error
    throw error;
  }
};
