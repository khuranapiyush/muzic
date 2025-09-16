import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const awsVideoPresignedUrl = async data => {
  console.log('🚀 ~ awsVideoPresignedUrl ~ data:', data);
  return fetcher.post(`${config.FANTV_API_URL}/v1/common/upload-media`, data);
};
export const sessionURLAPI = async (data, contentURl) => {
  return fetcher.post(
    data,
    {},
    {
      headers: {
        'Content-Type': contentURl,
        'X-Goog-Resumable': 'start',
      },
    },
    'raw'
  );
};

const sessionURL1 = async data => {
  return fetcher.post(
    data,
    {},
    {
      headers: {
        'content-type': 'application/vnd.kafka.avro.v2+json',
        accept: 'application/json, text/plain, */*',
      },
    },
    'raw'
  );
};

export const awsThumbPresignedUrl = async data => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/common/upload-media`, data);
};

export const fetchUploadMetaData = async qp => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/video/upload-metadata`, {
    params: qp || {},
  });
};

export const uploadVideoData = async data => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/video/`, data);
};

export const fetchMyVideos = async (page = 1) => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/videos?page=${page}`);
};

export const fetchStories = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/story`);
};

export const fetchStoriesTemplates = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/story/template`);
};

export const fetchStoriesPlatform = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/story/story-platform`);
};

export const postStories = async data => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/story`, data);
};

export const storyTrackEvents = async ({ id, data }) => {
  return fetcher.post(
    `${config.FANTV_API_URL}/v1/story/${id}/track-events`,
    data
  );
};

export const createRoom = async data => {
  return fetcher.post(`${config.FANTV_API_URL}/v2/room`, data);
};

export const getRoomDetails = async roomId => {
  console.log('🚀 ~ getRoomDetails ~ roomId:', roomId);
  return fetcher.get(`${config.FANTV_API_URL}/v2/room/join-room/${roomId}`);
};
