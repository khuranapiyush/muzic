import config from 'react-native-config';
import fetcher from '../../dataProvider';

const {FANTV_API_URL, FANTV_KAFKA_URL, FANTV_KAFKA_TOPIC, API_URL} = config;

const similarVideoListRequest = async qp => {
  return fetcher.get(`${FANTV_API_URL}/v3/video/`, {params: qp});
};
const similarVideoListRequestTabWise = async (url, qp) => {
  return fetcher.get(url, {params: qp});
};

const videoDetails = async data => {
  return fetcher.get(`${FANTV_API_URL}/v1/video/${data.id}`);
};

const videoLike = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/video/${data.id}/like`);
};

const videoDislike = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/video/${data.id}/dislike`);
};

const followCreator = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/user/${data.id}/follow`);
};

const getVideoLikeFollow = async data => {
  return fetcher.get(`${FANTV_API_URL}/v1/video/${data.id}/like-follow`);
};
const trackEvents = async ({id, data}) => {
  return fetcher.post(`${FANTV_API_URL}/v1/video/${id}/track-events`, data);
};

const fetchTippingDetails = async () => {
  return fetcher.get(`${FANTV_API_URL}/v1/creator/tipping-details`);
};

const tipCreator = async data => {
  return fetcher.post(`${FANTV_API_URL}/v1/creator/tip`, data);
};

const postPlayerEvent = async data => {
  return fetcher.post(
    'https://events.artistfirst.in/dev/rest-proxy/topics/video-event',
    data,
    {
      headers: {
        'content-type': 'application/vnd.kafka.avro.v2+json',
        accept: 'application/json, text/plain, */*',
      },
    },
    'raw',
  );
};

const videoDetailsBySlug = async slug => {
  return fetcher.get(`${FANTV_API_URL}/v1/video/info/${slug}`);
};

export {
  videoDetails,
  videoLike,
  videoDislike,
  getVideoLikeFollow,
  followCreator,
  similarVideoListRequest,
  trackEvents,
  postPlayerEvent,
  videoDetailsBySlug,
  tipCreator,
  fetchTippingDetails,
  similarVideoListRequestTabWise,
};
