import {updateToken} from '../stores/slices/auth';
import {getData} from '../utils/asyncStorage';
import {
  fanTvInstance,
  rawInstance,
  refreshInstance,
  strapiInstance,
} from './axios';

let isRefreshing = false;
let failedQueue = [];

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
        !req.url.includes('verify-email')
      ) {
        let {accessToken: token} = await getData('persist:auth');
        token = token?.replace(/^"|"$/g, '');
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
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
              .post('/v2/auth/refresh-tokens', {
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
                processQueue(refreshError, null);
                reject(refreshError);
                store.dispatch(updateToken({access: '', refresh: ''}));
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
