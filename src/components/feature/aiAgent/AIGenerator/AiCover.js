/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useCallback} from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import axios from 'axios';
import {FlatList} from 'react-native-gesture-handler';
import CText from '../../../common/core/Text';
import Clipboard from 'react-native';
import useMusicPlayer from '../../../../hooks/useMusicPlayer';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 32) / 3;

const CoverCreationScreen = () => {
  const [link, setLink] = useState('');
  const [sampleVoice, setSampleVoice] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);
  // const [isRecordVoiceSelected, setIsRecordVoiceSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add global music player hook
  const {play, isPlaying, currentSong, togglePlayPause} =
    useMusicPlayer('AICoverScreen');

  // Add pagination states
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const PAGE_SIZE = 9; // Number of items to load per page

  const createVoiceConversion = async () => {
    console.log(selectedVoiceId, 'id');
    if (!selectedVoiceId) {
      Alert.alert('Error', 'Please select a voice first');
      return;
    }

    if (!link) {
      Alert.alert('Error', 'Please provide a YouTube/Spotify link');
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('voiceModelId', selectedVoiceId);

      // // If it's a recorded voice, append the sound file
      // if (isRecordVoiceSelected) {
      //   // Assuming you have the recorded file path from navigation params
      //   // const recordingInfo = route.params?.recordingInfo
      //   // if (recordingInfo?.path) {
      //   formData.append('soundFile', {
      //     // uri: selectedVoiceId,
      //     voiceModelId: selectedVoiceId,
      //     type: 'audio/mpeg',
      //     soundFile: link,
      //   });
      //   // }
      // }

      const response = await axios.post(
        'https://arpeggi.io/api/kits/v1/voice-conversions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            // voiceModelId: selectedVoiceId,
            // soundFile:
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Voice conversion successful:', response.data);
      Alert.alert('Success', 'Voice conversion created successfully');
    } catch (error) {
      console.error('Voice conversion failed:', error);
      Alert.alert('Error', 'Failed to create voice conversion');
    } finally {
      setIsLoading(false);
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

  const getVoiceSamples = async (pageNum = 1, shouldAppend = false) => {
    try {
      setIsLoadingMore(true);

      // Add pagination parameters to the API call
      const response = await axios.get(
        `https://arpeggi.io/api/kits/v1/voice-models?page=${pageNum}&limit=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        },
      );

      const newData = response.data.data || [];

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

      return response.data;
    } catch (error) {
      console.error('Failed to fetch voice samples:', error);
      Alert.alert('Error', 'Failed to fetch voice samples');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load more data when user reaches end of list
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      getVoiceSamples(nextPage, true);
    }
  }, [isLoadingMore, hasMoreData, page]);

  // Initial data load
  useEffect(() => {
    getVoiceSamples(1, false);
  }, []);

  // Handler for playing voice samples
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

  const VocalCard = ({recording}) => {
    const isSelected = selectedVoiceId === recording.id;
    const isCurrentlyPlaying =
      currentSong && currentSong.id === recording.id && isPlaying;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (isSelected) {
            setSelectedVoiceId(null);
          } else {
            setSelectedVoiceId(recording.id);
            // setIsRecordVoiceSelected(false);
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

  const RecordVocalCard = () => {
    return (
      <>
        <View style={styles.vocalTitleContainer}>
          <Text style={[styles.sectionTitle, styles.vocalTitle]}>
            🎤 My Vocals
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            // if (isRecordVoiceSelected) {
            //   setIsRecordVoiceSelected(false);
            // } else {
            //   setIsRecordVoiceSelected(true);
            //   setSelectedVoiceId(null);
            //   navigation.navigate(ROUTE_NAME.VoiceRecord);
            // }
            navigation.navigate(ROUTE_NAME.VoiceRecord);
          }}
          style={{width: CARD_WIDTH}}>
          <View style={styles.vocalCardContainer}>
            <View style={styles.topBorder} />
            <LinearGradient
              colors={['#18181B', '#231F1F', '#3A2F28']}
              locations={[0.35, 0.75, 1]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.vocalGradient}
              angle={175}>
              <View style={styles.plusContainer}>
                <CText style={styles.plusIcon}>+</CText>
              </View>
              {/* Removed the checkmark indicator */}
            </LinearGradient>
          </View>
          <Text style={styles.cardText}>
            {'Add Your Vocals'.replace(/ /, '\n')}
          </Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Link Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Youtube/Spotify Link</Text>
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
              ListHeaderComponent={RecordVocalCard}
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
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.createButton]}
          activeOpacity={0.8}
          // disabled={isLoading || (!selectedVoiceId && !isRecordVoiceSelected)}
          disabled={isLoading || !selectedVoiceId}
          onPress={createVoiceConversion}>
          <LinearGradient
            colors={['#F4A460', '#DEB887']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}>
            <CText
              style={[
                styles.createButtonText,
                // (isLoading || (!selectedVoiceId && !isRecordVoiceSelected)) &&
                //   styles.disabledButtonText,
                (isLoading || !selectedVoiceId) && styles.disabledButtonText,
              ]}>
              {isLoading ? 'Creating...' : 'Create Cover'}
            </CText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  pasteButton: {
    backgroundColor: '#DEB887',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
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
});

export default CoverCreationScreen;
