import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchProfileFeed = async => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/profile`);
};
