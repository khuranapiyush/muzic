import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchCoinStats = async qp => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/coin-stats`, {
    params: qp || {},
  });
};
export const fetchEarnCoin = async => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/coin-earn`);
};
export const fetchStreakStats = async qp => {
  return fetcher.get(`${config.FANTV_API_URL}/v2/user/streak-stats`, {
    params: qp || {},
  });
};

export const fetchWalletFeed = async qp => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/wallet-feed`, {
    params: qp || {},
  });
};

export const fetchWalletCoinBalance = async => {
  return fetcher.get(
    `${config.API_URL}/v1/wallet/balance?includeWalletSettings=false`
  );
};

export const linkYoutubeApi = async qp => {
  return fetcher.get(
    `${config.API_URL}/v2/google/auth-code?code=${qp.code}&state=${qp.state}`
  );
};
