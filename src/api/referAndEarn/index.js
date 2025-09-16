import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchInviteCondition = async () => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/user/referral-invite-condition`
  );
};

export const fetchFaqs = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/referral-faq`);
};

export const fetchReferralInfo = async () => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/user/referral-info`);
};

export const fetchReferralList = async page => {
  console.log('🚀 ~ file: index.js:19 ~ fetchReferralList ~ page:', page);
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/dashboard/referral-dashboard?limit=10&page=${page}`
  );
};
