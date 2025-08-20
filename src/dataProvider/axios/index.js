import axios from 'axios';
import config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';

// Define fallback URLs in case environment variables are not loaded properly
const API_BASE_URL = config.API_BASE_URL || 'https://api.makemysong.xyz';
const STRAPI_URL = config.STRAPI_URL || 'https://admin.artistfirst.in';
const FANTV_API_URL = config.FANTV_API_URL || 'https://fantv-apis.fantiger.com';
const API_URL = config.API_URL || 'https://admin.artistfirst.in';

// Create axios instances with fallback URLs
const defaultInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000,
  retry: 3,
  retryDelay: 1000,
});

export const rawInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000,
  retry: 3,
  retryDelay: 1000,
});

export const strapiInstance = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000,
  retry: 3,
  retryDelay: 1000,
});

export const fanTvInstance = axios.create({
  baseURL: FANTV_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000,
  retry: 3,
  retryDelay: 1000,
});

export const refreshInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000,
  retry: 3,
  retryDelay: 1000,
});

// Add error handling to all axios instances
const instances = [
  defaultInstance,
  rawInstance,
  strapiInstance,
  fanTvInstance,
  refreshInstance,
];

// Add request interceptor to check network connectivity
instances.forEach(instance => {
  // Request interceptor to check network connectivity
  instance.interceptors.request.use(
    async reqConfig => {
      try {
        // Check network connectivity before making the request
        const netInfo = await NetInfo.fetch();

        if (!netInfo.isConnected) {
          // If not connected, reject the request with a custom error
          return Promise.reject({
            message: 'Network Error',
            isNetworkError: true,
            customMessage:
              'No internet connection. Please check your network settings and try again.',
          });
        }

        return reqConfig;
      } catch (error) {
        console.error('Error checking network status:', error);
        // Continue with the request even if NetInfo fails
        return reqConfig;
      }
    },
    error => {
      return Promise.reject(error);
    },
  );

  // Response interceptor for handling errors with retry logic
  instance.interceptors.response.use(
    response => response,
    async error => {
      const requestConfig = error && error.config ? error.config : null;

      // Initialize retry count if not present
      if (requestConfig && typeof requestConfig.__retryCount !== 'number') {
        requestConfig.__retryCount = 0;
      }

      // Create a default error message
      let errorMessage = 'An error occurred. Please try again.';

      // Check if this is our custom network error
      if (error.isNetworkError) {
        console.error('Network connectivity error:', error);
        errorMessage =
          error.customMessage ||
          'Network connection failed. Please check your internet connection and try again.';
        // You can dispatch an action here to show a network error UI
      } else if (error.message === 'Network Error') {
        // Handle network errors
        console.error('Network error detected:', error);
        errorMessage =
          'Network connection failed. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        // Handle timeout errors with retry
        console.error('Request timeout:', error);
        errorMessage = 'Request timed out. Please try again later.';

        // Retry logic for timeout errors
        if (
          requestConfig &&
          requestConfig.__retryCount < (requestConfig.retry || 3)
        ) {
          requestConfig.__retryCount += 1;
          console.log(
            `Retrying request (${requestConfig.__retryCount}/${
              requestConfig.retry || 3
            })`,
          );

          // Wait before retrying
          await new Promise(resolve =>
            setTimeout(resolve, requestConfig.retryDelay || 1000),
          );

          return instance(requestConfig);
        }
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          'Response error:',
          error.response.status,
          error.response.data,
        );

        if (error.response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';

          // Retry for server errors
          if (
            requestConfig &&
            requestConfig.__retryCount < (requestConfig.retry || 3)
          ) {
            requestConfig.__retryCount += 1;
            console.log(
              `Retrying request due to server error (${
                requestConfig.__retryCount
              }/${requestConfig.retry || 3})`,
            );

            await new Promise(resolve =>
              setTimeout(resolve, requestConfig.retryDelay || 1000),
            );

            return instance(requestConfig);
          }
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please try again later.';

        // Retry for no response
        if (
          requestConfig &&
          requestConfig.__retryCount < (requestConfig.retry || 3)
        ) {
          requestConfig.__retryCount += 1;
          console.log(
            `Retrying request due to no response (${
              requestConfig.__retryCount
            }/${requestConfig.retry || 3})`,
          );

          await new Promise(resolve =>
            setTimeout(resolve, requestConfig.retryDelay || 1000),
          );

          return instance(requestConfig);
        }
      }

      // Add the custom message to the error object
      error.customMessage = errorMessage;

      return Promise.reject(error);
    },
  );
});

export default defaultInstance;
