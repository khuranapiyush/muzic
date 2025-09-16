import config from 'react-native-config';
import fetcher from '../../dataProvider';

const { FANTV_API_URL } = config;

export const similarShortieListRequest = async qp => {
  return fetcher.get(`${FANTV_API_URL}/v1/shortie/`, { params: qp });
};

export const shortieCreatorFollowUnfollow = async id => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/user/${id}/follow`);
};

export const shortieLike = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/shortie/${data.id}/like`);
};

export const shortieDislike = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/shortie/${data.id}/like`);
};

export const followCreator = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/user/${data.id}/follow`);
};

export const getShortieLikeFollow = async data => {
  return fetcher.get(`${FANTV_API_URL}/v1/shortie/${data.id}/like-follow`);
};

export const shortieDetailsBySlug = async slug => {
  return fetcher.get(`${FANTV_API_URL}/v1/shortie/${slug}`);
};
