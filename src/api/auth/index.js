import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const authLoginSignup = async data => {
  return fetcher.post(`${config.API_BASE_URL}/v1/phone/send-code`, data);
};

export const authEmailSignup = async data => {
  return fetcher.post(`${config.API_URL}/v1/user`, data);
};

export const authGoogleLogin = async data => {
  return fetcher.post(`${config.API_BASE_URL}/auth/google/verify-token`, {
    idToken: data.idToken,
  });
};

export const authAppleLogin = async data => {
  return fetcher.post(`${config.API_URL}/v1/auth/apple-login`, data);
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
export const deleteAccount = async userId => {
  return fetcher.delete(`${config.API_URL}/v1/user/${userId}`);
};

export const authVerifyEmail = async token => {
  return fetcher.get(`${config.API_URL}/v1/auth/verify-email?token=${token}`);
};

export const getRefreshToken = async data => {
  return fetcher.post(`${config.API_BASE_URL}/v1/auth/refresh-tokens`, data);
};
