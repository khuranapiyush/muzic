import config from 'react-native-config';
import fetcher from '../../dataProvider';

export const fetchCreatorLevelInfo = async => {
  return fetcher.get(`${config.FANTV_API_URL}/v1/creator/get-creator-info`);
};

export const fetchCreatorRedeemCoin = async => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/redeemCreatorCoin?type=earning`
  );
};

export const fetchCreatorCommunityReferral = async => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/creatorCommunityReferral?type=views`
  );
};

export const fetchCreatorLevelUpCriteria = async => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/getLevelUpCondition`
  );
};

export const fetchCreatorGraphData = async qp => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/getCreatorDashboardChart`,
    {
      params: qp || {},
    }
  );
};

export const fetchCreatorAudienceData = async qp => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/creatorAudienceLevel`,
    {
      params: qp || {},
    }
  );
};

export const fetchCreatorTopContent = async qp => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/creatorTopContent`,
    {
      params: qp || {},
    }
  );
};

export const fetchCreatorContentInteractions = async qp => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/contentInteractions`,
    {
      params: qp || {},
    }
  );
};

export const fetchCreatorContentAnalysis = async qp => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/creatorContentAnalysis`,
    {
      params: qp || {},
    }
  );
};

export const fetchCreatorInsightsPage = async qp => {
  return fetcher.get(
    `${config.FANTV_API_URL}/v1/creator/dashboard/creatorInsightPage`,
    {
      params: qp || {},
    }
  );
};
