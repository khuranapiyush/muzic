/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Alert,
  Image,
  Linking,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LinearGradient from 'react-native-linear-gradient';
import CText from '../../components/common/core/Text';
import appImages from '../../resource/images';
import axios from 'axios';
import RNFS from 'react-native-fs';
import config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';
import {getAuthToken} from '../../utils/authUtils';
import CView from '../../components/common/core/View';
import AppTrackingPermission from '../../utils/AppTrackingPermission';
import TrackingPermissionModal from '../../components/common/TrackingPermissionModal';

const VoiceRecordScreen = ({navigation}) => {
  const {API_BASE_URL} = config;
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [recordings, setRecordings] = useState(null);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [isUploading, setIsUploading] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [recordingName, setRecordingName] = useState(
    `My Voice Recording ${new Date().toLocaleString()}`,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  // Use a ref to keep track of the record back listener
  const recordBackListenerRef = useRef(null);

  // Move uploadVoiceRecording definition before stopRecording
  const uploadVoiceRecording = useCallback(
    async (filePath, duration) => {
      try {
        // Check for internet connection before making the API call
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

        // Ensure the file exists
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
          throw new Error('Recording file not found for upload');
        }

        // For Android, make sure path is correct
        const normalizedPath =
          Platform.OS === 'android' && !filePath.startsWith('file://')
            ? `file://${filePath}`
            : filePath;

        // Create FormData for multipart/form-data upload
        const formData = new FormData();

        // Detect file type based on extension
        const fileExtension = filePath.split('.').pop().toLowerCase();
        const mimeType =
          fileExtension === 'm4a'
            ? 'audio/m4a'
            : fileExtension === 'mp3'
            ? 'audio/mpeg'
            : 'audio/mpeg';

        // Add recording file with correct mime type
        formData.append('voiceFile', {
          uri: normalizedPath,
          type: mimeType,
          name: `recording.${fileExtension}`,
        });

        // Add metadata
        formData.append('name', recordingName);
        formData.append('duration', String(Math.floor(duration / 1000))); // Convert ms to seconds

        // Make API request with progress tracking
        const response = await axios.post(
          `${API_BASE_URL}/v1/voice-recordings`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            onUploadProgress: progressEvent => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(percentCompleted);
            },
          },
        );

        return response.data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || 'Failed to upload voice recording',
        );
      }
    },
    [API_BASE_URL, recordingName],
  );

  // Now define stopRecording after uploadVoiceRecording
  const stopRecording = useCallback(async () => {
    if (!audioRecorder || !isRecording) {
      return;
    }

    let recorder = audioRecorder;
    let uri = null;

    try {
      // Remove the recording progress listener
      if (recordBackListenerRef.current) {
        recorder.removeRecordBackListener(recordBackListenerRef.current);
        recordBackListenerRef.current = null;
      }

      // Stop the recording
      try {
        uri = await recorder.stopRecorder();
        console.log('Recording stopped, file saved at:', uri);
      } catch (stopError) {
        console.error('Error stopping recorder:', stopError);
        // If we can't stop the recorder normally, try to reset it
        await resetRecorder();
        throw new Error(
          'Failed to stop recording properly: ' + stopError.message,
        );
      }

      // Wait a moment for the file to be properly saved
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get recording duration from the recorded time using our own conversion function
      const durationMs = mmssToSec(recordingTime) * 1000;

      setRecordings(uri);
      setIsRecording(false);
      setSelectedRecording(null);
      setRecordingTime('00:00');

      // Check if we have a valid file path
      if (!uri) {
        Alert.alert('Error', 'No recording file was created');
        return;
      }

      // Test if file is playable
      try {
        await testPlayback(uri);
      } catch (playbackError) {
        console.error('Playback test failed:', playbackError);
        // Continue with upload even if playback test fails
      }

      // Upload the recording
      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Check if the file exists and has content
        const fileExists = await RNFS.exists(uri);
        if (!fileExists) {
          throw new Error('Recording file not found');
        }

        // Check file size to ensure it's not empty
        const fileStats = await RNFS.stat(uri);
        console.log('File stats:', fileStats);

        if (fileStats.size <= 0) {
          throw new Error('Recording file is empty');
        }

        // Upload directly to our API with authentication
        const uploadResponse = await uploadVoiceRecording(uri, durationMs);

        console.log('Upload successful:', {
          localUri: uri,
          timestamp: new Date().toISOString(),
          apiResponse: uploadResponse,
        });

        Alert.alert('Success', 'Voice recording uploaded successfully');

        // Optional: Navigate back after successful upload
        // navigation.goBack();
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert(
          'Upload Failed',
          `Recording saved locally but upload failed: ${uploadError.message}`,
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error in recording process:', error);
      Alert.alert('Error', `Recording failed: ${error.message}`);
      setIsRecording(false);
      setSelectedRecording(null);
      setRecordingTime('00:00');

      // Try to reset the recorder to recover from errors
      await resetRecorder();
    }
  }, [
    audioRecorder,
    isRecording,
    uploadVoiceRecording,
    recordingTime,
    testPlayback,
    resetRecorder,
  ]);

  // Create a cleanup function with useRef to avoid dependency issues
  const cleanupRecording = useRef(() => {
    if (audioRecorder && isRecording) {
      try {
        // Stop any ongoing recording
        if (recordBackListenerRef.current) {
          audioRecorder.removeRecordBackListener(recordBackListenerRef.current);
          recordBackListenerRef.current = null;
        }
        audioRecorder.stopRecorder();
      } catch (e) {
        console.error('Error in cleanup:', e);
      }
    }
  }).current;

  // First fix - checking permissions in iOS during initialization
  useEffect(() => {
    // Initialize the recorder once when component mounts
    const initializeRecorder = async () => {
      try {
        console.log('Initializing AudioRecorderPlayer...');
        const recorder = new AudioRecorderPlayer();

        // Set the audioRecorder state immediately to ensure it's available
        setAudioRecorder(recorder);

        // Note: We'll now request permissions when the user attempts to record
        // This is more in line with mobile UX best practices
        console.log('Permissions will be requested when recording is started');
      } catch (error) {
        console.error('Error initializing AudioRecorderPlayer:', error);
        Alert.alert(
          'Initialization Error',
          'Could not initialize audio recorder. Please restart the app.',
        );
      }
    };

    // Initialize recorder
    initializeRecorder();

    // Clean up function - use the ref version to avoid dependency cycles
    return cleanupRecording;
  }, [cleanupRecording]);

  // Add a function to reset the recorder if it gets into a bad state
  const resetRecorder = useCallback(async () => {
    try {
      // First, try to clean up any existing recorder instance
      let oldRecorder = audioRecorder;
      if (oldRecorder) {
        console.log('Cleaning up existing recorder instance...');

        // Remove any listeners first
        if (recordBackListenerRef.current) {
          try {
            oldRecorder.removeRecordBackListener(recordBackListenerRef.current);
            console.log('Removed record back listener');
          } catch (listenerError) {
            console.log('Error removing record back listener:', listenerError);
          }
          recordBackListenerRef.current = null;
        }

        // Try to stop any ongoing recording/playback
        try {
          await oldRecorder.stopRecorder().catch(() => {});
          console.log('Stopped any ongoing recording');
        } catch (error) {
          console.log('No active recorder to stop or error stopping:', error);
        }

        try {
          await oldRecorder.stopPlayer().catch(() => {});
          console.log('Stopped any ongoing playback');
        } catch (error) {
          console.log('No active player to stop or error stopping:', error);
        }

        // Set to null to release memory
        oldRecorder = null;

        // Delay to ensure resources are properly released
        console.log('Adding delay for resource cleanup');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Create a fresh instance
      console.log('Creating new AudioRecorderPlayer instance');
      const newRecorder = new AudioRecorderPlayer();

      // For iOS, we no longer need to check permissions here - the system will handle it
      console.log('Permissions will be handled when recording starts');

      setAudioRecorder(newRecorder);
      setIsRecording(false);
      setIsPlaying(false);
      setRecordingTime('00:00');
      console.log('AudioRecorderPlayer has been reset');

      return newRecorder;
    } catch (error) {
      console.error('Error resetting recorder:', error);
      return null;
    }
  }, [audioRecorder]);

  // Add a separate effect to handle recording state changes
  useEffect(() => {
    // This effect handles updates to isRecording state
    // but we don't need to do anything on state change here
    // This is just to properly separate concerns
  }, [isRecording]);

  const checkAndRequestPermissions = async () => {
    try {
      console.log(`Requesting ${Platform.OS} microphone permission`);

      // For iOS, also check app tracking permission status
      if (Platform.OS === 'ios') {
        // Request App Tracking Transparency permission
        const trackingStatus = await AppTrackingPermission.getTrackingStatus();
        console.log('App Tracking Status:', trackingStatus);

        // If tracking status is not determined, show our custom modal
        if (trackingStatus === 'not-determined') {
          setShowTrackingModal(true);
        }
      }

      if (Platform.OS === 'android') {
        // For Android, use the native PermissionsAndroid API
        try {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message:
                'This app needs access to your microphone to record audio',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            },
          );

          console.log(`Android permission result: ${result}`);
          const isGranted = result === PermissionsAndroid.RESULTS.GRANTED;
          setPermissionsGranted(isGranted);
          return isGranted;
        } catch (error) {
          console.error('Error requesting Android permission:', error);
          return false;
        }
      } else {
        // For iOS, we'll use the recorder directly to trigger the system dialog
        try {
          // Create a temporary recorder
          const tempRecorder = new AudioRecorderPlayer();

          // This will trigger the system permission dialog on iOS
          console.log(
            'iOS: Attempting to start recorder to trigger permission dialog',
          );
          await tempRecorder.startRecorder();

          // If we get here without an error, permission was granted
          // Stop the recorder immediately
          await tempRecorder.stopRecorder();

          console.log('iOS: Permission granted, recorder started and stopped');
          setPermissionsGranted(true);
          return true;
        } catch (error) {
          // If there's an error with "permission not granted" message, it means user denied
          console.error('iOS permission error:', error);
          if (
            error.message &&
            error.message.includes('permission not granted')
          ) {
            console.log('iOS: Microphone permission denied');
            setPermissionsGranted(false);
            return false;
          }

          // If we got a different error, we can't be sure
          return false;
        }
      }
    } catch (err) {
      console.error('Error in permission request process:', err);
      return false;
    }
  };

  const formatTime = millis => {
    const minutes = Math.floor(millis / 1000 / 60);
    const seconds = Math.floor((millis / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Add our own time conversion function since mmssToSec isn't available
  const mmssToSec = timeString => {
    if (!timeString || typeof timeString !== 'string') {
      return 0;
    }
    const parts = timeString.split(':');
    if (parts.length !== 2) {
      return 0;
    }
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    return minutes * 60 + seconds;
  };

  const saveCoverAudio = async (audioId, walrusUrl) => {
    try {
      // Check for internet connection before making the API call
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error(
          'No internet connection. Please try again when you are connected.',
        );
      }

      const response = await axios.post(`${API_BASE_URL}/v1/cover-audio`, {
        audioId,
        coverAudioUrl: walrusUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Error saving cover audio:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to save cover audio',
      );
    }
  };

  // UPLOAD TO WALRUS
  // const uploadToWalrus = async uri => {
  //   try {
  //     // Check for internet connection before uploading
  //     const netInfo = await NetInfo.fetch();
  //     if (!netInfo.isConnected) {
  //       throw new Error(
  //         'No internet connection. Please try again when you are connected.',
  //       );
  //     }

  //     // Read the file as base64
  //     const fileContent = await RNFS.readFile(uri, 'base64');
  //     const fileName = `audio-${Date.now()}.mp3`;

  //     // Upload to Walrus
  //     const response = await axios({
  //       method: 'put',
  //       url: 'https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5',
  //       data: fileContent,
  //       headers: {
  //         'Content-Type': 'audio/mpeg',
  //         'Content-Disposition': `attachment; filename="${fileName}"`,
  //         'Content-Transfer-Encoding': 'base64',
  //       },
  //       maxContentLength: Infinity,
  //       maxBodyLength: Infinity,
  //       timeout: 30000, // 30 seconds timeout
  //     });

  //     return response.data;
  //   } catch (error) {
  //     console.error('Error uploading to Walrus:', error);
  //     throw new Error(
  //       error.response?.data?.message || 'Failed to upload audio',
  //     );
  //   }
  // };

  // Add a test playback function to ensure audio is properly recorded
  const testPlayback = useCallback(
    async filePath => {
      if (!audioRecorder || !filePath) {
        console.log('Cannot test playback: missing recorder or file path');
        return;
      }

      // Set up a listener reference to clean up later
      let playbackListener = null;

      try {
        // Make sure player is stopped before playing new audio
        try {
          await audioRecorder.stopPlayer().catch(() => {});
        } catch (e) {
          // Ignore errors when stopping player, it might not be playing
        }
        setIsPlaying(false);

        console.log('Testing playback of recording:', filePath);

        // For Android, add the file:// prefix if not present
        const path =
          Platform.OS === 'android' && !filePath.startsWith('file://')
            ? `file://${filePath}`
            : filePath;

        // Check if file exists before attempting to play
        const fileExists = await RNFS.exists(
          Platform.OS === 'android' && path.startsWith('file://')
            ? path.substring(7) // Remove file:// prefix for RNFS.exists on Android
            : path,
        );

        if (!fileExists) {
          throw new Error('Cannot test playback: file does not exist');
        }

        // Start playing the recording
        await audioRecorder.startPlayer(path);

        // Add play back listener
        playbackListener = e => {
          if (e.currentPosition === e.duration) {
            console.log('Playback completed');
            audioRecorder.stopPlayer().catch(() => {});
            setIsPlaying(false);
            if (playbackListener) {
              audioRecorder.removePlayBackListener();
              playbackListener = null;
            }
          }
        };

        audioRecorder.addPlayBackListener(playbackListener);
        setIsPlaying(true);

        // Stop after a short test period (2 seconds)
        setTimeout(async () => {
          if (audioRecorder) {
            try {
              await audioRecorder.stopPlayer().catch(() => {});
            } catch (e) {
              // Ignore errors when stopping player
            }
            setIsPlaying(false);

            if (playbackListener) {
              audioRecorder.removePlayBackListener();
              playbackListener = null;
            }
          }
        }, 2000);
      } catch (error) {
        console.error('Error testing playback:', error);

        // Clean up if there was an error
        setIsPlaying(false);
        if (playbackListener) {
          try {
            audioRecorder.removePlayBackListener();
          } catch (e) {
            // Ignore cleanup errors
          }
        }

        try {
          await audioRecorder.stopPlayer().catch(() => {});
        } catch (e) {
          // Ignore errors when stopping player
        }

        throw error;
      }
    },
    [audioRecorder],
  );

  const startRecordingProcess = async () => {
    // We've already checked permissions in handleRecordPress, no need to check again

    // Generate a unique ID for this recording
    const recordingId = Date.now().toString();

    // Set up the file path based on platform - use correct extensions for better compatibility
    // For iOS, just use the default path by not specifying anything
    const path = Platform.select({
      ios: null, // Don't specify path for iOS, let the library use its default
      android: `${RNFS.CachesDirectoryPath}/recording_${recordingId}.mp3`,
    });

    try {
      setSelectedRecording(recordingId);

      // Make sure no recording/playback is active
      let recorder = audioRecorder;
      if (!recorder) {
        console.log('Recorder not available, creating new instance');
        recorder = new AudioRecorderPlayer();
        setAudioRecorder(recorder);
        // Add a small delay to ensure recorder is initialized
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      try {
        // Try to stop any ongoing player or recorder
        await recorder.stopPlayer().catch(() => {});
        await recorder.stopRecorder().catch(() => {});
        setIsPlaying(false);
      } catch (error) {
        console.log('No active recorder/player to stop, continuing');
      }

      // Start recording with audio configuration
      let uri;
      try {
        if (Platform.OS === 'android') {
          // For Android, use the path and settings
          console.log('Android: Starting recorder with path:', path);
          uri = await recorder.startRecorder(path);
        } else {
          // For iOS, use the absolute simplest approach - no arguments at all
          console.log('iOS: Starting recorder with default options');
          uri = await recorder.startRecorder();
        }

        console.log('Recording started at:', uri);

        // Set up the recording progress listener
        recordBackListenerRef.current = recorder.addRecordBackListener(e => {
          setRecordingTime(formatTime(e.currentPosition));
        });

        setIsRecording(true);
      } catch (recorderError) {
        console.error('Error starting recorder:', recorderError);

        // Try to reset the recorder and attempt one more time
        console.log('Trying to reset and restart recorder...');
        recorder = await resetRecorder();
        if (!recorder) {
          throw new Error('Failed to reset recorder');
        }

        try {
          // Use the absolute simplest recording approach - no path, no options
          uri = await recorder.startRecorder();
          console.log('Recording started after reset at:', uri);

          // Set up the recording progress listener
          recordBackListenerRef.current = recorder.addRecordBackListener(e => {
            setRecordingTime(formatTime(e.currentPosition));
          });

          setIsRecording(true);
        } catch (finalError) {
          console.error('Final recording attempt failed:', finalError);
          throw new Error(
            'Could not start recording. Please check microphone permissions and try again.',
          );
        }
      }
    } catch (error) {
      console.error('Error in recording process:', error);
      setIsRecording(false);
      setSelectedRecording(null);
      throw error; // Re-throw to be handled by the caller
    }
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }

    // Initialize recorder if not available
    if (!audioRecorder) {
      console.log('Audio recorder not initialized, creating a new instance');
      try {
        const recorder = new AudioRecorderPlayer();
        setAudioRecorder(recorder);

        // Wait a moment for the recorder to fully initialize
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!recorder) {
          throw new Error('Failed to create audio recorder');
        }
      } catch (error) {
        console.error('Error creating audio recorder:', error);
        Alert.alert(
          'Error',
          'Failed to initialize audio recorder. Please restart the app.',
        );
        return;
      }
    }

    // Request permissions (this will trigger native permission dialog)
    const permissionGranted = await checkAndRequestPermissions();

    if (!permissionGranted) {
      console.log('Permission denied by user');

      // Only show settings dialog if the user has previously denied
      // and we failed to get the permission when requested again
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Microphone Access Required',
          'You previously denied microphone access. Please open Settings and enable the microphone for this app.',
          [
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
      }
      return;
    }

    // Start recording if permissions are granted
    try {
      await startRecordingProcess();
    } catch (error) {
      console.error('Error in recording process:', error);

      // Show an error message for actual recording errors
      if (!error.message?.includes('permission not granted')) {
        Alert.alert(
          'Recording Error',
          error.message || 'Failed to start recording',
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <CView row style={{marginTop: 60}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={appImages.arrowLeftIcon}
              style={styles.backArrowIcon}
            />
          </TouchableOpacity>

          <CText style={styles.title}>Record your Voice</CText>
        </CView>
        <LinearGradient
          colors={['#18181B', '#231F1F', '#3A2F28']}
          locations={[0.35, 0.75, 1]}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.vocalGradient}>
          <View style={styles.textContainer}>
            <Text style={styles.headerText}>
              You can read this while recording:
            </Text>
            <CText size={'normal'} style={styles.paragraphText}>
              Music has always been a powerful way to express emotions and tell
              stories. Whether it's a soft, melodic tune or an upbeat rhythm
              that gets everyone moving, every note and every beat carries
              meaning. I love how music can take us on a journey, from the
              quietest ballads to the most energetic anthems. The beauty of a
              song lies in its ability to blend harmony, rhythm, and lyrics,
              creating something that resonates deeply. Sometimes, the lyrics
              speak louder than words, and sometimes, the instruments tell the
              story all on their own. From classical symphonies to modern pop
              hits, music connects us all, no matter where we are or what we're
              going through.
            </CText>
          </View>
        </LinearGradient>

        <View style={styles.recordingContainer}>
          <TouchableOpacity
            onPress={handleRecordPress}
            disabled={isUploading}
            style={[
              styles.recordButton,
              isUploading && styles.disabledRecordButton,
            ]}>
            <LinearGradient
              colors={
                isRecording ? ['#FFB672', '#DEB887'] : ['#DEB887', '#FFB672']
              }
              style={styles.recordButtonGradient}>
              <View style={styles.micIconContainer}>
                <Image source={appImages.micIcon} style={styles.micIcon} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.recordingStatusContainer}>
            <Text style={styles.recordingText}>
              {isUploading
                ? `Uploading... ${uploadProgress}%`
                : isRecording
                ? `Recording... ${recordingTime}`
                : 'Start recording'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* App Tracking Transparency Permission Request */}
      {Platform.OS === 'ios' && showTrackingModal && (
        <TrackingPermissionModal
          onRequestComplete={status => {
            console.log('Tracking permission status:', status);
            setShowTrackingModal(false);
          }}
        />
      )}
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
    paddingHorizontal: 12,
  },
  backButton: {
    // padding: 2,
    marginBottom: 12,
  },
  backArrowIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDF5E6',
    marginTop: 10,
    marginBottom: 40,
    marginLeft: 12,
  },
  textContainer: {
    // backgroundColor: 'rgba(40, 40, 40, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 12,
  },
  paragraphText: {
    color: '#787878',
    textAlign: 'justify',
    fontWeight: 400,
    linHeight: 18,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    overflow: 'hidden',
  },
  disabledRecordButton: {
    opacity: 0.5,
  },
  recordButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    height: 64,
    width: 64,
  },
  recordingStatusContainer: {
    padding: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: 'rgba(255, 213, 169, 0.20)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
        backgroundColor: 'transparent',
      },
      android: {
        overflow: 'hidden',
      },
    }),
  },
  recordingText: {
    color: '#999',
    fontSize: 16,
  },
  vocalGradient: {
    // width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 12,
    marginBottom: 20,
  },
});

export default VoiceRecordScreen;
