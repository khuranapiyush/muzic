import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchCreatorProfile = async ({ id, qp }) => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/${id}/videos`, {
    params: qp || {},
  });
};

export const followCreator = async ({ id }) => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/${id}/follow`);
};

export const creatorFollowStats = async ({ id }) => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/artist/${id}/follow-status`);
};

export const creatorFollowUnfollow = async ({ id }) => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/user/${id}/follow`);
};

export const fetchCreatorVideos = async ({ id, qp }) => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/creator/${id}/videos`, {
    params: qp || {},
  });
};
