import fetcher from '../../dataProvider';
import config from 'react-native-config';

const API_BASE_URL = config.API_BASE_URL;

/**
 * Delete a voice recording by ID
 * @param {string} recordingId - The ID of the recording to delete
 * @returns {Promise<Object>} - API response
 */
export const deleteVoiceRecording = async recordingId => {
  if (!recordingId) {
    throw new Error('Recording ID is required');
  }

  try {
    const response = await fetcher.delete(
      `${API_BASE_URL}/v1/voice-recordings/${recordingId}`,
    );
    return response;
  } catch (error) {
    console.error('Error deleting voice recording:', error);
    throw error;
  }
};

/**
 * Get user recordings
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - API response with user recordings
 */
export const getUserRecordings = async userId => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await fetcher.get(
      `${API_BASE_URL}/v1/voice-recordings/user/${userId}`,
    );
    return response;
  } catch (error) {
    console.error('Error fetching user recordings:', error);
    throw error;
  }
};

/**
 * Upload a voice recording
 * @param {FormData} formData - The form data containing the recording file
 * @returns {Promise<Object>} - API response
 */
export const uploadVoiceRecording = async formData => {
  if (!formData) {
    throw new Error('Form data is required');
  }

  try {
    const response = await fetcher.post(
      `${API_BASE_URL}/v1/voice-recordings/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response;
  } catch (error) {
    console.error('Error uploading voice recording:', error);
    throw error;
  }
};
