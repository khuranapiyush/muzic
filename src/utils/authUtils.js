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
 * Decode base64 string (replacement for atob in React Native)
 * @param {string} input - Base64 string to decode
 * @returns {string} Decoded string
 */
const base64Decode = input => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error(
      "'atob' failed: The string to be decoded is not correctly encoded.",
    );
  }

  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
};

/**
 * Check if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @param {number} bufferSeconds - Buffer time in seconds before actual expiration
 * @returns {boolean} True if token is expired or will expire within buffer time
 */
export const isTokenExpired = (token, bufferSeconds = 60) => {
  if (!token) return true;

  try {
    // Decode the token to get expiration time
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Use our base64Decode function instead of atob
    const decodedBase64 = base64Decode(base64);
    const jsonPayload = decodeURIComponent(
      decodedBase64
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    const {exp} = JSON.parse(jsonPayload);

    if (!exp) return false;

    // Get current time with buffer
    const currentTime = Math.floor(Date.now() / 1000) + bufferSeconds;

    // Check if token is expired or will expire soon
    return currentTime >= exp;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired on error
  }
};

/**
 * Check if tokens are available and valid
 * @returns {Promise<boolean>} True if a valid access token is available or was refreshed
 */
export const checkAndRefreshTokens = async () => {
  try {
    const state = store.getState();
    const accessToken = state?.auth?.accessToken;
    const refreshToken = state?.auth?.refreshToken;

    // If no refresh token, authentication is not possible
    if (!refreshToken) {
      return false;
    }

    // If access token is valid, no need to refresh
    if (accessToken && !isTokenExpired(accessToken)) {
      return true;
    }

    // Access token is expired or missing but we have refresh token
    // Try to refresh the token
    await refreshAccessToken();
    return true;
  } catch (error) {
    console.error('Token check and refresh failed:', error);
    return false;
  }
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
      `${config.API_BASE_URL}/v1/auth/refresh-tokens`,
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
    console.error('Failed to refresh token:', error);

    // Only clear tokens if the refresh token is invalid/expired/revoked
    // This is typically indicated by 401/403 status codes
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.log('Refresh token is invalid or expired. Logging out.');
      store.dispatch(updateToken({access: '', refresh: ''}));
    } else {
      // For network errors or server issues, we keep the tokens
      // so we can retry later
      console.log(
        'Token refresh failed due to network or server error. Will retry on next request.',
      );
    }

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
 * Wrapper function for API calls that ensures the access token is valid before making the request
 * @param {Function} apiFunction - The API function to call
 * @param {Object} requestData - Data to pass to the API function
 * @returns {Promise<any>} Result of the API call
 */
export const withTokenValidation = async (apiFunction, requestData = {}) => {
  try {
    // Check if the access token is valid, and refresh if needed
    const state = store.getState();
    const accessToken = state?.auth?.accessToken;

    // If token is expired or missing, try to refresh before making the API call
    if (!accessToken || isTokenExpired(accessToken)) {
      console.log(
        'Access token is missing or expired, attempting to refresh before API call',
      );

      // This will throw an error if refresh fails
      await checkAndRefreshTokens();
    }

    // Now make the actual API call with a valid token
    return await apiFunction(requestData);
  } catch (error) {
    console.error('Error in withTokenValidation:', error);
    throw error;
  }
};

/**
 * Make an authenticated API request with token refresh support
 * @param {Function} apiCall - Function that makes the actual API call
 * @returns {Promise<any>} API response
 */
export const makeAuthenticatedRequest = async apiCall => {
  try {
    // Check if access token is expired and refresh if needed
    const state = store.getState();
    const accessToken = state?.auth?.accessToken;

    if (accessToken && isTokenExpired(accessToken)) {
      try {
        // Proactively refresh token if it's expired
        await refreshAccessToken();
      } catch (refreshError) {
        // If refresh fails but was due to network error, still try the original request
        if (!refreshError.response) {
          console.log(
            'Refresh failed due to network error. Trying original request anyway.',
          );
        } else {
          throw refreshError;
        }
      }
    }

    // Attempt the API call
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
