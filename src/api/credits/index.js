import config from 'react-native-config';
import {makeAuthenticatedRequest} from '../../utils/authUtils';
import fetcher from '../../dataProvider';

/**
 * Fetch the user's credits from the API
 * @returns {Promise<Object>} The user's credit information
 */
export const fetchUserCredits = async () => {
  try {
    // Use the makeAuthenticatedRequest wrapper to handle token validation and refresh
    return await makeAuthenticatedRequest(async () => {
      const response = await fetcher.get(`${config.API_BASE_URL}/v1/credits`);
      return response.data;
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};
