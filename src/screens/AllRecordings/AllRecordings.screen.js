import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import GradientBackground from '../../components/common/GradientBackground';
import CText from '../../components/common/core/Text';

import {useSelector} from 'react-redux';
import useMusicPlayer from '../../hooks/useMusicPlayer';
import getStyles from './AllRecordings.style';
import {useTheme} from '@react-navigation/native';
import {
  deleteVoiceRecording,
  getUserRecordings,
} from '../../api/voiceRecordings';
import {Image} from 'react-native-elements';
import appImages from '../../resource/images';
import mixpanelAnalytics from '../../utils/mixpanelAnalytics';

// RecordingCard component - moved outside to avoid recreation on every render
const RecordingCard = ({
  recording,
  styles,
  currentSong,
  isPlaying,
  handleRecordingPress,
  handleLongPress,
  formatDuration,
}) => {
  const isCurrentlyPlaying =
    currentSong && currentSong.id === recording._id && isPlaying;

  return (
    <TouchableOpacity
      style={styles.recordingCard}
      onPress={() => handleRecordingPress(recording)}
      onLongPress={() => handleLongPress(recording)}
      activeOpacity={0.7}>
      <LinearGradient
        colors={['#2A2A2A', '#1A1A1A']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardGradient}>
        <View style={styles.recordingInfo}>
          <View style={styles.recordingIconContainer}>
            <View style={styles.recordingIcon}>
              <CText style={styles.micIcon}>🎤</CText>
            </View>
            {isCurrentlyPlaying && (
              <View style={styles.playingIndicator}>
                <CText style={styles.playingText}>▶️</CText>
              </View>
            )}
          </View>

          <View style={styles.recordingDetails}>
            <CText style={styles.recordingName} numberOfLines={1}>
              {recording.name || 'My Recording'}
            </CText>
            <CText style={styles.recordingDuration}>
              {formatDuration(recording.duration)}
            </CText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreOptionsButton}
          onPress={() => handleLongPress(recording)}>
          <CText style={styles.moreOptionsText}>⋯</CText>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// EmptyState component - moved outside to avoid recreation on every render
const EmptyState = ({styles, isError = false}) => (
  <View style={styles.emptyContainer}>
    <CText style={styles.emptyTitle}>
      {isError ? 'Unable to Load Recordings' : 'No Recordings Yet'}
    </CText>
    <CText style={styles.emptySubtitle}>
      {isError
        ? 'There was an issue loading your recordings. Pull down to refresh or try again later.'
        : "You haven't created any voice recordings yet. Go back and create your first recording!"}
    </CText>
  </View>
);

const AllRecordingsScreen = () => {
  const [userRecordings, setUserRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingRecording, setIsDeletingRecording] = useState(false);

  const navigation = useNavigation();
  const {mode} = useTheme();
  const styles = getStyles(mode);
  const {userId} = useSelector(state => state.user);
  const {play, isPlaying, currentSong, togglePlayPause} = useMusicPlayer(
    'AllRecordingsScreen',
  );

  // Create empty state component to avoid inline component creation
  const renderEmptyComponent = useCallback(
    () => <EmptyState styles={styles} isError={hasLoadingError} />,
    [styles, hasLoadingError],
  );

  const loadRecordings = useCallback(async () => {
    try {
      // Reset error state on new load
      setHasLoadingError(false);

      // Only attempt to load recordings if userId exists
      if (!userId) {
        console.log('No user ID available, skipping recording load');
        setUserRecordings([]);
        setHasLoadingError(true);
        return;
      }

      const response = await getUserRecordings(userId);

      if (response?.status === 200 && response?.data?.success) {
        setUserRecordings(response.data.data || []);
        setHasLoadingError(false);
      } else if (response?.status === 200) {
        // API responded successfully but with different structure
        setUserRecordings([]);
        setHasLoadingError(false);
      }
    } catch (error) {
      console.error('Error loading recordings:', error);

      // Handle specific error cases
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.message || 'Unknown error';

        switch (statusCode) {
          case 404:
            console.log(
              'Recording endpoint not found or user has no recordings',
            );
            setUserRecordings([]); // Set empty array for 404
            setHasLoadingError(false); // 404 is not really an error for user experience
            break;
          case 401:
          case 403:
            console.log(
              `User authentication/authorization issue (${statusCode})`,
            );
            setUserRecordings([]);
            setHasLoadingError(true);
            break;
          case 500:
            console.error(
              'Server error while loading recordings:',
              errorMessage,
            );
            setUserRecordings([]);
            setHasLoadingError(true);
            break;
          default:
            console.error(`Unexpected error (${statusCode}):`, errorMessage);
            setUserRecordings([]);
            setHasLoadingError(true);
        }
      } else if (error.request) {
        // Network error
        console.error('Network error while loading recordings');
        setUserRecordings([]);
        setHasLoadingError(true);
      } else {
        // Other error
        console.error(
          'Unexpected error while loading recordings:',
          error.message,
        );
        setUserRecordings([]);
        setHasLoadingError(true);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadRecordings();
  }, [loadRecordings]);

  const handleDeleteRecording = useCallback(async () => {
    if (!selectedRecording) {
      return;
    }

    setIsDeletingRecording(true);
    try {
      const response = await deleteVoiceRecording(selectedRecording._id);
      if (response?.status === 200 || response?.data?.success) {
        try {
          mixpanelAnalytics.trackEvent('recording_deleted', {
            recording_duration: selectedRecording?.duration || 0,
            recording_url:
              selectedRecording?.audioUrl ||
              selectedRecording?.url ||
              selectedRecording?.fileUrl ||
              selectedRecording?.audio_url ||
              '',
            recording_id: selectedRecording?._id,
            source: 'all_recordings',
          });
        } catch (_) {}
        setUserRecordings(prev =>
          prev.filter(rec => rec._id !== selectedRecording._id),
        );
        Alert.alert('Success', 'Recording deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete recording');
      }
    } catch (error) {
      console.error('Error deleting recording:', error);

      // Handle specific delete errors
      let errorMessage = 'Failed to delete recording';

      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 404:
            errorMessage = 'Recording not found or already deleted';
            break;
          case 401:
            errorMessage = 'You are not authorized to delete this recording';
            break;
          case 403:
            errorMessage =
              'You do not have permission to delete this recording';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later';
            break;
          default:
            errorMessage = `Delete failed (Error ${statusCode})`;
        }
      } else if (error.request) {
        errorMessage =
          'Network error. Please check your connection and try again';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsDeletingRecording(false);
      setShowDeleteModal(false);
      setSelectedRecording(null);
    }
  }, [selectedRecording]);

  const handleRecordingPress = useCallback(
    recording => {
      if (recording.audioUrl) {
        try {
          mixpanelAnalytics.trackEvent('recording_played', {
            recording_duration: recording.duration || 0,
            recording_url: recording.audioUrl,
            recording_id: recording._id,
            source: 'all_recordings',
          });
        } catch (_) {}
        const songData = {
          id: recording._id,
          uri: recording.audioUrl,
          title: recording.name || 'My Recording',
          duration: recording.duration || 0,
        };

        if (currentSong && currentSong.id === recording._id) {
          togglePlayPause();
        } else {
          play(songData);
        }
      }
    },
    [currentSong, play, togglePlayPause],
  );

  const handleLongPress = useCallback(recording => {
    setSelectedRecording(recording);
    setShowDeleteModal(true);
  }, []);

  const formatDuration = duration => {
    if (!duration) {
      return '00:00';
    }
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <GradientBackground>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Image
                source={appImages.arrowLeftIcon}
                style={styles.backArrowIcon}
              />
            </TouchableOpacity>
            <CText style={styles.headerTitle}>My Recordings</CText>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4A460" />
              <CText style={styles.loadingText}>Loading recordings...</CText>
            </View>
          ) : (
            <FlatList
              data={userRecordings}
              renderItem={({item}) => (
                <RecordingCard
                  recording={item}
                  styles={styles}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  handleRecordingPress={handleRecordingPress}
                  handleLongPress={handleLongPress}
                  formatDuration={formatDuration}
                />
              )}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#F4A460']}
                  tintColor="#F4A460"
                />
              }
              ListEmptyComponent={renderEmptyComponent}
            />
          )}
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <CText style={styles.modalTitle}>Delete Recording</CText>
              <CText style={styles.modalMessage}>
                Are you sure you want to delete "
                {selectedRecording?.name || 'this recording'}"? This action
                cannot be undone.
              </CText>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isDeletingRecording}>
                  <CText style={styles.cancelButtonText}>Cancel</CText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeleteRecording}
                  disabled={isDeletingRecording}>
                  {isDeletingRecording ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <CText style={styles.deleteButtonText}>Delete</CText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </GradientBackground>
    </SafeAreaView>
  );
};

export default AllRecordingsScreen;
