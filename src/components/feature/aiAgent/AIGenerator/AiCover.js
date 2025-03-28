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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import fetcher from '../../../../dataProvider';
import {FlatList} from 'react-native-gesture-handler';
import CText from '../../../common/core/Text';
import Clipboard from '@react-native-clipboard/clipboard';
import useMusicPlayer from '../../../../hooks/useMusicPlayer';
import config from 'react-native-config';
import {getAuthToken} from '../../../../utils/authUtils';
import {useSelector} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 32) / 3;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

const CoverCreationScreen = () => {
  const [link, setLink] = useState('');
  const [sampleVoice, setSampleVoice] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  // const [isRecordVoiceSelected, setIsRecordVoiceSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRecordings, setUserRecordings] = useState([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
  const [isUsingMyVocal, setIsUsingMyVocal] = useState(false);
  const [selectedRecordingFile, setSelectedRecordingFile] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [apiRequestStatus, setApiRequestStatus] = useState({
    lastAttempt: null,
    lastError: null,
    debugMode: false,
  });

  // State for managing conversions
  const [conversions, setConversions] = useState([]);

  // Add state for modal visibility
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Get user ID from Redux store
  const {userId} = useSelector(state => state.user);

  // Add global music player hook
  const {play, isPlaying, currentSong, togglePlayPause} =
    useMusicPlayer('AICoverScreen');

  // Add pagination states
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const PAGE_SIZE = 9; // Number of items to load per page

  const [networkStatus, setNetworkStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const retryAttempts = useRef(0);

  // Add refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add network state listener
  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state changed:', state);
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });

      // If connection is restored and we were previously disconnected, show a message
      if (state.isConnected && !networkStatus.isConnected) {
        Alert.alert(
          'Connection Restored',
          'Your internet connection has been restored.',
        );
      }
    });

    // Check current network state on mount
    NetInfo.fetch().then(state => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [networkStatus.isConnected]);

  // Enhanced network check function
  const checkNetworkConnectivity = useCallback(async () => {
    try {
      // Update last attempt timestamp
      setApiRequestStatus(prev => ({
        ...prev,
        lastAttempt: new Date().toISOString(),
      }));

      // First check the current network state from our stored state
      if (!networkStatus.isConnected) {
        const errorMsg =
          'You appear to be offline. Please check your internet connection and try again.';
        setApiRequestStatus(prev => ({
          ...prev,
          lastError: errorMsg,
        }));
        throw new Error(errorMsg);
      }

      // Double-check with a fresh fetch for the most up-to-date status
      const state = await NetInfo.fetch();

      if (!state.isConnected) {
        const errorMsg =
          'You appear to be offline. Please check your internet connection and try again.';
        setApiRequestStatus(prev => ({
          ...prev,
          lastError: errorMsg,
        }));
        throw new Error(errorMsg);
      }

      // If connected but not internet reachable, try to ping a reliable server
      if (state.isConnected && state.isInternetReachable === false) {
        try {
          // Use a small timeout to quickly test connectivity
          await axios.get('https://www.google.com', {timeout: 3000});
        } catch (e) {
          const errorMsg =
            'Internet connection appears to be unstable. Please check your connection and try again.';
          setApiRequestStatus(prev => ({
            ...prev,
            lastError: errorMsg,
          }));
          throw new Error(errorMsg);
        }
      }

      // Reset error state when network is good
      setApiRequestStatus(prev => ({
        ...prev,
        lastError: null,
      }));

      return true;
    } catch (error) {
      console.error('Network connectivity check failed:', error);
      Alert.alert(
        'Network Error',
        error.message ||
          'Network connection failed. Please check your internet connection and try again.',
      );
      return false;
    }
  }, [networkStatus.isConnected]);

  // Enhanced retry mechanism
  const retryRequestWithBackoff = async requestFn => {
    setIsRetrying(true);
    try {
      retryAttempts.current += 1;
      console.log(
        `Retry attempt ${retryAttempts.current}/${MAX_RETRY_ATTEMPTS}`,
      );

      // Wait with exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, retryAttempts.current - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check network before retrying
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        throw new Error('Still offline. Please check your connection.');
      }

      return await requestFn();
    } catch (error) {
      if (retryAttempts.current < MAX_RETRY_ATTEMPTS) {
        return retryRequestWithBackoff(requestFn);
      } else {
        retryAttempts.current = 0;
        throw error;
      }
    } finally {
      if (retryAttempts.current >= MAX_RETRY_ATTEMPTS) {
        retryAttempts.current = 0;
        setIsRetrying(false);
      }
    }
  };

  const createVoiceConversion = async () => {
    if (!selectedVoiceId && !selectedRecordingFile) {
      Alert.alert('Error', 'Please select a voice first');
      return;
    }

    if (!link) {
      Alert.alert('Error', 'Please provide a YouTube/Spotify link');
      return;
    }

    // Reset API request status
    setApiRequestStatus({
      lastAttempt: new Date().toISOString(),
      lastError: null,
      debugMode: apiRequestStatus.debugMode,
    });

    console.log('Starting voice conversion with:');
    console.log('- Link:', link);
    console.log(
      '- Voice Model ID:',
      selectedVoiceId || 'Not using voice model',
    );
    console.log('- Using My Vocal:', isUsingMyVocal);
    console.log(
      '- Recording File ID:',
      selectedRecordingFile?._id || 'Not using recording',
    );

    try {
      setIsLoading(true);

      // Enhanced network connectivity check
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        setIsLoading(false);
        return;
      }

      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        const errorMsg = 'Authentication required. Please log in again.';
        setApiRequestStatus(prev => ({
          ...prev,
          lastError: errorMsg,
        }));
        throw new Error(errorMsg);
      }

      // Format request data
      const requestData = {
        url: link,
        title: songTitle || 'My Cover',
        artist: artistName || 'AI Cover',
      };

      // Validate voice selection and add ID to request data
      if (isUsingMyVocal && selectedRecordingFile) {
        // Using user's own vocal recording
        if (!selectedRecordingFile._id) {
          const errorMsg =
            'Invalid recording ID. Please select a different recording.';
          setApiRequestStatus(prev => ({
            ...prev,
            lastError: errorMsg,
          }));
          throw new Error(errorMsg);
        }
        console.log('Using user recording with ID:', selectedRecordingFile._id);
        requestData.voiceRecordingId = selectedRecordingFile._id;
      } else if (selectedVoiceId) {
        // Using voice model from the sample catalog
        if (!selectedVoiceId) {
          const errorMsg =
            'Invalid voice model ID. Please select a different voice.';
          setApiRequestStatus(prev => ({
            ...prev,
            lastError: errorMsg,
          }));
          throw new Error(errorMsg);
        }
        console.log('Using voice model with ID:', selectedVoiceId);
        requestData.voiceModelId = selectedVoiceId;
      } else {
        const errorMsg =
          'Please select either a voice model or your own recording.';
        setApiRequestStatus(prev => ({
          ...prev,
          lastError: errorMsg,
        }));
        throw new Error(errorMsg);
      }

      // Log the complete request data for debugging
      console.log('API Request Data:', JSON.stringify(requestData, null, 2));

      // Show bottom sheet modal instead of alert
      setShowBottomSheet(true);

      // Reset form immediately for better UX
      setLink('');
      setSongTitle('');
      setArtistName('');
      setSelectedVoiceId(null);
      setSelectedRecordingFile(null);
      setIsUsingMyVocal(false);

      // Now make the API request in the background
      const apiUrl = `${config.API_BASE_URL}/v1/integration/url-to-voice`;
      console.log(`Making API request to: ${apiUrl}`);

      fetcher
        .post(apiUrl, requestData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 300000, // Increased timeout to 5 minutes (300,000ms)
        })
        .then(response => {
          console.log('Voice conversion API response status:', response.status);
          console.log(
            'Voice conversion response data:',
            JSON.stringify(response.data, null, 2),
          );

          // Clear any error state on success
          setApiRequestStatus(prev => ({
            ...prev,
            lastError: null,
          }));

          console.log('Cover generation request successful');
        })
        .catch(error => {
          console.error('Voice conversion request error:', error);
          // We don't show errors to the user here since we've already shown the success message
          // Just log them for debugging

          setApiRequestStatus(prev => ({
            ...prev,
            lastError: error.message || 'Unknown API error',
          }));
        });
    } catch (error) {
      console.error('Voice conversion failed:', error);

      let errorMessage = 'Failed to create voice conversion';

      // Determine the appropriate error message
      if (
        error.message === 'Network Error' ||
        error.customMessage?.includes('Network connection failed')
      ) {
        errorMessage =
          'Network connection failed. Please check your internet connection and try again.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage =
          'Request timed out. The server took too long to respond. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.customMessage) {
        errorMessage = error.customMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Store the error message in state for debug display
      setApiRequestStatus(prev => ({
        ...prev,
        lastError: errorMessage,
      }));

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
      retryAttempts.current = 0;
    }
  };

  const navigation = useNavigation();

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      console.log(clipboardContent, 'clipboard');
      setLink(clipboardContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const API_TOKEN = 'w8TOqTQD.HDIa0GVr6XlSFBbp4HIztEGj';

  // Fetch user's voice recordings
  const fetchUserRecordings = useCallback(async () => {
    try {
      setIsLoadingRecordings(true);

      // Check for internet connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error(
          'No internet connection. Please try again when you are connected.',
        );
      }

      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Make API request using fetcher instead of axios
      const response = await fetcher.get(
        `${config.API_BASE_URL}/v1/voice-recordings/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Handle the response properly - check both data and data.data
      const recordings = response.data?.data || response.data || [];
      setUserRecordings(recordings);
    } catch (error) {
      console.error('Failed to fetch user recordings:', error);
      Alert.alert('Error', 'Failed to fetch your voice recordings');
    } finally {
      setIsLoadingRecordings(false);
    }
  }, [userId]);

  const getVoiceSamples = useCallback(
    async (pageNum = 1, shouldAppend = false) => {
      try {
        setIsLoadingMore(true);

        // Add pagination parameters to the API call
        // For external API, we might still need to use fetch
        const response = await fetch(
          `https://arpeggi.io/api/kits/v1/voice-models?page=${pageNum}&limit=${PAGE_SIZE}`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          },
        );

        const responseData = await response.json();
        const newData = responseData.data || [];

        // Check if we have more data to load
        if (newData.length < PAGE_SIZE) {
          setHasMoreData(false);
        }

        // Update state based on whether we're appending or replacing
        if (shouldAppend) {
          setSampleVoice(prevData => [...prevData, ...newData]);
        } else {
          setSampleVoice(newData);
        }

        return responseData;
      } catch (error) {
        console.error('Failed to fetch voice samples:', error);
        Alert.alert('Error', 'Failed to fetch voice samples');
      } finally {
        setIsLoadingMore(false);
      }
    },
    [API_TOKEN, PAGE_SIZE],
  );

  // Load more data when user reaches end of list
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      getVoiceSamples(nextPage, true);
    }
  }, [isLoadingMore, hasMoreData, page, getVoiceSamples]);

  // Initial data load
  useEffect(() => {
    getVoiceSamples(1, false);
    if (userId) {
      fetchUserRecordings();
    }
  }, [userId, fetchUserRecordings, getVoiceSamples]);

  // Handler for playing voice samples with improved logging
  const handlePlaySample = sample => {
    if (!sample || !sample.previewUrl) {
      Alert.alert('Error', 'No preview available for this voice sample');
      return;
    }

    console.log('Selected voice sample:', {
      id: sample.id,
      title: sample.title,
      previewUrl: sample.previewUrl,
    });

    // Format the sample for the global player
    const formattedSample = {
      id: sample.id,
      title: sample.title || 'Voice Sample',
      artist: sample.artist || 'AI Voice',
      uri: sample.previewUrl,
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

  // Handler for playing user recordings
  const handlePlayRecording = recording => {
    if (!recording) {
      Alert.alert('Error', 'No audio available for this recording');
      return;
    }

    // Format the recording for the global player
    const formattedRecording = {
      id: recording._id,
      title: recording.name || 'My Recording',
      artist: 'My Voice',
      uri: recording.audioUrl,
      thumbnail: 'https://via.placeholder.com/150', // Use a default image
      poster: 'https://via.placeholder.com/300',
      duration: recording.duration || 30,
    };

    // If the same recording is playing, toggle play/pause
    if (currentSong && currentSong.id === recording._id) {
      togglePlayPause();
    } else {
      // Otherwise play the new recording
      play(formattedRecording);
    }
  };

  // Handler for playing generated songs
  const handlePlayGeneratedSong = useCallback(
    conversion => {
      if (!conversion || !conversion.outputUrl) {
        Alert.alert('Error', 'This song is not available to play');
        return;
      }

      // Format the song for the global player
      const formattedSong = {
        id: conversion.id,
        title: conversion.title || 'AI Cover',
        artist: conversion.artist || 'AI Generated',
        uri: conversion.outputUrl,
        thumbnail: conversion.imageUrl || 'https://via.placeholder.com/150',
        poster: conversion.imageUrl || 'https://via.placeholder.com/300',
        duration: conversion.duration || 180, // Default to 3 mins if unknown
      };

      // If the same song is playing, toggle play/pause
      if (currentSong && currentSong.id === conversion.id) {
        togglePlayPause();
      } else {
        // Otherwise play the new song
        play(formattedSong);
      }
    },
    [currentSong, play, togglePlayPause],
  );

  // Add useEffect to fetch existing conversions on component load
  useEffect(() => {
    const fetchExistingConversions = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const response = await fetcher.get(
          `${config.API_BASE_URL}/v1/integration/user-conversions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('Existing conversions:', response.data);

        if (response.data?.data) {
          // Transform the data to match our expected format
          const existingConversions = response.data.data.map(conversion => ({
            id: conversion._id || conversion.id,
            title: conversion.title || 'AI Cover',
            artist: conversion.artist || 'AI Generated',
            status: conversion.outputUrl ? 'success' : 'processing',
            outputUrl: conversion.outputUrl || conversion.audioUrl || null,
            imageUrl: conversion.imageUrl || conversion.coverArt || null,
            createdAt: conversion.createdAt || new Date().toISOString(),
            // Include all other data
            ...conversion,
          }));

          setConversions(existingConversions);
        }
      } catch (error) {
        console.error('Failed to fetch existing conversions:', error);
        // No need to alert the user about this error
      }
    };

    // Uncomment this line if the API endpoint is available
    // fetchExistingConversions();
  }, []);

  // Add refresh handler to refresh both voice models and user recordings
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);

      console.log('Pulling to refresh data...');

      // Check network connectivity before refreshing
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        setIsRefreshing(false);
        return;
      }

      // Reset pagination
      setPage(1);

      // Reload voice models
      await getVoiceSamples(1, false);

      // Reload user recordings if user is logged in
      if (userId) {
        await fetchUserRecordings();
      }

      // Clear any error states
      setApiRequestStatus(prev => ({
        ...prev,
        lastError: null,
      }));

      console.log('Refresh completed successfully');
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
    getVoiceSamples,
    fetchUserRecordings,
    userId,
    setPage,
    setApiRequestStatus,
  ]);

  const VocalCard = ({recording}) => {
    const isSelected = !isUsingMyVocal && selectedVoiceId === recording.id;
    const isCurrentlyPlaying =
      currentSong && currentSong.id === recording.id && isPlaying;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (isSelected) {
            setSelectedVoiceId(null);
            console.log('Deselected voice model');
          } else {
            setSelectedVoiceId(recording.id);
            console.log('Selected voice model ID:', recording.id);
            setIsUsingMyVocal(false);
            setSelectedRecordingFile(null);
          }

          // If the recording has a preview URL, play it
          if (recording.previewUrl) {
            handlePlaySample(recording);
          }
        }}>
        <View
          style={[
            styles.vocalCardContainer,
            isSelected && styles.selectedCardContainer,
          ]}>
          <View style={styles.topBorder} />
          <LinearGradient
            colors={['#18181B', '#231F1F', '#3A2F28']}
            locations={[0.35, 0.75, 1]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.vocalGradient}
            activeOpacity={0.7}
            angle={175}>
            <View style={styles.plusContainer}>
              <Image
                source={{uri: recording?.imageUrl}}
                style={{width: '100%', height: '100%'}}
              />
              {isCurrentlyPlaying && (
                <View style={styles.playingOverlay}>
                  <Image
                    // source={require('../../../../resource/images/playing.gif')}
                    style={styles.playingIcon}
                  />
                </View>
              )}
            </View>
            {isSelected && (
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </LinearGradient>
        </View>
        <Text style={[styles.cardText, isSelected && styles.selectedCardText]}>
          {recording.title.replace(/ /, '\n')}
        </Text>
      </TouchableOpacity>
    );
  };

  // User Recordings Card component
  const UserRecordingCard = ({recording}) => {
    const isSelected =
      isUsingMyVocal && selectedRecordingFile?._id === recording._id;
    const isCurrentlyPlaying =
      currentSong && currentSong.id === recording._id && isPlaying;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (isSelected) {
            setIsUsingMyVocal(false);
            setSelectedRecordingFile(null);
            console.log('Deselected user recording');
          } else {
            setIsUsingMyVocal(true);
            setSelectedRecordingFile(recording);
            console.log('Selected user recording ID:', recording._id);
            setSelectedVoiceId(null);
          }

          // Play the recording
          handlePlayRecording(recording);
        }}>
        <View
          style={[
            styles.vocalCardContainer,
            isSelected && styles.selectedCardContainer,
          ]}>
          <View style={styles.topBorder} />
          <LinearGradient
            colors={['#18181B', '#231F1F', '#3A2F28']}
            locations={[0.35, 0.75, 1]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.vocalGradient}
            activeOpacity={0.7}
            angle={175}>
            <View style={styles.plusContainer}>
              <CText style={{color: '#FFF', fontSize: 20}}>🎤</CText>
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
          </LinearGradient>
        </View>
        <Text style={[styles.cardText, isSelected && styles.selectedCardText]}>
          {recording.name?.length > 15
            ? recording.name.substring(0, 15) + '...'
            : recording.name || 'My Recording'}
        </Text>
      </TouchableOpacity>
    );
  };

  // Component for displaying generated songs
  const GeneratedSongCard = useCallback(
    ({conversion}) => {
      const isCurrentlyPlaying =
        currentSong && currentSong.id === conversion.id && isPlaying;

      console.log(conversion, 'conversion');

      // Processing status indicator colors
      const getStatusColor = () => {
        if (conversion.status === 'error' || conversion.status === 'failed') {
          return '#F44336'; // Red for error states
        } else if (conversion.outputUrl) {
          return '#4CAF50'; // Green for ready/completed
        } else {
          return '#FFC107'; // Yellow/Orange for processing
        }
      };

      // Determine card state
      const isPlayable = !!conversion.outputUrl;
      const isProcessing =
        !isPlayable &&
        conversion.status !== 'error' &&
        conversion.status !== 'failed';
      const hasFailed =
        conversion.status === 'error' || conversion.status === 'failed';

      return (
        <TouchableOpacity
          activeOpacity={isPlayable ? 0.7 : 1}
          onPress={() => {
            if (isPlayable) {
              handlePlayGeneratedSong(conversion);
            } else if (isProcessing) {
              Alert.alert(
                'Processing',
                'Your AI cover is still being generated. This complex task may take several minutes to complete.',
              );
            } else {
              Alert.alert(
                'Generation Failed',
                'Unfortunately, there was an issue generating this cover.',
              );
            }
          }}
          style={styles.generatedSongCard}>
          <LinearGradient
            colors={['#18181B', '#231F1F', '#3A2F28']}
            locations={[0.35, 0.75, 1]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.songCardGradient}>
            {/* Status Indicator */}
            <View
              style={[
                styles.statusIndicator,
                {backgroundColor: getStatusColor()},
              ]}
            />

            {/* Cover Art or Placeholder */}
            <View style={styles.coverArtContainer}>
              {conversion.imageUrl ? (
                <Image
                  source={{uri: conversion.imageUrl}}
                  style={styles.coverArt}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.coverArtPlaceholder}>
                  <CText style={styles.coverArtPlaceholderText}>
                    {conversion.title ? conversion.title.charAt(0) : 'C'}
                  </CText>
                </View>
              )}

              {/* Play/Loading Overlay */}
              {isProcessing ? (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color="#F4A460" size="small" />
                  <CText style={{color: '#FFF', fontSize: 12, marginTop: 4}}>
                    Processing...
                  </CText>
                </View>
              ) : hasFailed ? (
                <View style={styles.loadingOverlay}>
                  <CText style={{color: '#FFF', fontSize: 14}}>Failed</CText>
                </View>
              ) : isCurrentlyPlaying ? (
                <View style={styles.playingOverlay}>
                  <CText style={{color: '#FFF', fontSize: 20}}>▶️</CText>
                </View>
              ) : (
                <View style={styles.playButtonOverlay}>
                  <CText style={{color: '#FFF', fontSize: 24}}>▶</CText>
                </View>
              )}
            </View>

            {/* Song Details */}
            <View style={styles.songDetailsContainer}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {conversion.title || 'Untitled Cover'}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {conversion.artist || 'AI Generated'}
              </Text>
              <Text
                style={[
                  styles.songStatus,
                  isProcessing && {color: '#FFC107'}, // Make processing status more visible
                  hasFailed && {color: '#F44336'}, // Make failure more visible
                  isPlayable && {color: '#4CAF50'}, // Make successful status more visible
                ]}>
                {isPlayable
                  ? 'Ready to Play'
                  : hasFailed
                  ? 'Failed to Generate'
                  : 'Processing (may take a few minutes)'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [currentSong, isPlaying, handlePlayGeneratedSong],
  );

  // Section to display generated songs
  const GeneratedSongsSection = useCallback(() => {
    if (conversions.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Generated Covers</Text>
        <FlatList
          data={conversions}
          renderItem={({item}) => <GeneratedSongCard conversion={item} />}
          keyExtractor={item => item.id}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.generatedSongsContainer}
        />
      </View>
    );
  }, [conversions]); // Fix: Removed the unnecessary GeneratedSongCard dependency

  const MyVocalsSection = () => {
    return (
      <>
        <View style={styles.vocalTitleContainer}>
          <Text style={[styles.sectionTitle, styles.vocalTitle]}>
            🎤 My Vocals
          </Text>
        </View>

        {isLoadingRecordings ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F4A460" />
            <Text style={styles.loadingText}>Loading your recordings...</Text>
          </View>
        ) : userRecordings.length === 0 ? (
          <View style={styles.noRecordingsContainer}>
            <Text style={styles.noRecordingsText}>
              You don't have any recordings yet.
            </Text>
          </View>
        ) : (
          <View style={styles.userRecordingsContainer}>
            <FlatList
              data={userRecordings}
              renderItem={({item}) => <UserRecordingCard recording={item} />}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.userRecordingsContent}
            />
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate(ROUTE_NAME.VoiceRecord);
          }}
          style={styles.addRecordingButton}>
          <View style={styles.plusButtonContainer}>
            <CText style={styles.plusIcon}>+</CText>
          </View>
          <Text style={styles.addRecordingText}>Add New Recording</Text>
        </TouchableOpacity>

        <View style={{...styles.vocalTitleContainer, marginTop: 30}}>
          <Text style={[styles.sectionTitle, styles.vocalTitle]}>
            🎤 Vocals
          </Text>
        </View>
      </>
    );
  };

  // Footer component to show loading indicator when loading more data
  const ListFooter = () => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#F4A460" />
        <Text style={styles.loadingMoreText}>Loading more voices...</Text>
      </View>
    );
  };

  // Add a network status indicator in the UI
  const NetworkStatusBar = () => {
    if (networkStatus.isConnected && !apiRequestStatus.lastError) {
      return null; // Don't show anything when connected and no errors
    }

    return (
      <View style={styles.networkStatusBar}>
        <Text style={styles.networkStatusText}>
          {!networkStatus.isConnected
            ? 'You are offline. Please check your internet connection.'
            : apiRequestStatus.lastError
            ? `Error: ${apiRequestStatus.lastError}`
            : 'Network status unknown'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusBar />
      <View style={styles.content}>
        {/* Link Input Section */}
        <View style={styles.section}>
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
        </View>

        {/* Metadata Input Section (Optional) */}
        {/* <View style={styles.metadataContainer}>
          <View style={styles.metadataField}>
            <Text style={styles.metadataLabel}>Song Title (Optional)</Text>
            <TextInput
              style={styles.metadataInput}
              placeholder="Enter song title"
              placeholderTextColor="#666"
              value={songTitle}
              onChangeText={setSongTitle}
            />
          </View>
          <View style={styles.metadataField}>
            <Text style={styles.metadataLabel}>Artist Name (Optional)</Text>
            <TextInput
              style={styles.metadataInput}
              placeholder="Enter artist name"
              placeholderTextColor="#666"
              value={artistName}
              onChangeText={setArtistName}
            />
          </View>
        </View> */}

        {/* Removed Generated Songs Section - songs will be in library instead */}

        {/* Vocals Section */}
        {sampleVoice.length === 0 && !isLoadingMore ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#F4A460" />
            <Text style={styles.loadingText}>Loading voices...</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <FlatList
              data={sampleVoice}
              ListHeaderComponent={MyVocalsSection}
              ListFooterComponent={ListFooter}
              renderItem={({item}) => <VocalCard recording={item} />}
              keyExtractor={item => item.id.toString()}
              numColumns={3}
              contentContainerStyle={styles.vocalsContainerGrid}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.row}
              getItemLayout={(data, index) => ({
                length: CARD_WIDTH,
                offset: CARD_WIDTH * Math.floor(index / 3),
                index,
              })}
              onEndReachedThreshold={0.5}
              onEndReached={handleLoadMore}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#F4A460']}
                  tintColor="#F4A460"
                  title="Refreshing..."
                  titleColor="#F4A460"
                />
              }
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.createButton]}
          activeOpacity={0.8}
          disabled={
            isLoading ||
            (!selectedVoiceId && !selectedRecordingFile) ||
            !networkStatus.isConnected ||
            isRetrying
          }
          onPress={createVoiceConversion}>
          <LinearGradient
            colors={['#F4A460', '#DEB887']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}>
            <CText
              style={[
                styles.createButtonText,
                (isLoading ||
                  (!selectedVoiceId && !selectedRecordingFile) ||
                  !networkStatus.isConnected ||
                  isRetrying) &&
                  styles.disabledButtonText,
              ]}>
              {isLoading
                ? 'Creating...'
                : isRetrying
                ? `Retrying (${retryAttempts.current}/${MAX_RETRY_ATTEMPTS})...`
                : !networkStatus.isConnected
                ? 'Offline'
                : 'Create Cover'}
            </CText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Notification Modal - Similar to AIGenerator */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBottomSheet}
        onRequestClose={() => setShowBottomSheet(false)}>
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            <CText size="largeBold" style={styles.bottomSheetTitle}>
              Cover Generation Started
            </CText>
            <CText style={styles.bottomSheetText}>
              Your cover will be generated in 10-15 mins. Come back and check in
              the library.
            </CText>
            <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={() => setShowBottomSheet(false)}>
              <CText style={styles.bottomSheetButtonText}>Got it</CText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FDF5E6',
    marginBottom: 16,
  },
  pageHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FDF5E6',
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 60,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  pasteButton: {
    backgroundColor: '#DEB887',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginRight: 8,
  },
  pasteButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  vocalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vocalTitle: {
    marginBottom: 0,
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
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
    marginHorizontal: 15,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#C87D48',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  vocalCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    width: CARD_WIDTH,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 5,
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
    paddingBottom: 160,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedCardContainer: {
    borderWidth: 2,
    borderColor: '#F4A460',
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
  disabledButtonText: {
    opacity: 0.5,
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
  userRecordingsContainer: {
    marginBottom: 16,
  },
  userRecordingsContent: {
    paddingRight: 16,
  },
  noRecordingsContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noRecordingsText: {
    color: '#999',
    fontSize: 14,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 8,
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
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FDF5E6',
    marginBottom: 12,
  },
  metadataContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  metadataField: {
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  metadataInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  generatedSongsContainer: {
    paddingBottom: 16,
  },
  generatedSongCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  songCardGradient: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 4,
  },
  coverArtContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  coverArt: {
    width: '100%',
    height: '100%',
  },
  coverArtPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverArtPlaceholderText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songDetailsContainer: {
    flex: 1,
  },
  songTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  songStatus: {
    color: '#777',
    fontSize: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  debugButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#FFF',
    fontSize: 12,
  },
  debugContainer: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  debugTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    color: '#CCC',
    fontSize: 12,
    marginBottom: 4,
  },
  networkStatusBar: {
    backgroundColor: '#F44336',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  networkStatusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  bottomSheetTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bottomSheetText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  bottomSheetButton: {
    backgroundColor: '#F4A460',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomSheetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CoverCreationScreen;
