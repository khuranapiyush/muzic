import config from 'react-native-config';
import fetcher from '../../dataProvider';
import {store} from '../../stores';

export const authLoginSignup = async data => {
  return fetcher.post(`${config.API_BASE_URL}/v1/phone/send-code`, data);
};

export const authEmailSignup = async data => {
  return fetcher.post(`${config.API_URL}/v1/user`, data);
};

export const authGoogleLogin = async data => {
  const endpoint = `${config.API_BASE_URL}/auth/google/verify-token`;

  try {
    const response = await fetcher.post(endpoint, {
      idToken: data.idToken || data.id_token,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const authAppleLogin = async data => {
  return fetcher.post(`${config.API_BASE_URL}/v1/auth/apple`, {
    idToken: data.id_token,
    userId: data.userId,
    email: data.email,
    fullName: data.fullName,
    nonce: data.nonce,
    user: data.user,
  });
};

export const authLogin = async data => {
  return fetcher.post(`${config.API_URL}/v1/auth/login`, data);
};

export const authVerifyOtp = async data => {
  return fetcher.post(`${config.API_BASE_URL}/v1/phone/verify-code`, data);
};

export const guestAuthLogin = async data => {
  return fetcher.post(`${config.API_URL}/v1/auth/device-login-signup`, data);
};

export const deleteAccount = async () => {
  // Get current access token from Redux store
  const state = store.getState();
  const accessToken = state?.auth?.accessToken;

  if (!accessToken) {
    throw new Error('Authentication token is missing');
  }

  // Explicitly include the authorization header
  return fetcher.delete(`${config.API_BASE_URL}/auth/account`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const authVerifyEmail = async token => {
  return fetcher.get(`${config.API_URL}/v1/auth/verify-email?token=${token}`);
};

export const getRefreshToken = async data => {
  return fetcher.post(`${config.API_BASE_URL}/v1/auth/refresh-tokens`, data);
};
