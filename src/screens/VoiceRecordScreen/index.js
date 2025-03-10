/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
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
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LinearGradient from 'react-native-linear-gradient';
import CText from '../../components/common/core/Text';
import appImages from '../../resource/images';
import axios from 'axios';
import RNFS from 'react-native-fs';
import config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';

const VoiceRecordScreen = ({navigation}) => {
  const {API_BASE_URL} = config;
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [recordings, setRecordings] = useState(null);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [isUploading, setIsUploading] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Use a ref to keep track of the record back listener
  const recordBackListenerRef = useRef(null);

  useEffect(() => {
    // Initialize the recorder once when component mounts
    const recorder = new AudioRecorderPlayer();
    setAudioRecorder(recorder);

    // Request permissions on component mount
    checkAndRequestPermissions();

    // Clean up function
    return () => {
      if (isRecording) {
        stopRecording();
      }

      if (recordBackListenerRef.current && recorder) {
        recorder.removeRecordBackListener(recordBackListenerRef.current);
        recordBackListenerRef.current = null;
      }
    };
  }, []);

  const checkAndRequestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // Check if permissions are already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );

        if (checkResult) {
          console.log('Permissions already granted');
          setPermissionsGranted(true);
          return true;
        }

        // Request permissions if not already granted
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        const allGranted = Object.values(grants).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED,
        );

        console.log('Permissions granted:', allGranted);
        setPermissionsGranted(allGranted);

        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'Please grant all permissions to use voice recording features.',
          );
        }

        return allGranted;
      } catch (err) {
        console.error('Error requesting permissions:', err);
        Alert.alert('Error', 'Failed to request permissions');
        setPermissionsGranted(false);
        return false;
      }
    } else {
      // iOS doesn't need these permissions to be requested explicitly
      setPermissionsGranted(true);
      return true;
    }
  };

  const formatTime = millis => {
    const minutes = Math.floor(millis / 1000 / 60);
    const seconds = Math.floor((millis / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
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

  const uploadToWalrus = async uri => {
    try {
      // Check for internet connection before uploading
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error(
          'No internet connection. Please try again when you are connected.',
        );
      }

      // Read the file as base64
      const fileContent = await RNFS.readFile(uri, 'base64');
      const fileName = `audio-${Date.now()}.mp3`;

      // Upload to Walrus
      const response = await axios({
        method: 'put',
        url: 'https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=5',
        data: fileContent,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Transfer-Encoding': 'base64',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000, // 30 seconds timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading to Walrus:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to upload audio',
      );
    }
  };

  const startRecordingProcess = async () => {
    // Generate a unique ID for this recording
    const recordingId = Date.now().toString();

    // Set up the file path based on platform
    const path = Platform.select({
      ios: `${RNFS.DocumentDirectoryPath}/recording_${recordingId}.m4a`,
      android: `${RNFS.CachesDirectoryPath}/recording_${recordingId}.mp4`,
    });

    try {
      setSelectedRecording(recordingId);

      // Start recording
      console.log('Starting recorder with path:', path);
      const uri = await audioRecorder.startRecorder(path);
      console.log('Recording started at:', uri);

      // Set up the recording progress listener
      recordBackListenerRef.current = audioRecorder.addRecordBackListener(e => {
        setRecordingTime(formatTime(e.currentPosition));
      });

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', `Failed to start recording: ${error.message}`);
      setIsRecording(false);
      setSelectedRecording(null);
    }
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      await stopRecording();
      return;
    }

    // Check if recorder is initialized
    if (!audioRecorder) {
      console.error('Audio recorder not initialized');
      Alert.alert('Error', 'Audio recorder not initialized');
      return;
    }

    // Check if permissions are granted
    if (!permissionsGranted) {
      const granted = await checkAndRequestPermissions();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'Recording requires microphone access. Please grant permissions in your device settings.',
        );
        return;
      }
    }

    // Start recording if permissions are granted
    await startRecordingProcess();
  };

  const stopRecording = async () => {
    if (!audioRecorder || !isRecording) {
      return;
    }

    try {
      // Remove the recording progress listener
      if (recordBackListenerRef.current) {
        audioRecorder.removeRecordBackListener(recordBackListenerRef.current);
        recordBackListenerRef.current = null;
      }

      // Stop the recording
      const uri = await audioRecorder.stopRecorder();
      console.log('Recording stopped, file saved at:', uri);

      setRecordings(uri);
      setIsRecording(false);
      setSelectedRecording(null);
      setRecordingTime('00:00');

      // Upload the recording
      try {
        setIsUploading(true);

        // Check if the file exists
        const fileExists = await RNFS.exists(uri);
        if (!fileExists) {
          throw new Error('Recording file not found');
        }

        // Upload to Walrus
        const walrusResponse = await uploadToWalrus(uri);
        const blobId = walrusResponse.newlyCreated.blobObject.blobId;
        const walrusAudioUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;

        // Save to your API
        const audioId = blobId;
        const apiResponse = await saveCoverAudio(audioId, walrusAudioUrl);

        console.log('Upload successful:', {
          localUri: uri,
          blobId,
          audioUrl: walrusAudioUrl,
          timestamp: new Date().toISOString(),
          apiResponse,
        });

        Alert.alert('Success', 'Recording uploaded successfully');
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert(
          'Upload Failed',
          `Recording saved locally but upload failed: ${uploadError.message}`,
        );
      } finally {
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', `Failed to stop recording: ${error.message}`);
      setIsRecording(false);
      setSelectedRecording(null);
      setRecordingTime('00:00');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image
            source={appImages.arrowLeftIcon}
            style={styles.backArrowIcon}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Record your Voice</Text>
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
                <Text style={styles.micIcon}>🎤</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.recordingStatusContainer}>
            <Text style={styles.recordingText}>
              {isUploading
                ? 'Uploading...'
                : isRecording
                ? `Recording... ${recordingTime}`
                : 'Start recording'}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    padding: 2,
    marginBottom: 12,
  },
  backArrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FDF5E6',
    marginBottom: 24,
  },
  textContainer: {
    backgroundColor: 'rgba(40, 40, 40, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 12,
  },
  paragraphText: {
    color: '#787878',
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
    fontSize: 24,
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
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 2,
    marginBottom: 20,
  },
});

export default VoiceRecordScreen;
