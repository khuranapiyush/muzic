import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchLanguageMasterData = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/common/language`);
};
export const updateLanguage = async ({ userId, data }) => {
  return fetcher.patch(`${config.API_URL}/v1/user/${userId}`, data);
};
