import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchGameFeed = async => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/game/feed`, {
    params: { platform: 'ios' },
  });
};

export const fetchGameData = async gameId => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/game/validate/${gameId}`);
};

export const fetchUserLevelProgress = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/game/user-level-progess`);
};

export const fetchPastWinners = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/game/past-winners`);
};

export const fetchGameResult = async qp => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/game/game-engine`, {
    params: qp || {},
  });
};

export const confirmGameResult = async txnId => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/game/game-engine`, {
    id: txnId,
  });
};

export const fetchGameRewards = async txnId => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/game/game-rewards`, {
    params: {
      resultId: txnId,
    },
  });
};

export const fetchRewardsHistory = params => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/game/reward-section`, {
    params,
  });
};

export const validateTwitterFollow = params => {
  return fetcher.get(`${config.API_URL}/v2/twitter/validate-follow`, {
    params,
  });
};
