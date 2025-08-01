import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchAppConfig = async data => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/common/app-config`, {
    headers: {'os-type': 'ios'},
  });
};
