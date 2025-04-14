import {updateToken} from '../stores/slices/auth';
import {getData} from '../utils/asyncStorage';
import {
  fanTvInstance,
  rawInstance,
  refreshInstance,
  strapiInstance,
} from './axios';
import {
  isTokenExpired,
  refreshAccessToken,
  checkAndRefreshTokens,
} from '../utils/authUtils';
import {store} from '../stores';
import config from 'react-native-config';

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
  // Skip token validation for auth endpoints
  if (isAuthEndpoint(url)) {
    return;
  }

  try {
    const state = store.getState();
    const accessToken = state?.auth?.accessToken;
    const refreshToken = state?.auth?.refreshToken;

    // If we have a refresh token and the access token is expired, refresh it
    if (refreshToken && (!accessToken || isTokenExpired(accessToken))) {
      console.log(`Token validation before API call to ${url}`);
      await checkAndRefreshTokens();
    }
  } catch (error) {
    console.error('Error ensuring valid token:', error);
    // Continue with request anyway - the interceptor will handle 401 errors
  }
};

const fetchAxiosInstanceType = type => {
  switch (type) {
    case 'raw':
      return rawInstance;
    case 'strapi':
      return strapiInstance;
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
      // Update token in all axios instances
      fanTvInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
      strapiInstance.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Also update the Redux store with the new token
      store.dispatch(updateToken(token));

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
    // Check token validity before making the request
    await ensureValidToken(url);

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
    // Check token validity before making the request
    await ensureValidToken(url);

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
    // Check token validity before making the request
    await ensureValidToken(url);

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
    // Check token validity before making the request
    await ensureValidToken(url);

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
    // Check token validity before making the request
    await ensureValidToken(url);

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
    // Check token validity before making the request
    await ensureValidToken(url);

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
  const authInterceptorId = fanTvInstance.interceptors.request.use(
    async req => {
      if (
        (req.url.includes('v1/') ||
          req.url.includes('v2/') ||
          req.url.includes('v3/') ||
          req.url.includes(
            'events.artistfirst.in/dev/rest-proxy/topics/video-event',
          )) &&
        !req.url.includes('login') &&
        !req.url.includes('/api') &&
        !req.url.includes('verify-email') &&
        !req.url.includes('refresh-tokens') // Skip token check for refresh endpoint
      ) {
        // Check Redux store first for tokens
        const state = store.getState();
        let accessToken = state?.auth?.accessToken;
        const refreshToken = state?.auth?.refreshToken;

        // If not in Redux, try from AsyncStorage
        if (!accessToken) {
          let {accessToken: token} = await getData('persist:auth');
          accessToken = token?.replace(/^"|"$/g, '');
        }

        // If we have an access token, check if it's expired
        if (accessToken && isTokenExpired(accessToken)) {
          console.log('Access token is expired, attempting to refresh...');

          // Only try to refresh if we have a refresh token
          if (refreshToken) {
            try {
              // Get a new access token
              accessToken = await refreshAccessToken();
              console.log('Access token refreshed successfully');
            } catch (error) {
              console.error('Failed to refresh token:', error);
              // Will proceed with existing token or no token
            }
          }
        }

        // Set the Authorization header if we have a token
        if (accessToken) {
          req.headers.Authorization = `Bearer ${accessToken}`;
        }
      }

      console.log('🚀 ~ addAuthInterceptor ~ req:', req.url);

      req.headers.platform = 'ios';
      req.headers['os-type'] = 'ios';
      return req;
    },
  );

  return () => {
    fanTvInstance.interceptors.request.eject(authInterceptorId);
  };
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.originalRequest.headers['Authorization'] = `Bearer ${token}`;
      prom.resolve(fanTvInstance(prom.originalRequest));
    }
  });

  failedQueue = [];
};

export const setupResponseInterceptor = async store => {
  const responseInterceptorId = fanTvInstance.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401) {
        const state = store.getState();

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
                store.dispatch(updateToken({access, refresh}));

                processQueue(null, access);
                resolve(fanTvInstance(originalRequest));
              })
              .catch(refreshError => {
                console.error('Token refresh error:', refreshError);

                if (
                  refreshError.response &&
                  (refreshError.response.status === 401 ||
                    refreshError.response.status === 403)
                ) {
                  console.log(
                    'Refresh token is invalid or expired. Logging out.',
                  );
                  store.dispatch(updateToken({access: '', refresh: ''}));
                } else {
                  console.log(
                    'Token refresh failed due to network or server error.',
                  );
                }

                processQueue(refreshError, null);
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
    },
  );

  return () => {
    fanTvInstance.interceptors.response.eject(responseInterceptorId);
  };
};

export default fetcher;
