import config from 'react-native-config';
import {getAuthToken} from '../../utils/authUtils';
import axios from 'axios';

/**
 * Fetch the user's credits from the API
 * @returns {Promise<Object>} The user's credit information
 */
export const fetchUserCredits = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${config.API_BASE_URL}/v1/credits`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};
