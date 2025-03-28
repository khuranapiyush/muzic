import config from 'react-native-config';
import fetcher from '../../dataProvider';
import {withTokenValidation} from '../../utils/authUtils';

export const dailyStreak = async () => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/user/streak`);
};

export const dailyStreakWithValidation = async () => {
  return withTokenValidation(() =>
    fetcher.post(`${config.FANTV_API_URL}/v1/user/streak`),
  );
};

export const fetchWalletBalance = async () => {
  return fetcher.get(`${config.API_URL}/v1/wallet/balance`);
};

export const fetchUserDetail = async ({userId}) => {
  return fetcher.get(`${config.API_URL}/v1/user/${userId}`);
};

export const fetchUserDetailWithValidation = async data => {
  return withTokenValidation(() =>
    fetcher.get(`${config.FANTV_API_URL}/v1/user/${data.userId}`),
  );
};

export const verifyKycStatus = async ({userId}) => {
  return fetcher.post(`${config.API_URL}/v1/user/${userId}/kyc`, {
    transactionId: userId,
  });
};

export const verifyKycStatusAuthbridge = async () => {
  return fetcher.get(`${config.API_URL}/v1/user/kyc-verification`);
};

export const updateUserMobile = async ({userId, data}) => {
  return fetcher.patch(`${config.API_URL}/v1/user/${userId}`, data);
};

export const sendMobileOtp = async ({userId}) => {
  return fetcher.get(`${config.API_URL}/v1/user/${userId}/send-otp?type=user`);
};

export const verifyMobileOtp = async ({userId, data}) => {
  return fetcher.post(`${config.API_URL}/v1/user/${userId}/verify-otp`, data);
};

export const updateUser = async ({userId, data}) => {
  return fetcher.patch(`${config.API_URL}/v1/user/${userId}`, data);
};

export const updateUserProfile = async data => {
  return withTokenValidation(() =>
    fetcher.patch(`${config.FANTV_API_URL}/v1/user`, data),
  );
};

export const validateUserName = async userName => {
  return fetcher.get(
    `${config.API_URL}/v1/user/validate-user-name?userName=${userName}`,
  );
};
