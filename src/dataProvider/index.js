import {updateToken} from '../stores/slices/auth';
// import {getData} from '../utils/asyncStorage';
import {
  fanTvInstance,
  rawInstance,
  refreshInstance,
  strapiInstance,
  default as defaultInstance,
} from './axios';
import {
  isTokenExpired,
  refreshAccessToken,
  logoutUser,
} from '../utils/authUtils';
import {store} from '../stores';
import config from 'react-native-config';
import {Platform} from 'react-native';

let isRefreshing = false;
let failedQueue = [];

// Helper to check if endpoint is auth-related (login, refresh tokens)
const isAuthEndpoint = url => {
  return (
    url.includes('login') ||
    url.includes('register') ||
    url.includes('refresh-tokens') ||
    url.includes('auth/') ||
    url.includes('verify-email')
  );
};

// Check and refresh token if needed before making API call
const ensureValidToken = async url => {
  // Skip token validation for auth endpoints - let interceptors handle all token logic
  if (isAuthEndpoint(url)) {
    return;
  }

  // Remove redundant token validation logic to avoid conflicts with interceptors
  // The auth interceptor will handle token validation and refresh automatically
  console.log(`API call to ${url} - token handling delegated to interceptors`);
};

const fetchAxiosInstanceType = type => {
  switch (type) {
    case 'raw':
      return rawInstance;
    case 'strapi':
      return strapiInstance;
    case 'default':
      return defaultInstance;
    default:
      return fanTvInstance;
  }
};

const fetcher = {
  /**
   * @function setAuthToken Set the authentication token directly for axios instances
   * @param {string} token Access token to use for API calls
   */
  setAuthToken: token => {
    try {
      if (!token) {
        console.warn('Attempted to set empty auth token');
        return;
      }

      console.log('Setting auth token in axios instances');

      // Determine token string value (handle object or string)
      const tokenValue =
        typeof token === 'object' && token !== null && token.access
          ? token.access
          : token;

      console.log('tokenValue', tokenValue);
      // Update token in axios instances with the proper string value
      if (typeof tokenValue === 'string') {
        fanTvInstance.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
        strapiInstance.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
        defaultInstance.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
        rawInstance.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
      }

      // Check if token is already an object or a string
      if (typeof tokenValue === 'string' && typeof token === 'string') {
        // If it's a string, update Redux with proper structure
        store.dispatch(
          updateToken({
            access: tokenValue,
            refresh: store.getState()?.auth?.refreshToken, // Keep existing refresh token
          }),
        );
      } else if (token && token.access && token.refresh) {
        // If it's already the correct structure with access & refresh
        store.dispatch(updateToken(token));
      }

      console.log('Auth token set successfully');
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  },

  /**
   * @function get To fetch a resource
   * @param {string} url api path
   * @param {object} paramConfigs axios parameters
   * @returns Promise
   */
  get: async (
    url,
    paramConfigs = {},
    axiosInstanceType,
    logConfigs = {log: false},
  ) => {
    // Check token validity before making the request unless explicitly skipped
    if (!paramConfigs?.skipTokenValidation) {
      await ensureValidToken(url);
    }

    const instance = fetchAxiosInstanceType(axiosInstanceType);
    return instance
      .request({
        url,
        method: 'GET',
        ...paramConfigs,
      })
      .then(response => {
        return response;
      })
      .catch(err => {
        console.error(
          `API Error (GET ${url}):`,
          err.message || 'Unknown error',
        );
        throw err;
      });
  },
  /**
   * @function post To create a resource
   * @param {string} url api path
   * @param {object} data Body to send
   * @param {object} paramConfigs axios parameters
   * @returns Promise
   */
  post: async (url, data, paramConfigs = {}, axiosInstanceType) => {
    // Check token validity before making the request unless explicitly skipped
    if (!paramConfigs?.skipTokenValidation) {
      await ensureValidToken(url);
    }

    const instance = fetchAxiosInstanceType(axiosInstanceType);
    return instance
      .request({
        url,
        method: 'POST',
        data,
        ...paramConfigs,
      })
      .then(response => {
        return response;
      })
      .catch(err => {
        if (err.customMessage) {
          console.error(`API Error (POST ${url}):`, err.customMessage);
        }
        throw err;
      });
  },
  /**
   * @function put To update a full data of resource
   * @param {string} url api path
   * @param {object} data Body to send
   * @param {object} paramConfigs axios parameters
   * @returns Promise
   */
  put: async (url, data, paramConfigs = {}, axiosInstanceType) => {
    // Check token validity before making the request unless explicitly skipped
    if (!paramConfigs?.skipTokenValidation) {
      await ensureValidToken(url);
    }

    const instance = fetchAxiosInstanceType(axiosInstanceType);
    return instance
      .request({
        url,
        method: 'PUT',
        data,
        ...paramConfigs,
      })
      .then(response => {
        return response;
      })
      .catch(err => {
        if (err.customMessage) {
          console.error(`API Error (PUT ${url}):`, err.customMessage);
        }
        throw err;
      });
  },
  /**
   * @function patch To update partial data of a resource
   * @param {string} url api path
   * @param {object} data Body to send
   * @param {object} paramConfigs axios parameters
   * @returns Promise
   */
  patch: async (url, data, paramConfigs = {}, axiosInstanceType) => {
    // Check token validity before making the request unless explicitly skipped
    if (!paramConfigs?.skipTokenValidation) {
      await ensureValidToken(url);
    }

    const instance = fetchAxiosInstanceType(axiosInstanceType);
    return instance
      .request({
        url,
        method: 'PATCH',
        data,
        ...paramConfigs,
      })
      .then(response => {
        return response;
      })
      .catch(err => {
        if (err.customMessage) {
          console.error(`API Error (PATCH ${url}):`, err.customMessage);
        }
        throw err;
      });
  },
  /**
   *@function delete To delete the resource
   * @param {*} url api path
   * @param {*} data Body to send
   * @param {*} paramConfigs axios parameters
   * @returns Promise
   */
  delete: async (url, paramConfigs = {}, axiosInstanceType) => {
    // Check token validity before making the request unless explicitly skipped
    if (!paramConfigs?.skipTokenValidation) {
      await ensureValidToken(url);
    }

    const instance = fetchAxiosInstanceType(axiosInstanceType);
    return instance
      .request({
        url,
        method: 'DELETE',
        ...paramConfigs,
      })
      .then(response => {
        return response;
      })
      .catch(err => {
        if (err.customMessage) {
          console.error(`API Error (DELETE ${url}):`, err.customMessage);
        }
        throw err;
      });
  },
  upload: async (url, formData, paramConfigs = {}, axiosInstanceType) => {
    // Check token validity before making the request unless explicitly skipped
    if (!paramConfigs?.skipTokenValidation) {
      await ensureValidToken(url);
    }

    const instance = fetchAxiosInstanceType(axiosInstanceType);
    return instance
      .request({
        url,
        method: 'PUT',
        data: formData,
        ...paramConfigs,
      })
      .then(response => {
        return response;
      })
      .catch(err => {
        throw err;
      });
  },
};

export const addAuthInterceptor = async () => {
  // Define the interceptor function to reuse for multiple instances
  const authInterceptorFunction = async req => {
    const shouldAddAuthHeaders =
      (req.url.includes('v1/') ||
        req.url.includes('v2/') ||
        req.url.includes('v3/') ||
        req.url.includes(
          'events.artistfirst.in/dev/rest-proxy/topics/video-event',
        )) &&
      !req.url.includes('login') &&
      !req.url.includes('/api') &&
      !req.url.includes('verify-email') &&
      !req.url.includes('refresh-tokens');

    // Allow callers to skip auth header injection and token refresh
    const skipAuthHeader = Boolean(req.skipAuthHeader);

    // Note: when callers set Authorization explicitly, we respect it below

    if (shouldAddAuthHeaders && !skipAuthHeader) {
      console.log(`Adding auth headers to request: ${req.url}`);

      try {
        // If Authorization is already set, validate/refresh if it's a Bearer token
        if (req.headers && req.headers.Authorization) {
          const authHeader = String(req.headers.Authorization);
          const isBearer = authHeader.startsWith('Bearer ');

          // Leave non-bearer headers untouched
          if (!isBearer) {
            return req;
          }

          const headerToken = authHeader.slice('Bearer '.length);

          try {
            const state = store.getState();
            const refreshToken = state?.auth?.refreshToken;
            const tokenInvalid = !headerToken || isTokenExpired(headerToken);

            // If header token invalid
            if (tokenInvalid) {
              if (refreshToken) {
                // Try to refresh and overwrite header
                const newAccess = await refreshAccessToken();
                if (newAccess) {
                  req.headers.Authorization = `Bearer ${newAccess}`;
                } else {
                  delete req.headers.Authorization;
                }
              } else {
                // No refresh token available - drop invalid header to avoid malformed JWT errors
                delete req.headers.Authorization;
              }
            }
          } catch (_) {
            // On any error, drop the invalid header so request proceeds unauthenticated
            delete req.headers.Authorization;
          }

          return req;
        }

        // Use our token utility directly instead of trying to get from multiple places
        const state = store.getState();
        const userIsLoggedIn = state?.user?.isLoggedIn;
        const authIsLoggedIn = state?.auth?.isLoggedIn;

        // Only proceed if user is logged in according to either state
        if (userIsLoggedIn || authIsLoggedIn) {
          // Get current token and validate
          let accessToken = state?.auth?.accessToken;
          const refreshToken = state?.auth?.refreshToken;

          // If we have a refresh token and access token is expired/missing, try to refresh
          if (refreshToken && (!accessToken || isTokenExpired(accessToken))) {
            try {
              console.log(
                'Interceptor: Token expired or missing, refreshing...',
              );
              // This will update Redux store with new tokens
              accessToken = await refreshAccessToken();
              console.log('Interceptor: Token refreshed successfully');
            } catch (error) {
              console.error('Interceptor: Failed to refresh token:', error);
              // If refresh fails with 401/403, user will be logged out in refreshAccessToken
              // For other errors, we continue and let the request fail normally
              if (
                error.response &&
                (error.response.status === 401 || error.response.status === 403)
              ) {
                // Token refresh failed due to invalid refresh token
                console.log(
                  'Interceptor: Refresh token invalid, skipping auth header',
                );
                return req; // Continue without auth header
              }
            }
          }

          // Set the Authorization header only if the token looks like a valid JWT
          if (accessToken) {
            const tokenValue =
              typeof accessToken === 'object' && accessToken.access
                ? accessToken.access
                : accessToken;

            if (
              typeof tokenValue === 'string' &&
              tokenValue.split('.').length === 3
            ) {
              req.headers.Authorization = `Bearer ${tokenValue}`;
              console.log('Interceptor: Auth header set successfully');
            } else {
              console.warn(
                'Interceptor: Skipping auth header due to invalid token format',
              );
            }
          } else {
            console.warn('Interceptor: No valid token available for request');
          }
        } else {
          console.log('Interceptor: User not logged in, skipping auth header');
        }
      } catch (error) {
        console.error('Interceptor: Error setting auth header:', error);
      }
    }

    console.log('🚀 ~ addAuthInterceptor ~ req:', req.url);

    // Add platform headers
    req.headers.platform = Platform.OS;
    req.headers['os-type'] = Platform.OS;
    return req;
  };

  // Apply the interceptor to all axios instances
  const fanTvInterceptorId = fanTvInstance.interceptors.request.use(
    authInterceptorFunction,
  );
  const rawInterceptorId = rawInstance.interceptors.request.use(
    authInterceptorFunction,
  );
  const defaultInterceptorId = defaultInstance.interceptors.request.use(
    authInterceptorFunction,
  );
  const strapiInterceptorId = strapiInstance.interceptors.request.use(
    authInterceptorFunction,
  );

  return () => {
    fanTvInstance.interceptors.request.eject(fanTvInterceptorId);
    rawInstance.interceptors.request.eject(rawInterceptorId);
    defaultInstance.interceptors.request.eject(defaultInterceptorId);
    strapiInstance.interceptors.request.eject(strapiInterceptorId);
  };
};

const processQueue = (error, token = null, axiosInstance = fanTvInstance) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.originalRequest.headers.Authorization = `Bearer ${token}`;
      prom.resolve(axiosInstance(prom.originalRequest));
    }
  });

  failedQueue = [];
};

export const setupResponseInterceptor = async injectedStore => {
  // Define the response interceptor function to reuse for multiple instances
  const responseInterceptorFunction = (response, axiosInstance) => {
    return response;
  };

  const responseErrorHandler = (error, axiosInstance) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      // If this request explicitly opted out of auth handling, don't attempt refresh
      if (
        originalRequest?.skipAuthHeader ||
        originalRequest?.skipTokenValidation ||
        originalRequest?.skipAuthHandling
      ) {
        return Promise.reject(error);
      }

      const state = injectedStore.getState();

      const refreshToken = state?.auth?.refreshToken;

      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        failedQueue.push({
          resolve: res => res,
          reject: err => err,
          originalRequest,
        });

        return new Promise((resolve, reject) => {
          refreshInstance
            .post(`${config.API_BASE_URL}/v1/auth/refresh-tokens`, {
              refreshToken,
            })
            .then(async res => {
              const access = res.data.access?.token;
              const refresh = res.data.refresh?.token;
              injectedStore.dispatch(updateToken({access, refresh}));

              processQueue(null, access, axiosInstance);
              resolve(axiosInstance(originalRequest));
            })
            .catch(refreshError => {
              console.error('Token refresh error:', refreshError);

              if (
                refreshError.response &&
                (refreshError.response.status === 401 ||
                  refreshError.response.status === 403)
              ) {
                console.log(
                  'Refresh token is invalid or expired. Logging out user.',
                );
                logoutUser().catch(err => console.error('Logout error:', err));
              } else {
                console.log(
                  'Token refresh failed due to network or server error.',
                );
              }

              processQueue(refreshError, null, axiosInstance);
              reject(refreshError);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            originalRequest,
          });
        });
      }
    }
    return Promise.reject(error);
  };

  // Apply the response interceptor to all axios instances
  const fanTvInterceptorId = fanTvInstance.interceptors.response.use(
    response => responseInterceptorFunction(response, fanTvInstance),
    error => responseErrorHandler(error, fanTvInstance),
  );

  const rawInterceptorId = rawInstance.interceptors.response.use(
    response => responseInterceptorFunction(response, rawInstance),
    error => responseErrorHandler(error, rawInstance),
  );

  const defaultInterceptorId = defaultInstance.interceptors.response.use(
    response => responseInterceptorFunction(response, defaultInstance),
    error => responseErrorHandler(error, defaultInstance),
  );

  const strapiInterceptorId = strapiInstance.interceptors.response.use(
    response => responseInterceptorFunction(response, strapiInstance),
    error => responseErrorHandler(error, strapiInstance),
  );

  return () => {
    fanTvInstance.interceptors.response.eject(fanTvInterceptorId);
    rawInstance.interceptors.response.eject(rawInterceptorId);
    defaultInstance.interceptors.response.eject(defaultInterceptorId);
    strapiInstance.interceptors.response.eject(strapiInterceptorId);
  };
};

export default fetcher;
