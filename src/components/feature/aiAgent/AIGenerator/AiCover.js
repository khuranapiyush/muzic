/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ToastAndroid,
  Platform,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GradientBackground from '../../../common/GradientBackground';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import fetcher from '../../../../dataProvider';
import CText from '../../../common/core/Text';
import Clipboard from '@react-native-clipboard/clipboard';
import useMusicPlayer from '../../../../hooks/useMusicPlayer';
import config from 'react-native-config';
import {deleteVoiceRecording} from '../../../../api/voiceRecordings';
import {useSelector, useDispatch} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import useCredits from '../../../../hooks/useCredits';
import {
  setGeneratingSong,
  setGeneratingSongId,
  setShouldRefreshLibrary,
} from '../../../../stores/slices/player';
import {selectCreditsPerSong} from '../../../../stores/selector';
import analyticsUtils from '../../../../utils/analytics';
import mixpanelAnalytics from '../../../../utils/mixpanelAnalytics';
import facebookEvents from '../../../../utils/facebookEvents';
import moEngageService from '../../../../services/moengageService';

import {trackBranchAIEvent} from '../../../../utils/branchUtils';
import appImages from '../../../../resource/images';
import {getAuthToken} from '../../../../utils/authUtils';
import {useMutation} from '@tanstack/react-query';
import {KeyboardAvoidingView} from 'react-native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 32) / 3;

// Helper function to safely display credits
const getCreditsValue = creditsData => {
  if (typeof creditsData === 'object' && creditsData !== null) {
    return creditsData?.data?.balance || 0;
  }
  return typeof creditsData === 'number' ? creditsData : 0;
};

const CoverCreationScreen = () => {
  const [link, setLink] = useState('');
  const [sampleVoice, setSampleVoice] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRecordings, setUserRecordings] = useState([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [isUsingMyVocal, setIsUsingMyVocal] = useState(false);
  const [selectedRecordingFile, setSelectedRecordingFile] = useState(null);
  const [songTitle] = useState('');
  const [artistName] = useState('');

  // Add state for modal visibility
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
    useState(false);
  const [showDeleteBottomSheet, setShowDeleteBottomSheet] = useState(false);
  const [selectedRecordingForDelete, setSelectedRecordingForDelete] =
    useState(null);

  // Get user ID from Redux store
  const {userId} = useSelector(state => state.user);

  // Add global music player hook
  const {play, isPlaying, currentSong, togglePlayPause} =
    useMusicPlayer('AICoverScreen');

  // Add credits hook
  const {credits, handleCreditRequiredAction, refreshCredits} = useCredits();

  // Get the numeric value of credits
  const creditsValue = getCreditsValue(credits);

  // Add useEffect to refresh credits when component mounts
  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const retryAttempts = useRef(0);

  // Add refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add a state to track if recordings have been loaded
  const [recordingsLoaded, setRecordingsLoaded] = useState(false);

  const dispatch = useDispatch();

  const navigation = useNavigation();

  const creditsPerSong = useSelector(selectCreditsPerSong);

  // Add this to check global player visibility
  const {showGlobalPlayer} = useSelector(state => state.player);

  // Add new state for validation modal
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Basic network check function (simplified)
  const checkNetworkConnectivity = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected;
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  }, []);

  // Removed unused validateMediaURL function

  const createVoiceConversion = async () => {
    // Credit check - show modal instead of alert
    if (creditsValue <= 0) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    // Basic connectivity check
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      Alert.alert(
        'Error',
        'No internet connection. Please try again when you are connected.',
      );
      return;
    }

    if (!link) {
      setValidationMessage('Please enter a valid YouTube or Spotify URL');
      setShowValidationModal(true);
      return;
    }

    if (!selectedVoiceId && !selectedRecordingFile) {
      setValidationMessage('Please select a voice first');
      setShowValidationModal(true);
      return;
    }

    // Refresh credits to ensure we have the latest count
    await refreshCredits();

    return handleCreditRequiredAction(async () => {
      setIsLoading(true);
      setShowBottomSheet(true);

      // Set global generating state - this will trigger the library indicator
      dispatch(setGeneratingSong(true));
      // We'll set the song ID after successful generation

      try {
        // Validate authentication token before making the API call
        const currentToken = await getAuthToken();
        if (!currentToken) {
          throw new Error(
            'Authentication token is missing or invalid. Please log in again.',
          );
        }

        // Format request data
        const requestData = {
          url: link.trim(), // Ensure URL is trimmed
          title: songTitle || 'My Cover',
          artist: artistName || 'AI Cover',
        };

        // Validate voice selection and add ID to request data
        if (isUsingMyVocal && selectedRecordingFile) {
          // Using user's own vocal recording
          if (!selectedRecordingFile._id) {
            throw new Error(
              'Invalid recording ID. Please select a different recording.',
            );
          }
          // Send recording ID as voiceModelId
          requestData.voiceModelId = selectedRecordingFile?._id;
        } else if (selectedVoiceId) {
          // Using voice model from the sample catalog
          requestData.voiceModelId = selectedVoiceId;
        } else {
          throw new Error(
            'Please select either a voice model or your own recording.',
          );
        }

        if (!requestData.url || !requestData.voiceModelId) {
          throw new Error('Missing required fields: URL or voice model ID');
        }

        // Make the API request to the url-to-voice endpoint
        const apiUrl = `${config.API_BASE_URL}/v1/integration/url-to-voice`;

        mixpanelAnalytics.trackEvent('button_clicked', {
          screen: 'ai_generator',
          cover_url: link,
          voice_type: isUsingMyVocal ? 'user_vocal' : 'sample_catalog',
          voice_id: requestData.voiceModelId,
          timestamp: Date.now(),
        });

        fetcher
          .post(apiUrl, requestData, {
            headers: {
              'Content-Type': 'application/json',
            },
            // No timeout specified - allows unlimited time for AI voice conversion processing
          })
          .then(async response => {
            // Check if the response is successful and contains expected data
            if (!response.data) {
              throw new Error('Invalid response from server');
            }

            // Store the generated song ID for tracking in the library
            if (response.data._id) {
              dispatch(setGeneratingSongId(response.data._id));
            }

            // Track song creation event for AI Cover
            analyticsUtils.trackCustomEvent('song_created', {
              method: 'ai_cover',
              song_id: response.data._id || 'unknown',
              url: link,
              screen: 'ai_cover',
              title: songTitle || 'My Cover',
              artist: artistName || 'AI Cover',
              voice_type: isUsingMyVocal ? 'user_vocal' : 'sample_catalog',
              voice_id: requestData.voiceModelId,
              timestamp: Date.now(),
            });

            // Mixpanel: cover_created with title, cover_url and thumbnail (if available)
            try {
              const selectedSample = sampleVoice?.find?.(
                v => v?.id === selectedVoiceId,
              );
              const coverThumb = isUsingMyVocal
                ? null
                : selectedSample?.imageUrl || null;
              mixpanelAnalytics.trackEvent('cover_created', {
                cover_title: songTitle || 'My Cover',
                cover_url: link,
                cover_thumbnail_url: coverThumb,
              });
            } catch (_) {}

            // Track song creation with Facebook Events + MoEngage + Branch
            try {
              facebookEvents.logCustomEvent('song_created', {
                method: 'ai_cover',
                song_id: response.data._id || 'unknown',
                screen: 'ai_cover',
                title: songTitle || 'My Cover',
                artist: artistName || 'AI Cover',
                voice_type: isUsingMyVocal ? 'user_vocal' : 'sample_catalog',
              });

              moEngageService.trackEvent('AI_Content_Generated', {
                generation_type: 'cover',
                song_id: response.data._id || 'unknown',
                title: songTitle || 'My Cover',
                artist: artistName || 'AI Cover',
                voice_type: isUsingMyVocal ? 'user_vocal' : 'sample_catalog',
                voice_id: requestData.voiceModelId,
              });

              await trackBranchAIEvent('AI_COVER_GENERATED', {
                song_id: response.data._id || 'unknown',
                voice_type: isUsingMyVocal ? 'user_vocal' : 'sample_catalog',
              });
            } catch (error) {
              // Silent error handling
            }

            // Make sure to refresh credits after successful generation
            setTimeout(() => {
              refreshCredits();
            }, 500);

            // Song generation completed - trigger library refresh
            dispatch(setGeneratingSong(false));
            dispatch(setShouldRefreshLibrary(true));

            return true; // Return true to indicate success
          })
          .catch(error => {
            console.error('Voice conversion request error:', error);

            // Extract error message from response if available
            let errorMessage = 'Failed to create voice conversion';
            if (
              error.response &&
              error.response.data &&
              error.response.data.message
            ) {
              console.log(
                error.response.data.message,
                'error.response.data.message',
              );
              errorMessage = error.response.data.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            // Show error alert
            Alert.alert('Generation Failed', errorMessage);

            // Clear generating state on error
            dispatch(setGeneratingSong(false));
            dispatch(setGeneratingSongId(null));
            return false; // Return false to indicate failure
          });

        return true; // Credit should be deducted
      } catch (error) {
        console.error('Voice conversion failed:', error);

        let errorMessage = error.message || 'Failed to create voice conversion';

        Alert.alert('Error', errorMessage);
        // Clear generating state on error
        dispatch(setGeneratingSong(false));
        dispatch(setGeneratingSongId(null));
        return false; // Return false to indicate failure
      } finally {
        setIsLoading(false);
        retryAttempts.current = 0;
      }
    }, creditsPerSong);
  };

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();

      // Determine URL type
      let urlType = 'unknown';
      if (
        clipboardContent.includes('youtube.com') ||
        clipboardContent.includes('youtu.be')
      ) {
        urlType = 'youtube';
      } else if (clipboardContent.includes('spotify.com')) {
        urlType = 'spotify';
      }

      // Track AI Cover URL paste event
      analyticsUtils.trackAiCoverUrlPaste(urlType, {
        url_length: clipboardContent.length,
      });

      setLink(clipboardContent);

      if (Platform.OS === 'android') {
        ToastAndroid.show('URL pasted from clipboard', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      Alert.alert('Error', 'Could not paste from clipboard');
    }
  };

  const {mutate: fetchUserRecordings} = useMutation(
    useCallback(async () => {
      const token = await getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
      };
      setIsLoadingMore(true);
      setIsLoadingRecordings(true);
      const response = await fetcher.get(
        `${config.API_BASE_URL}/v1/voice-recordings/user/${userId}`,
        {
          headers,
        },
      );
      return response;
    }, [userId]),
    {
      onSuccess: response => {
        if (response) {
          const recordings = response.data?.data || response.data || [];
          setUserRecordings(recordings);
          setRecordingsLoaded(true);
          setIsLoadingRecordings(false);
          setIsLoadingMore(false);
        } else {
          console.warn(
            'Invalid or empty response from library API:',
            response.data,
          );
        }
      },
      onError: error => {
        console.error('Failed to fetch user recordings:', error);
        setIsLoadingRecordings(false); // Ensure loading state is cleared

        // Handle different error types
        if (error.message && error.message.includes('Authentication token')) {
          console.warn(
            'Authentication error while fetching recordings - user may need to re-login',
          );
          // Don't show alert for auth errors to avoid annoying the user
        } else if (isRefreshing) {
          Alert.alert('Error', 'Failed to fetch your voice recordings');
        }
        return [];
      },
    },
  );

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      return;
    }

    try {
      setIsRefreshing(true);

      // Small delay to ensure UI renders the loading indicator
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check network connectivity before refreshing
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        Alert.alert('Network Error', 'No internet connection available');
        return;
      }
      // Run refreshes in parallel for faster loading
      const promises = [
        // Reload voice models
        // getVoiceSamples(1, false),
        // Refresh credits
        refreshCredits(),
      ];

      // Reload user recordings if user is logged in
      if (userId) {
        promises.push(fetchUserRecordings(true));
      }

      await Promise.all(promises);

      // Small delay before finishing to ensure refresh spinner displays properly
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert(
        'Refresh Failed',
        'Could not refresh data. Please try again.',
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [
    checkNetworkConnectivity,
    // getVoiceSamples,
    refreshCredits,
    userId,
    isRefreshing,
    fetchUserRecordings,
  ]);

  const getVoiceSamples = useCallback(
    async (pageNum = 1, shouldAppend = false) => {
      try {
        setIsLoadingMore(true);

        const response = await fetcher.get(
          `${config.API_BASE_URL}/vocal-samples`,
        );

        const newData = response.data?.data || [];
        setSampleVoice(newData);

        return response.data;
      } catch (error) {
        console.error('Failed to fetch voice samples:', error);
        Alert.alert(
          'Error',
          error.customMessage || 'Failed to fetch voice samples',
        );
      } finally {
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    getVoiceSamples(1, false);
    if (userId && !recordingsLoaded) {
      fetchUserRecordings();
    }
  }, [
    userId,
    isRefreshing,
    fetchUserRecordings,
    getVoiceSamples,
    recordingsLoaded,
  ]);

  const handlePlaySample = sample => {
    if (!sample || !sample.previewUrl) {
      Alert.alert('Error', 'No preview available for this voice sample');
      return;
    }

    // Format the sample for the global player
    const formattedSample = {
      id: sample.id,
      title: sample.title || 'Voice Sample',
      artist: sample.artist || 'AI Voice',
      uri: sample.previewUrl || sample.audioUrl,
      thumbnail: sample.imageUrl || 'https://via.placeholder.com/150',
      poster: sample.imageUrl || 'https://via.placeholder.com/300',
      duration: 30, // Assuming samples are around 30 seconds
    };

    // If the same sample is playing, toggle play/pause
    if (currentSong && currentSong.id === sample.id) {
      togglePlayPause();
    } else {
      // Otherwise play the new sample
      play(formattedSample);
    }
  };

  const VocalCard = ({recording}) => {
    const isSelected = !isUsingMyVocal && selectedVoiceId === recording._id;
    const isCurrentlyPlaying =
      currentSong && currentSong.id === recording.id && isPlaying;
    const [imageError, setImageError] = useState(false);

    const hasValidImageUrl =
      recording?.imageUrl && recording.imageUrl.startsWith('http');

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          mixpanelAnalytics.trackEvent('vocal_card_clicked', {
            card_name: 'my_vocals',
            card_id: 'cover_vocal_card',
            recording_id: recording?._id,
            recording_name: recording?.title || 'My Voice',
          });
          if (isSelected) {
            setSelectedVoiceId(null);
          } else {
            setSelectedVoiceId(recording._id);
            setIsUsingMyVocal(false);
            setSelectedRecordingFile(null);
          }

          if (recording.previewUrl) {
            handlePlaySample(recording);
          }
        }}>
        <View
          style={[
            styles.vocalCardContainer,
            isSelected && styles.selectedCardContainer,
          ]}>
          <View style={styles.vocalGradient}>
            <View style={styles.plusContainer}>
              {!hasValidImageUrl || imageError ? (
                <View style={styles.fallbackImageContainer}>
                  <Text style={styles.fallbackImageText}>
                    {recording.title?.charAt(0)?.toUpperCase() || 'V'}
                  </Text>
                </View>
              ) : (
                <Image
                  source={{uri: recording.imageUrl}}
                  style={{width: '100%', height: '100%'}}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              )}
              {isCurrentlyPlaying && (
                <View style={styles.playingOverlay}>
                  <CText style={{color: '#FFF', fontSize: 20}}>▶️</CText>
                </View>
              )}
            </View>
            {isSelected && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.cardText, isSelected && styles.selectedCardText]}>
          {recording.genre}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleDeleteRecording = async recordingId => {
    try {
      const response = await deleteVoiceRecording(recordingId);
      if (response?.status === 200 || response?.data?.success) {
        setUserRecordings(prev => prev.filter(rec => rec._id !== recordingId));
        // Reset selected recording if it was deleted
        if (selectedRecordingFile?._id === recordingId) {
          setIsUsingMyVocal(false);
          setSelectedRecordingFile(null);
        }
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            'Recording deleted successfully',
            ToastAndroid.SHORT,
          );
        } else {
          Alert.alert('Success', 'Recording deleted successfully');
        }
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      Alert.alert('Error', 'Failed to delete recording');
    } finally {
      setShowDeleteBottomSheet(false);
      setSelectedRecordingForDelete(null);
    }
  };

  // User Recordings Card component - New Design
  const UserRecordingCard = ({recording}) => {
    const isSelected =
      isUsingMyVocal && selectedRecordingFile?._id === recording._id;

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
      <View style={styles.myVocalCardContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (isSelected) {
              setIsUsingMyVocal(false);
              setSelectedRecordingFile(null);
            } else {
              setIsUsingMyVocal(true);
              setSelectedRecordingFile(recording);
              setSelectedVoiceId(null);
            }

            try {
              mixpanelAnalytics.trackEvent('recording_card_clicked', {
                card_name: 'recordings',
                card_id: 'cover_recording_card',
                recording_id: recording?._id,
                recording_name: recording?.name || 'My Voice',
              });
            } catch (_) {}
          }}
          style={[
            styles.myVocalCard,
            isSelected && styles.selectedMyVocalCard,
          ]}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.myVocalCardContainer}>
            <View style={styles.vocalVisualizer}>
              <Image
                source={appImages.recordingCardIcon}
                style={styles.recordingCardIcon}
                resizeMode={'cover'}
              />
            </View>
            <View style={styles.recordingDuration}>
              <CText style={styles.durationText}>
                {formatDuration(recording.duration)}
              </CText>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.recordingInfo}>
          <CText
            style={[styles.recordingName, isSelected && styles.selectedText]}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {recording.name || 'My Voice'}
          </CText>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              const audioUrl =
                recording.audioUrl ||
                recording.url ||
                recording.fileUrl ||
                recording.audio_url;

              if (audioUrl) {
                // Validate URL format
                const isValidUrl =
                  audioUrl.startsWith('http://') ||
                  audioUrl.startsWith('https://') ||
                  audioUrl.startsWith('file://');

                if (!isValidUrl) {
                  console.error('Invalid audio URL format:', audioUrl);
                  Alert.alert('Error', 'Invalid audio file URL format');
                  return;
                }

                try {
                  mixpanelAnalytics.trackEvent('recording_played', {
                    recording_duration: recording.duration || 0,
                    recording_url: audioUrl,
                    recording_id: recording._id,
                    source: 'ai_cover',
                  });
                } catch (_) {}

                const songData = {
                  id: recording._id,
                  uri: audioUrl,
                  title: recording.name || 'My Recording',
                  duration: recording.duration || 0,
                };

                if (currentSong && currentSong.id === recording._id) {
                  togglePlayPause();
                } else {
                  play(songData);
                }
              } else {
                console.error('No audio URL found for recording:', recording);
                Alert.alert(
                  'Error',
                  'No audio file available for this recording',
                );
              }
            }}>
            <Image
              source={appImages.playerPlayIcon}
              style={styles.playButtonIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreOptionsButton}
            onPress={() => {
              setSelectedRecordingForDelete(recording);
              setShowDeleteBottomSheet(true);
            }}>
            <CText style={styles.moreOptionsText}>⋯</CText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const MyVocalsSection = () => {
    return (
      <>
        <View style={styles.myVocalHeaderContainer}>
          <View style={styles.myVocalTitleRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={appImages.microphoneIcon}
                style={styles.soundIcon}
              />
              <CText style={styles.myVocalTitle}>My Vocal</CText>
            </View>
            {userRecordings.length > 0 && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => navigation.navigate(ROUTE_NAME.AllRecordings)}>
                <CText style={styles.showAllButtonText}>Show All</CText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.myVocalContent}>
          <View style={styles.myVocalContentContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate(ROUTE_NAME.VoiceRecord);
              }}
              style={styles.addNewRecordingButton}>
              <LinearGradient
                colors={['#2A2A2A', '#1A1A1A']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.addButtonGradient}>
                <View style={styles.addButtonContent}>
                  <View style={styles.addButtonIcon}>
                    <CText style={styles.addButtonPlus}>+</CText>
                  </View>
                  <CText numberOfLines={2} style={styles.addButtonText}>
                    Add New Recording
                  </CText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            {isLoadingRecordings ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#F4A460" />
                <CText style={styles.loadingText}>
                  Loading your recordings...
                </CText>
              </View>
            ) : userRecordings.length > 0 ? (
              <View style={styles.recordingsGrid}>
                {userRecordings.slice(0, 2).map(recording => (
                  <UserRecordingCard
                    key={recording._id}
                    recording={recording}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.noRecordingsContainer}>
                <CText style={styles.noRecordingsText}>
                  You don't have any recordings yet.
                </CText>
              </View>
            )}
          </View>
        </View>

        <View style={{...styles.vocalTitleContainer}}>
          <Image source={appImages.soundIcon} style={styles.soundIcon} />
          <Text style={[styles.sectionTitle, styles.vocalTitle]}>Vocals</Text>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <SafeAreaView
        style={[styles.container, {backgroundColor: 'transparent'}]}>
        <GradientBackground>
          <View style={[styles.content, {backgroundColor: 'transparent'}]}>
            <View style={styles.headerSection}>
              <View style={styles.titleContainer}>
                <Text style={styles.pageHeader}>Youtube/Spotify Link</Text>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Paste Youtube/Spotify Link"
                  placeholderTextColor="#666"
                  value={link}
                  onChangeText={setLink}
                />
                <TouchableOpacity
                  style={styles.pasteButton}
                  onPress={handlePaste}
                  activeOpacity={0.8}>
                  <Text style={styles.pasteButtonText}>✨ Paste</Text>
                </TouchableOpacity>
              </View>
              {/* <View style={styles.creditsContainer}>
              <Text style={styles.creditsText}>
                Songs Left: {Math.floor(creditsValue / creditsPerSong)}
              </Text>
            </View> */}
            </View>

            {/* Vocals Section */}
            <View style={styles.listContainer}>
              {isLoadingMore ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#F4A460" />
                  <Text style={styles.loadingText}>Loading voices...</Text>
                </View>
              ) : (
                <FlatList
                  data={sampleVoice}
                  ListHeaderComponent={MyVocalsSection}
                  renderItem={({item}) => <VocalCard recording={item} />}
                  keyExtractor={item => item._id}
                  numColumns={3}
                  contentContainerStyle={[styles.vocalsContainerGrid]}
                  showsVerticalScrollIndicator={true}
                  columnWrapperStyle={styles.row}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#F4A460']}
                      tintColor="#F4A460"
                      title="Pull to refresh"
                      titleColor="#F4A460"
                    />
                  }
                  scrollEnabled={true}
                  initialNumToRender={9}
                  maxToRenderPerBatch={6}
                  windowSize={10}
                  removeClippedSubviews={false}
                />
              )}
            </View>
          </View>

          <View
            style={[styles.buttonContainer, showGlobalPlayer && {bottom: 90}]}>
            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={createVoiceConversion}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.20)',
                  'rgba(255, 255, 255, 0.40)',
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradient}>
                <CText
                  style={[
                    styles.createButtonText,
                    isLoading && styles.disabledButtonText,
                  ]}>
                  {isLoading ? 'Creating...' : 'Create Cover'}
                </CText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showBottomSheet}
            onRequestClose={() => setShowBottomSheet(false)}
            onBackdropPress={() => setShowBottomSheet(false)}
            onBackButtonPress={() => setShowBottomSheet(false)}
            swipeDirection={['down']}
            propagateSwipe
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            avoidKeyboard={true}>
            <View style={styles.bottomSheetContainer}>
              <View style={styles.bottomSheetContent}>
                <CText size="largeBold" style={styles.bottomSheetTitle}>
                  Cover Generation Started
                </CText>
                <CText style={styles.bottomSheetText}>
                  Your cover will be generated in 10-15 mins. Come back and
                  check in the library.
                </CText>
                <TouchableOpacity
                  style={styles.bottomSheetButton}
                  onPress={() => setShowBottomSheet(false)}>
                  <LinearGradient
                    colors={['#F4A460', '#DEB887']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={styles.gradient}>
                    <CText style={styles.bottomSheetButtonText}>Got it</CText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Delete Recording Bottom Sheet */}
          {showDeleteBottomSheet && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showDeleteBottomSheet}
              onRequestClose={() => {
                setShowDeleteBottomSheet(false);
                setSelectedRecordingForDelete(null);
              }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  setShowDeleteBottomSheet(false);
                  setSelectedRecordingForDelete(null);
                }}>
                <View style={styles.deleteModalOverlay}>
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={styles.deleteBottomSheetContent}>
                      <View style={styles.deleteBottomSheetHandle} />
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          handleDeleteRecording(selectedRecordingForDelete?._id)
                        }>
                        <CText style={styles.deleteButtonText}>
                          🗑 Delete Recording
                        </CText>
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          )}

          {/* Insufficient Credits Modal */}
          {showInsufficientCreditsModal && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showInsufficientCreditsModal}
              onRequestClose={() => setShowInsufficientCreditsModal(false)}>
              <TouchableWithoutFeedback
                onPress={() => setShowInsufficientCreditsModal(false)}>
                <View style={styles.bottomSheetOverlay}>
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={styles.bottomSheetContainer}>
                      <View style={styles.bottomSheetContent}>
                        <CText size="largeBold" style={styles.bottomSheetTitle}>
                          Insufficient Credits
                        </CText>
                        <CText style={styles.bottomSheetText}>
                          Please buy some credits to generate cover
                        </CText>
                        <TouchableOpacity
                          style={styles.bottomSheetButton}
                          onPress={() => {
                            setShowInsufficientCreditsModal(false);
                            navigation.navigate(
                              ROUTE_NAME.RecurringSubscriptionScreen,
                            );
                          }}>
                          <LinearGradient
                            colors={['#F4A460', '#DEB887']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.gradient}>
                            <CText style={styles.bottomSheetButtonText}>
                              Buy Credits
                            </CText>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          )}

          {/* Validation Modal */}
          {showValidationModal && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showValidationModal}
              onRequestClose={() => setShowValidationModal(false)}>
              <TouchableWithoutFeedback
                onPress={() => setShowValidationModal(false)}>
                <View style={styles.bottomSheetOverlay}>
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View style={styles.bottomSheetContainer}>
                      <View style={styles.bottomSheetContent}>
                        <CText size="largeBold" style={styles.bottomSheetTitle}>
                          {!link
                            ? 'Missing Link'
                            : !selectedVoiceId && !selectedRecordingFile
                            ? 'Missing Voice'
                            : ''}
                        </CText>
                        <CText style={styles.bottomSheetText}>
                          {validationMessage}
                        </CText>
                        <TouchableOpacity
                          style={styles.bottomSheetButton}
                          onPress={() => setShowValidationModal(false)}>
                          <LinearGradient
                            colors={['#F4A460', '#DEB887']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.gradient}>
                            <CText style={styles.bottomSheetButtonText}>
                              Got it
                            </CText>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          )}
        </GradientBackground>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 90,
  },
  headerSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F2F2F2',
    lineHeight: 24,
    paddingVertical: 5,
    fontFamily: 'Inter',
    letterSpacing: -0.8,
    textTransform: 'capitalize',
  },
  pageHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F2F2F2',
    paddingVertical: 5,
    fontFamily: 'Inter',
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#403F3F',
    backgroundColor: '#1E1E1E',
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 60,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  pasteButton: {
    borderRadius: 20,
    backgroundColor: '#F4A460',
    paddingHorizontal: 20,
    boxShadow: '0 0 1px 0 #DEB887',
    paddingVertical: 10,
    marginRight: 8,
  },
  pasteButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    tintColor: '#000',
    fontFamily: 'Inter',
  },
  vocalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vocalTitle: {
    marginBottom: 0,
    color: '#F2F2F2',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  vocalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  vocalCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 5,
  },
  recordingCard: {
    borderWidth: 2,
    borderColor: '#F4A460',
    zIndex: 999999,
  },
  plusContainer: {
    width: '100%',
    height: '100%',
    // borderRadius: 20,
    // backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: 8,
    overflow: 'hidden',
  },
  plusIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  cardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 999,
  },
  createButton: {
    width: '100%',
    height: 56,
    overflow: 'hidden',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#A84D0C',
    backgroundColor: '#FC6C14',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFF',
    borderStyle: 'solid',
    backgroundColor: '#FC6C14',
    boxShadow: '0 0 14px 0 #FFDBC5 inset',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    ...(Platform.OS === 'ios' ? {paddingBottom: 3} : {}),
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  vocalCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    width: CARD_WIDTH,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#1E1E1E',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#564A3F',
    zIndex: 999,
  },
  vocalGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  vocalsContainerGrid: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    paddingBottom: 160, // Extra padding for the create button
    flexGrow: 1, // Ensure content expands to fill available space
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedCardContainer: {
    borderWidth: 2,
    borderColor: '#F4A460',
    borderRadius: 12,
  },
  selectedCardText: {
    color: '#F4A460',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F4A460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRecordingsContainer: {
    marginBottom: 16,
    minHeight: 130, // Ensure enough height for content
  },
  userRecordingsContent: {
    paddingRight: 16,
  },
  noRecordingsContainer: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  noRecordingsText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 21,
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 21,
  },
  addRecordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  plusButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addRecordingText: {
    color: '#FFF',
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingMoreText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  creditsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 10,
  },
  creditsText: {
    color: '#959595',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 24,
  },
  playingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  playingIcon: {
    width: 24,
    height: 24,
  },
  fallbackImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A2F28',
    overflow: 'hidden',
  },
  fallbackImageText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  bottomSheetTitle: {
    color: '#FDF5E6',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomSheetText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  bottomSheetButton: {
    width: '100%',
    height: 60,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#C87D48',
  },
  bottomSheetButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },

  myVocalHeaderContainer: {
    marginBottom: 16,
  },
  myVocalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myVocalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F2F2F2',
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  showAllButton: {
    // backgroundColor: 'rgba(244, 164, 96, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    // borderWidth: 1,
    // borderColor: '#F4A460',
  },
  showAllButtonText: {
    color: '#F4A460',
    fontSize: 12,
    fontWeight: '600',
  },
  myVocalContent: {
    marginBottom: 10,
  },
  addNewRecordingButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    display: 'flex',
    height: 120,
    width: CARD_WIDTH,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    aspectRatio: 1,
    marginBottom: 5,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#2A2A2A',
    backgroundColor: '#1E1E1E',
  },
  addButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  addButtonIcon: {
    borderRadius: 20,
    backgroundColor: '#0F0F11',
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  addButtonPlus: {
    color: '#FC6C14',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#FFF',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  recordingsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginLeft: 10,
  },
  myVocalCardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  myVocalCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
    width: CARD_WIDTH,
    height: 120,
  },
  selectedMyVocalCard: {
    borderColor: '#F4A460',
    borderWidth: 2,
  },
  vocalVisualizer: {
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#555',
    margin: 1,
  },
  recordingIconOverlay: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4A460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIcon: {
    fontSize: 18,
    color: '#000',
  },
  playingIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingText: {
    fontSize: 10,
    color: '#FFF',
  },
  recordingDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 6,
    // paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    // paddingVertical: 4,
  },
  recordingName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  selectedText: {
    color: '#F4A460',
  },
  playButton: {
    padding: 4,
    marginRight: 4,
  },
  playButtonText: {
    color: '#F4A460',
    fontSize: 12,
    fontWeight: '600',
  },
  moreOptionsButton: {
    padding: 4,
  },
  moreOptionsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    lineHeight: 24,
    letterSpacing: -0.8,
    textTransform: 'capitalize',
    textAlign: 'center',
    transform: [{rotate: '90deg'}],
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  deleteBottomSheetContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 10,
  },
  deleteBottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  deleteButton: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#B0B0B0',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    fontFamily: 'Inter',
  },
  myVocalContentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recordingCardIcon: {
    width: 120,
    height: 120,
  },
  soundIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  playButtonIcon: {
    width: 20,
    height: 20,
  },
});

export default CoverCreationScreen;
