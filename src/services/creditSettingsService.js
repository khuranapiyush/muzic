import config from 'react-native-config';

export const fetchCreditSettings = async () => {
  try {
    const response = await fetch(
      `${config.API_BASE_URL}/v1/payments/credit-settings`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch credit settings');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching credit settings:', error);
    throw error;
  }
};
