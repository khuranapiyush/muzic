import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchCommunities = async => {
  return fetcher.get(`${config.API_URL}/v1/community`);
};

export const fetchMessages = async ({
  channelId,
  limit = 20,
  fromDate = null,
  cursorType,
}) => {
  return fetcher.get(`${config.API_URL}/v1/message`, {
    params: {
      limit,
      updateLastSeen: true,
      channelId,
      fromDate,
      cursorType,
    },
  });
};

export const gotoMessage = async ({ channelId, date }) => {
  return fetcher.get(`${config.API_URL}/v1/message/goto-message`, {
    params: {
      channelId,
      date,
    },
  });
};

export const joinCommunity = async ({ communityId }) => {
  return fetcher.post(`${config.API_URL}/v1/community/${communityId}/join`);
};

export const deleteMessage = async messageId => {
  return fetcher.delete(`${config.API_URL}/v1/message/${messageId}`);
};

export const fetchCommunityUsers = async ({ communityId, userNamePrefix }) => {
  return fetcher.get(`${config.API_URL}/v1/user/get-userName-with-prefix`, {
    params: {
      communityId,
      userNamePrefix,
    },
  });
};
