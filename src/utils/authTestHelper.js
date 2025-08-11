/**
 * Auth Test Helper - Utilities for testing JWT token handling
 *
 * This file contains helper functions to test the enhanced JWT authentication system.
 * Use these functions to verify that token refresh and logout work correctly.
 */

import {
  isTokenExpired,
  checkAndRefreshTokens,
  refreshAccessToken,
  logoutUser,
  shouldRedirectToLogin,
  makeAuthenticatedRequest,
} from './authUtils';
import {store} from '../stores';

/**
 * Test token expiration detection
 */
export const testTokenExpiration = () => {
  console.log('=== Testing Token Expiration Detection ===');

  // Test with expired token (simulated)
  const expiredToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
  console.log('Expired token check:', isTokenExpired(expiredToken));

  // Test with valid token (simulated - far future expiry - year 2030)
  // This is a test token with expiry in 2030
  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4OTM0NTYwMDB9.invalid';
  console.log('Valid token check:', isTokenExpired(validToken));

  // Test with malformed token
  console.log('Malformed token check:', isTokenExpired('invalid.token'));

  console.log('=== Token Expiration Tests Complete ===\n');
};

/**
 * Test authentication state checking
 */
export const testAuthState = () => {
  console.log('=== Testing Authentication State ===');

  const state = store.getState();
  const authState = state?.auth;
  const userState = state?.user;

  console.log('Auth slice state:', {
    isLoggedIn: authState?.isLoggedIn,
    hasAccessToken: !!authState?.accessToken,
    hasRefreshToken: !!authState?.refreshToken,
  });

  console.log('User slice state:', {
    isLoggedIn: userState?.isLoggedIn,
    userId: userState?.userId,
  });

  console.log('Should redirect to login:', shouldRedirectToLogin());

  console.log('=== Authentication State Tests Complete ===\n');
};

/**
 * Test token refresh functionality
 */
export const testTokenRefresh = async () => {
  console.log('=== Testing Token Refresh ===');

  try {
    // Check current token state
    const state = store.getState();
    const hasRefreshToken = !!state?.auth?.refreshToken;

    if (!hasRefreshToken) {
      console.log('No refresh token available - cannot test refresh');
      return;
    }

    console.log('Attempting token refresh...');
    const result = await checkAndRefreshTokens();
    console.log('Token refresh result:', result);

    if (result) {
      console.log('Token refresh successful');
    } else {
      console.log('Token refresh failed or not needed');
    }
  } catch (error) {
    console.error('Token refresh error:', error.message);
  }

  console.log('=== Token Refresh Tests Complete ===\n');
};

/**
 * Test making authenticated API calls
 */
export const testAuthenticatedRequest = async () => {
  console.log('=== Testing Authenticated API Requests ===');

  // Example authenticated API call
  const testApiCall = () => {
    return new Promise(resolve => {
      // Simulate an API call
      setTimeout(() => {
        resolve({data: 'Mock API response'});
      }, 100);
    });
  };

  try {
    console.log('Making authenticated request...');
    const response = await makeAuthenticatedRequest(testApiCall);
    console.log('API call successful:', response);
  } catch (error) {
    console.error('API call failed:', error.message);
  }

  console.log('=== Authenticated Request Tests Complete ===\n');
};

/**
 * Test logout functionality
 */
export const testLogout = async () => {
  console.log('=== Testing Logout Functionality ===');

  try {
    console.log('Current auth state before logout:');
    testAuthState();

    console.log('Performing logout...');
    await logoutUser();

    console.log('Auth state after logout:');
    testAuthState();

    console.log('Logout completed successfully');
  } catch (error) {
    console.error('Logout error:', error.message);
  }

  console.log('=== Logout Tests Complete ===\n');
};

/**
 * Run all authentication tests
 */
export const runAllAuthTests = async () => {
  console.log('🚀 Starting Enhanced JWT Authentication Tests\n');

  testTokenExpiration();
  testAuthState();
  await testTokenRefresh();
  await testAuthenticatedRequest();
  // Note: testLogout() will log the user out, uncomment only if you want to test this
  // await testLogout();

  console.log('✅ All authentication tests completed!');
};

/**
 * Quick helper to check if tokens are working
 */
export const quickAuthCheck = async () => {
  console.log('🔍 Quick Authentication Check');

  const state = store.getState();
  const accessToken = state?.auth?.accessToken;
  const refreshToken = state?.auth?.refreshToken;

  console.log('Tokens status:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenExpired: accessToken ? isTokenExpired(accessToken) : 'N/A',
    refreshTokenExpired: refreshToken ? isTokenExpired(refreshToken) : 'N/A',
    shouldRedirect: shouldRedirectToLogin(),
  });

  if (accessToken && refreshToken) {
    try {
      const refreshResult = await checkAndRefreshTokens();
      console.log('Token validation result:', refreshResult);
    } catch (error) {
      console.error('Token validation error:', error.message);
    }
  }
};

// Export test functions for easy access
export default {
  testTokenExpiration,
  testAuthState,
  testTokenRefresh,
  testAuthenticatedRequest,
  testLogout,
  runAllAuthTests,
  quickAuthCheck,
};
