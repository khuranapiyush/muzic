import config from 'react-native-config'
import fetcher from '../../dataProvider'

export const fetchSearch = async data => {
  return fetcher.post(`${config.FANTV_API_URL}/v1/search`, data)
}
