import {getAuthToken} from '../utils/authUtils';
import config from 'react-native-config';

export const getUserCredits = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${config.API_BASE_URL}/v1/credits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user credits');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};
