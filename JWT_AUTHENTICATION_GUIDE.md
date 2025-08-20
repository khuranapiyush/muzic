# Enhanced JWT Authentication System

This document explains the improved JWT token handling system implemented to ensure robust authentication without users getting stuck when tokens expire.

## Overview

The enhanced JWT system provides:
- ✅ Automatic access token refresh when expired
- ✅ Proper logout when refresh token expires
- ✅ Seamless API call handling with token refresh
- ✅ Prevention of API call failures due to expired tokens
- ✅ Consistent authentication state management

## Key Components

### 1. Token Management (`src/utils/authUtils.js`)

#### Core Functions:

- **`isTokenExpired(token, bufferSeconds)`**: Checks if a JWT token is expired
- **`refreshAccessToken()`**: Refreshes access token using refresh token
- **`checkAndRefreshTokens()`**: Validates tokens and refreshes if needed
- **`logoutUser()`**: Completely logs out user when both tokens are invalid
- **`shouldRedirectToLogin()`**: Determines if user should be redirected to login
- **`makeAuthenticatedRequest(apiCall)`**: Wrapper for API calls with token management

#### Key Improvements:

1. **Refresh Token Validation**: Now checks if refresh token itself is expired
2. **Complete Logout**: Clears both Redux state and user data when tokens are invalid
3. **Queue Management**: Prevents multiple simultaneous refresh requests
4. **Error Handling**: Distinguishes between network errors and token expiration

### 2. API Interceptors (`src/dataProvider/index.js`)

#### Request Interceptor:
- Validates tokens before making API calls
- Automatically refreshes expired access tokens
- Adds proper authorization headers

#### Response Interceptor:
- Handles 401 errors by attempting token refresh
- Logs out user when refresh token is invalid
- Queues failed requests for retry after token refresh

### 3. Redux State Management (`src/stores/slices/auth/index.js`)

#### Enhanced Token Handling:
- Properly handles null/empty token states
- Sets login status based on token validity
- Integrates with user slice for complete state management

## Usage Examples

### 1. Making Authenticated API Calls

```javascript
import { makeAuthenticatedRequest } from '../utils/authUtils';

// Example API function
const fetchUserData = async () => {
  return fetcher.get('/user/profile');
};

// Use with automatic token management
try {
  const userData = await makeAuthenticatedRequest(fetchUserData);
  console.log('User data:', userData);
} catch (error) {
  // Handle authentication errors
  if (error.message === 'User is not logged in') {
    // Redirect to login
  }
}
```

### 2. Checking Authentication Status

```javascript
import { shouldRedirectToLogin } from '../utils/authUtils';

const MyComponent = () => {
  useEffect(() => {
    if (shouldRedirectToLogin()) {
      navigation.navigate('Login');
    }
  }, []);
  
  // Component content
};
```

### 3. Manual Token Validation

```javascript
import { checkAndRefreshTokens } from '../utils/authUtils';

const validateTokens = async () => {
  try {
    const isValid = await checkAndRefreshTokens();
    if (!isValid) {
      // User needs to login again
      navigation.navigate('Login');
    }
  } catch (error) {
    console.error('Token validation failed:', error);
  }
};
```

## Flow Diagrams

### Token Refresh Flow

```
API Request
    ↓
Check Access Token
    ↓
Expired? → Yes → Check Refresh Token
    ↓               ↓
    No              Expired? → Yes → Logout User
    ↓               ↓
Proceed with       No
Request            ↓
                Refresh Access Token
                    ↓
                Retry API Request
```

### Authentication State Flow

```
App Start
    ↓
Check Stored Tokens
    ↓
Both Present? → No → Redirect to Login
    ↓
   Yes
    ↓
Validate Refresh Token
    ↓
Expired? → Yes → Clear Tokens & Redirect to Login
    ↓
   No
    ↓
Check Access Token
    ↓
Expired? → Yes → Refresh Access Token
    ↓              ↓
   No          Success? → No → Logout User
    ↓              ↓
Set User       Yes
Logged In      ↓
           Set User Logged In
```

## Error Handling

### 1. Network Errors
- Tokens are preserved for retry
- User remains logged in
- API calls can be retried

### 2. Token Expiration Errors
- Access token: Automatically refreshed
- Refresh token: User is logged out
- Invalid tokens: Complete logout

### 3. API Errors (Non-Auth)
- Normal error handling
- Tokens remain valid
- No logout triggered

## Testing

### Running Tests

```javascript
import authTestHelper from '../utils/authTestHelper';

// Run all tests
await authTestHelper.runAllAuthTests();

// Quick authentication check
await authTestHelper.quickAuthCheck();

// Individual tests
authTestHelper.testTokenExpiration();
await authTestHelper.testTokenRefresh();
```

### Test Scenarios

1. **Expired Access Token**: Should refresh automatically
2. **Expired Refresh Token**: Should logout user
3. **Network Errors**: Should preserve tokens
4. **Invalid Tokens**: Should clear all auth state
5. **Simultaneous Requests**: Should queue properly

## Configuration

### Token Buffer Time

Adjust the buffer time for token expiration checks:

```javascript
// Check if token expires within 60 seconds (default)
isTokenExpired(token, 60);

// Custom buffer time (5 minutes)
isTokenExpired(token, 300);
```

### API Endpoints

Update auth endpoint detection in `src/dataProvider/index.js`:

```javascript
const isAuthEndpoint = url => {
  return (
    url.includes('login') ||
    url.includes('register') ||
    url.includes('refresh-tokens') ||
    url.includes('auth/') ||
    url.includes('verify-email') ||
    // Add new auth endpoints here
    url.includes('forgot-password')
  );
};
```

## Migration Guide

### From Old System

1. **Replace direct Redux token updates**:
   ```javascript
   // Old
   dispatch(updateToken(newToken));
   
   // New
   import { logoutUser } from '../utils/authUtils';
   await logoutUser(); // For logout
   ```

2. **Replace manual API auth headers**:
   ```javascript
   // Old
   const token = getTokenFromStorage();
   fetcher.get('/api/data', { headers: { Authorization: `Bearer ${token}` } });
   
   // New
   import { makeAuthenticatedRequest } from '../utils/authUtils';
   await makeAuthenticatedRequest(() => fetcher.get('/api/data'));
   ```

3. **Update logout handling**:
   ```javascript
   // Old
   dispatch(resetUser());
   dispatch(updateToken({ access: '', refresh: '' }));
   
   // New
   import { logoutUser } from '../utils/authUtils';
   await logoutUser();
   ```

## Best Practices

1. **Always use `makeAuthenticatedRequest`** for API calls requiring authentication
2. **Check `shouldRedirectToLogin()`** in protected components
3. **Use `logoutUser()`** instead of manual state clearing
4. **Monitor console logs** for authentication debug information
5. **Test token expiration scenarios** in development

## Troubleshooting

### Common Issues

1. **User gets stuck on API calls**:
   - Check if using `makeAuthenticatedRequest`
   - Verify token refresh endpoint is working

2. **User not redirected to login**:
   - Check `shouldRedirectToLogin()` implementation
   - Verify navigation setup

3. **Tokens not refreshing**:
   - Check network connectivity
   - Verify refresh token endpoint
   - Check token format and expiration

### Debug Commands

```javascript
// Check current auth state
const state = store.getState();
console.log('Auth state:', state.auth);
console.log('User state:', state.user);

// Test token validation
import { quickAuthCheck } from '../utils/authTestHelper';
await quickAuthCheck();
```

## Conclusion

This enhanced JWT authentication system provides a robust, user-friendly experience that handles token expiration gracefully without interrupting the user's workflow. The system automatically manages token refresh, handles edge cases, and ensures users are properly logged out when necessary.
