import {store} from '../stores';
import {updateToken, setLoggedIn} from '../stores/slices/auth';
import {resetUser} from '../stores/slices/user';
import {getData} from './asyncStorage';
import fetcher from '../dataProvider';
import config from 'react-native-config';

// Flag to track if a token refresh is in progress
let isRefreshingToken = false;
// Queue of requests waiting for token refresh
let refreshQueue = [];

/**
 * Determine if an error response explicitly indicates an invalid/expired refresh token
 * Adjust the list of codes/fields below to match backend schema
 * @param {any} error Axios-like error object
 * @returns {boolean}
 */
export const isInvalidRefreshTokenError = error => {
  try {
    if (!error || !error.response) {
      return false;
    }
    const {status, data} = error.response;

    // Common HTTP statuses for invalid/expired tokens
    const isAuthStatus = status === 401 || status === 403;
    if (!isAuthStatus) {
      return false;
    }

    // Try multiple common fields for backend error codes
    const code = data?.code || data?.errorCode || data?.error?.code;
    const message = (data?.message || data?.error?.message || '')
      .toString()
      .toLowerCase();

    // Known/likely codes indicating refresh token issues
    const refreshInvalidCodes = new Set([
      'REFRESH_TOKEN_INVALID',
      'REFRESH_TOKEN_EXPIRED',
      'INVALID_REFRESH_TOKEN',
      'TOKEN_EXPIRED',
      'AUTH_INVALID_REFRESH_TOKEN',
      'AUTH_REFRESH_EXPIRED',
    ]);

    if (code && refreshInvalidCodes.has(String(code).toUpperCase())) {
      return true;
    }

    // Fallback to message heuristics if no explicit code
    if (
      message.includes('refresh') &&
      (message.includes('expired') || message.includes('invalid'))
    ) {
      return true;
    }

    return false;
  } catch (_) {
    return false;
  }
};

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
 * Log out the user completely by clearing tokens and resetting user state
 */
export const logoutUser = async () => {
  try {
    console.log('Logging out user - clearing all tokens and user state');

    // Clear tokens from Redux store
    store.dispatch(updateToken({access: null, refresh: null}));
    store.dispatch(setLoggedIn(false));

    // Reset user state
    store.dispatch(resetUser());

    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

/**
 * Decode base64 string (replacement for atob in React Native)
 * @param {string} input - Base64 string to decode
 * @returns {string} Decoded string
 */
const base64Decode = input => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/[=]+$/, '');
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
  if (!token) {
    return true;
  }

  try {
    // Handle token as object with access property
    let tokenString = token;
    if (typeof token === 'object' && token !== null && token.access) {
      tokenString = token.access;
    }

    // Validate token format - must be string and contain two dots (header.payload.signature)
    if (
      !tokenString ||
      typeof tokenString !== 'string' ||
      tokenString.split('.').length !== 3
    ) {
      console.warn(
        'isTokenExpired - Invalid token format:',
        typeof tokenString,
        tokenString && typeof tokenString === 'string'
          ? `Preview: ${tokenString.substring(0, 50)}...`
          : 'empty',
      );
      return true; // Treat as expired
    }

    // Decode the token to get expiration time
    const base64Url = tokenString.split('.')[1];
    if (!base64Url) {
      console.warn('Token payload section missing');
      return true; // Treat as expired
    }

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

    if (!exp) {
      return false;
    }

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
      console.log('No refresh token available');
      return false;
    }

    // Do NOT attempt to locally decode/verify refresh token expiry here.
    // Some backends issue opaque (non-JWT) refresh tokens which cannot be decoded client-side.
    // Instead, rely on the server during refreshAccessToken() to validate and decide.

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
    const authIsLoggedIn = state?.auth?.isLoggedIn;
    const userIsLoggedIn = state?.user?.isLoggedIn;

    // Check both isLoggedIn flags to ensure compatibility
    const isLoggedIn = authIsLoggedIn || userIsLoggedIn;

    // If user is not logged in, don't attempt to refresh
    if (!isLoggedIn) {
      console.log('User is not logged in, skipping token refresh');
      return null;
    }

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

    // Only clear tokens if backend explicitly signals invalid/expired refresh token
    if (isInvalidRefreshTokenError(error)) {
      console.log(
        'Refresh token invalid/expired per backend code. Logging out user.',
      );
      await logoutUser();
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
  try {
    // Try to get token from Redux store
    const state = store.getState();
    let token = state?.auth?.accessToken;

    // Debug output
    console.log(
      'getAuthToken - token from redux:',
      token ? 'present' : 'missing',
    );

    // If not in Redux, try from AsyncStorage
    if (!token) {
      try {
        const authData = await getData('persist:auth');
        console.log(
          'getAuthToken - fetched from AsyncStorage:',
          authData ? 'data found' : 'no data',
        );

        if (authData && authData.accessToken) {
          // Redux Persist stores data as JSON strings, so we need to handle the format carefully
          let rawToken = authData.accessToken;

          // If the token is stored as a JSON string (wrapped in quotes), unwrap it
          if (
            typeof rawToken === 'string' &&
            rawToken.startsWith('"') &&
            rawToken.endsWith('"')
          ) {
            try {
              rawToken = JSON.parse(rawToken);
            } catch {
              // If JSON.parse fails, just remove the quotes manually
              rawToken = rawToken.slice(1, -1);
            }
          }

          token = rawToken;
          console.log(
            'getAuthToken - extracted from AsyncStorage:',
            token ? 'success' : 'failed',
          );
        }
      } catch (storageError) {
        console.error(
          'getAuthToken - Error accessing AsyncStorage:',
          storageError,
        );
      }
    }

    // Final validation
    if (!token) {
      console.log('getAuthToken - No valid token found');
      return null;
    }

    // Handle token as object with access property
    if (typeof token === 'object' && token !== null && token.access) {
      const extractedToken = token.access;

      // Validate the extracted token format
      if (
        typeof extractedToken === 'string' &&
        extractedToken.split('.').length === 3
      ) {
        return extractedToken;
      } else {
        console.warn(
          'getAuthToken - Invalid token format from object:',
          typeof extractedToken,
        );
        return null;
      }
    }

    // Validate string token format (must be JWT with exactly 3 parts)
    if (typeof token === 'string') {
      const parts = token.split('.');
      if (parts.length === 3) {
        return token;
      } else {
        console.warn(
          'getAuthToken - Invalid JWT token format. Expected 3 parts, got:',
          parts.length,
          'Token preview:',
          token.substring(0, 50) + '...',
        );
        return null;
      }
    }

    console.warn(
      'getAuthToken - Invalid token format:',
      typeof token,
      token ? 'has content' : 'empty',
    );
    return null;
  } catch (error) {
    console.error('getAuthToken - Unexpected error:', error);
    return null;
  }
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
    // Check if user is logged in
    const state = store.getState();
    const authIsLoggedIn = state?.auth?.isLoggedIn;
    const userIsLoggedIn = state?.user?.isLoggedIn;
    const isLoggedIn = authIsLoggedIn || userIsLoggedIn;

    // If user is not logged in, don't attempt the request
    if (!isLoggedIn) {
      console.log('User is not logged in, skipping authenticated request');
      throw new Error('User is not logged in');
    }

    // Check if tokens are valid and refresh if needed
    const tokenValidationResult = await checkAndRefreshTokens();

    if (!tokenValidationResult) {
      console.log('Token validation failed, user may have been logged out');
      throw new Error('Authentication failed');
    }

    // Attempt the API call
    return await apiCall();
  } catch (error) {
    // If error is 401 Unauthorized, try to refresh token one more time
    if (error.response && error.response.status === 401) {
      try {
        console.log('Received 401 error, attempting token refresh');
        // Refresh the token
        await refreshAccessToken();

        // Retry the API call with new token
        return await apiCall();
      } catch (refreshError) {
        console.error('Token refresh failed after 401 error:', refreshError);
        throw refreshError;
      }
    }

    // If error is not 401 or refresh failed, throw the original error
    throw error;
  }
};

/**
 * Check if user needs to be redirected to login/auth screen
 * @returns {boolean} True if user should be redirected to login
 */
export const shouldRedirectToLogin = () => {
  const state = store.getState();
  const authIsLoggedIn = state?.auth?.isLoggedIn;
  const userIsLoggedIn = state?.user?.isLoggedIn;
  const refreshToken = state?.auth?.refreshToken;

  // If no login state or no refresh token, should redirect
  if (!authIsLoggedIn && !userIsLoggedIn) {
    return true;
  }

  // If no refresh token, should redirect
  if (!refreshToken) {
    return true;
  }

  // If refresh token is expired, should redirect
  if (isTokenExpired(refreshToken)) {
    return true;
  }

  return false;
};
