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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import fetcher from '../../../../dataProvider';
import CText from '../../../common/core/Text';
import Clipboard from '@react-native-clipboard/clipboard';
import useMusicPlayer from '../../../../hooks/useMusicPlayer';
import config from 'react-native-config';
import {getAuthToken} from '../../../../utils/authUtils';
import {useSelector, useDispatch} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import useCredits from '../../../../hooks/useCredits';
import {
  setGeneratingSong,
  setGeneratingSongId,
} from '../../../../stores/slices/player';
import appImages from '../../../../resource/images';
import {selectCreditsPerSong} from '../../../../stores/selector';

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
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');

  // Add state for modal visibility
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Get user ID from Redux store
  const {userId} = useSelector(state => state.user);

  // Add global music player hook
  const {play, isPlaying, currentSong, togglePlayPause} =
    useMusicPlayer('AICoverScreen');

  // Add credits hook
  const {
    credits,
    decrementUserCredits,
    handleCreditRequiredAction,
    refreshCredits,
  } = useCredits();

  // Get the numeric value of credits
  const creditsValue = getCreditsValue(credits);

  // Add useEffect to refresh credits when component mounts
  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  // Remove pagination states
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const PAGE_SIZE = 9; // Number of items to load per page

  const [isRetrying, setIsRetrying] = useState(false);
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

  // Function to validate YouTube or Spotify URL
  const validateMediaURL = url => {
    if (!url) return false;

    // Trim whitespace and normalize
    const trimmedUrl = url.trim();

    // YouTube URL patterns
    const youtubePatterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i,
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=.+/i,
      /^(https?:\/\/)?(www\.)?youtu\.be\/.+/i,
    ];

    // Spotify URL patterns
    const spotifyPatterns = [
      /^(https?:\/\/)?(open\.)?spotify\.com\/.+/i,
      /^(https?:\/\/)?(open\.)?spotify\.com\/track\/.+/i,
    ];

    // Check if URL matches any of the patterns
    const isYouTubeUrl = youtubePatterns.some(pattern =>
      pattern.test(trimmedUrl),
    );
    const isSpotifyUrl = spotifyPatterns.some(pattern =>
      pattern.test(trimmedUrl),
    );

    return isYouTubeUrl || isSpotifyUrl;
  };

  const createVoiceConversion = async () => {
    // Credit check - navigate to subscription if credits are insufficient
    if (creditsValue <= 0) {
      navigation.navigate(ROUTE_NAME.SubscriptionScreen);
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

    if (!selectedVoiceId && !selectedRecordingFile) {
      Alert.alert('Error', 'Please select a voice first');
      return;
    }

    if (!link) {
      Alert.alert('Error', 'Please provide a YouTube/Spotify link');
      return;
    }

    // Validate the URL format
    if (!validateMediaURL(link)) {
      Alert.alert('Error', 'Please enter a valid YouTube or Spotify URL');
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
        // Get auth token
        const token = await getAuthToken();
        if (!token) {
          throw new Error('Authentication required. Please log in again.');
        }

        console.log(link, 'link');

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

        console.log(requestData, 'requestData');
        fetcher
          .post(apiUrl, requestData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 300000, // Increased timeout to 5 minutes (300,000ms)
          })
          .then(response => {
            // Check if the response is successful and contains expected data
            if (!response.data) {
              throw new Error('Invalid response from server');
            }

            // Store the generated song ID for tracking in the library
            if (response.data._id) {
              dispatch(setGeneratingSongId(response.data._id));
            }

            // Make sure to refresh credits after successful generation
            setTimeout(() => {
              refreshCredits();
            }, 500);

            // On success - we keep the generating state active
            // It will be reset when the song appears in the library
            dispatch(setGeneratingSong(false));

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
        setIsRetrying(false);
        retryAttempts.current = 0;
      }
    }, creditsPerSong);
  };

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      setLink(clipboardContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const API_TOKEN = 'w8TOqTQD.HDIa0GVr6XlSFBbp4HIztEGj';

  // Fetch user's voice recordings - updated to track loading state
  const fetchUserRecordings = useCallback(
    async (showToast = false) => {
      // Don't fetch if already loaded unless it's a manual refresh
      if (recordingsLoaded && !showToast && !isRefreshing) {
        return userRecordings;
      }

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

        // Make API request using fetcher
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
        setRecordingsLoaded(true);

        // Show success message if requested
        if (showToast) {
          if (Platform.OS === 'android') {
            ToastAndroid.show(
              'Voice recordings refreshed!',
              ToastAndroid.SHORT,
            );
          } else {
            Alert.alert(
              'Success',
              'Voice recordings refreshed!',
              [{text: 'OK', onPress: () => {}}],
              {cancelable: true},
            );
          }
        }

        return recordings;
      } catch (error) {
        console.error('Failed to fetch user recordings:', error);
        // Only show alert for manual refreshes
        if (showToast || isRefreshing) {
          Alert.alert('Error', 'Failed to fetch your voice recordings');
        }
        return [];
      } finally {
        setIsLoadingRecordings(false);
      }
    },
    [userId, userRecordings, recordingsLoaded, isRefreshing],
  );

  // Update the handleRefresh function to reset pagination and properly refresh data
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

      // Reset pagination
      setPage(1);
      setHasMoreData(true);

      // Run refreshes in parallel for faster loading
      await Promise.all([
        // Reload voice models
        getVoiceSamples(1, false),

        // Reload user recordings if user is logged in
        userId ? fetchUserRecordings(true) : Promise.resolve(),

        // Refresh credits
        refreshCredits(),
      ]);

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
    getVoiceSamples,
    fetchUserRecordings,
    refreshCredits,
    userId,
    isRefreshing,
  ]);

  // Initial data load - only once on mount
  useEffect(() => {
    getVoiceSamples(1, false);
    if (userId && !recordingsLoaded) {
      fetchUserRecordings();
    }
  }, [userId, fetchUserRecordings, getVoiceSamples, recordingsLoaded]);

  // Modify getVoiceSamples to only fetch initial data
  const getVoiceSamples = useCallback(
    async (pageNum = 1, shouldAppend = false) => {
      try {
        setIsLoadingMore(true);

        // Add pagination parameters to the API call
        const response = await fetch(
          `https://arpeggi.io/api/kits/v1/voice-models?page=${pageNum}&limit=${PAGE_SIZE}`,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const newData = responseData.data || [];

        // Update state with initial data only
        setSampleVoice(newData);

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

  // Handler for playing voice samples with improved logging
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
    const isSelected = !isUsingMyVocal && selectedVoiceId === recording.id;
    const isCurrentlyPlaying =
      currentSong && currentSong.id === recording.id && isPlaying;
    const [imageError, setImageError] = useState(false);

    // Determine if we have a valid image URL
    const hasValidImageUrl =
      recording?.imageUrl && recording.imageUrl.startsWith('http');

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (isSelected) {
            setSelectedVoiceId(null);
          } else {
            setSelectedVoiceId(recording.id);
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
          {recording.title?.length > 15
            ? recording.title.substring(0, 9) + '...'
            : recording.title || 'Voice'}
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
          } else {
            setIsUsingMyVocal(true);
            setSelectedRecordingFile(recording);
            setSelectedVoiceId(null);
          }
        }}>
        <View
          style={[
            styles.vocalCardContainer,
            isSelected && styles.selectedCardContainer,
          ]}>
          <View style={styles.vocalGradient}>
            <View style={styles.plusContainer}>
              <Image
                source={appImages.recordingImage}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
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
          {recording.name?.length > 15
            ? recording.name.substring(0, 8) + '...'
            : recording.name || 'My Recording'}
        </Text>
      </TouchableOpacity>
    );
  };

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

  // Remove ListFooter component since we won't be loading more
  const ListFooter = () => {
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Credits Display */}
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
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsText}>
              Songs Left: {Math.floor(creditsValue / creditsPerSong)}
            </Text>
          </View>
        </View>

        {/* Vocals Section */}
        <View style={styles.listContainer}>
          {sampleVoice.length === 0 && !isLoadingMore ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#F4A460" />
              <Text style={styles.loadingText}>Loading voices...</Text>
            </View>
          ) : (
            <FlatList
              data={sampleVoice}
              ListHeaderComponent={MyVocalsSection}
              ListFooterComponent={ListFooter}
              renderItem={({item}) => <VocalCard recording={item} />}
              keyExtractor={item => item.id.toString()}
              numColumns={3}
              contentContainerStyle={styles.vocalsContainerGrid}
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

      {/* Button container - adjust position based on global player visibility */}
      <View
        style={[
          styles.buttonContainer,
          showGlobalPlayer && {bottom: 90}, // Move button up when player is visible
        ]}>
        <TouchableOpacity
          style={styles.createButton}
          disabled={
            (!selectedVoiceId && !selectedRecordingFile) || !link || isLoading
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
                (isLoading || (!selectedVoiceId && !selectedRecordingFile)) &&
                  styles.disabledButtonText,
              ]}>
              {isLoading
                ? 'Creating...'
                : creditsValue <= 0
                ? 'Insufficient Credits'
                : 'Create Cover'}
            </CText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Notification Modal */}
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
              Your cover will be generated in 10-15 mins. Come back and check in
              the library.
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
  headerSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FDF5E6',
    marginBottom: 16,
  },
  pageHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FDF5E6',
    paddingVertical: 10,
    fontFamily: 'Bricolage Grotesque',
    letterSpacing: -0.8,
    textTransform: 'capitalize',
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
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#C87D48',
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    // fontWeight: 'bold',
    fontSize: 16,
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
    flex: 1, // Takes the remaining vertical space
  },
});

export default CoverCreationScreen;
