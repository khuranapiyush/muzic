/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Keyboard, SafeAreaView, Modal, View} from 'react-native';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import {useForm} from 'react-hook-form';
// import {useNavigation, useTheme} from '@react-navigation/native';
import getStyles from './AIGenerator.styles';
import Colors from '../../../common/Colors';
import {useMutation} from '@tanstack/react-query';
import config from 'react-native-config';
import MusicCard from './MusicCard';
import useToaster from '../../../../hooks/useToaster';
// import PlayerLoader from '../../../common/Player/lib/components/PlayerLoader';
import AudioPlayer from '../../../../screens/Home/AudioPlayer';
import GenreSelectionScreen from './Filters';
import {TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PromoModal from './PromoBanner';
// import ROUTE_NAME from '../../../../navigator/config/routeName';
import {useSelector} from 'react-redux';
import fetcher from '../../../../dataProvider';
import {useTheme} from '@react-navigation/native';
import {
  getAuthToken,
  makeAuthenticatedRequest,
} from '../../../../utils/authUtils';

const AIGenerator = ({pageHeading}) => {
  const {user} = useSelector(state => state.user);
  const authState = useSelector(state => state.auth);
  const {API_BASE_URL} = config;
  const {mode} = useTheme();
  const {showToaster} = useToaster();
  const styles = getStyles(mode);
  // const navigation = useNavigation();
  const [response, setResponse] = useState(null);
  const [videoGenerating, setVideoGenerating] = useState({
    status: 'COMPLETED',
    isGenerated: true,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedListResponse, setGeneratedListResponse] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [resetSelections, setResetSelections] = useState(false);

  const {control, getValues, reset} = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      promptText: '',
    },
  });

  // Reset form when component unmounts
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const generateSongMutation = async promptText => {
    const formattedPrompt = promptText.trim();

    if (!formattedPrompt) {
      throw new Error('Please enter a valid prompt');
    }

    // Prepare the request payload with genre and voice if available
    const requestPayload = {
      prompt: formattedPrompt,
    };

    // Add genre if selected
    if (selectedGenre) {
      requestPayload.genre = selectedGenre;
    }

    // Add voice if selected
    if (selectedVoice) {
      requestPayload.voice = selectedVoice;
    }

    console.log('Sending request with payload:', requestPayload);

    // Make authenticated request with automatic token refresh
    return await makeAuthenticatedRequest(async () => {
      // Get the current auth token
      const token = await getAuthToken();

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the API call
      const response = await fetcher.post(
        `${API_BASE_URL}/v1/generate-song`,
        requestPayload,
        {headers},
      );

      return response.data;
    });
  };

  // Inside useMutation
  const {mutate: generateSong, isLoading: isGeneratingSong} = useMutation(
    async promptText => generateSongMutation(promptText),
    {
      onSuccess: data => {
        if (!data?.errorCode) {
          setResponse(data);
          setGeneratedListResponse(data);
          setErrorMessage('');
          showToaster({
            type: 'success',
            text1: 'Success',
            text2: 'Song generated successfully!',
          });
        } else {
          setErrorMessage(`Error: ${data.message || 'Unknown error'}`);
          showToaster({
            type: 'error',
            text1: 'Generation Failed',
            text2: data.message || 'Unknown error occurred',
          });
        }
      },
      onError: error => {
        handleApiError(error);
      },
    },
  );

  const handleApiError = error => {
    let errorMsg = 'Failed to generate song';

    if (error.message && error.message.includes('Network Error')) {
      errorMsg =
        'Network connection failed. Please check your internet connection and try again.';
    } else if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message;
      } else if (error.response.status === 429) {
        errorMsg = 'Too many requests. Please try again later.';
      } else if (error.response.status >= 500) {
        errorMsg = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      errorMsg =
        'No response received from server. Please check your internet connection.';
    } else {
      errorMsg = error.message;
    }

    setErrorMessage(errorMsg);
    showToaster({
      type: 'error',
      text1: 'Generation Failed',
      text2: errorMsg,
    });
  };

  const getRenderDetail = () => {
    return {
      heading: 'Music Description',
      placeholderText:
        'Describe the style of music and the topic you want, AI will generate video for you',
      component: generatedListResponse ? (
        <CView key={generatedListResponse?.id}>
          <MusicCard
            item={generatedListResponse?.data}
            index={generatedListResponse?.id}
            videoGenerating={videoGenerating}
          />
        </CView>
      ) : null,
    };
  };

  const handleSubmit = async () => {
    Keyboard?.dismiss();
    setErrorMessage('');

    const formValues = getValues();
    const promptText = formValues.promptText;

    if (!promptText || promptText.trim() === '') {
      setErrorMessage('Please enter a description for your song');
      showToaster({
        type: 'error',
        text1: 'Empty Prompt',
        text2: 'Please enter a description for your song',
      });
      return;
    }

    try {
      await generateSong(promptText);
      setShowBottomSheet(true);

      // Reset the form and selections after successful submission
      reset();
      setPrompt('');
      setSelectedGenre(null);
      setSelectedVoice(null);

      // Trigger reset in the GenreSelectionScreen
      setResetSelections(true);
      // Reset the flag after a short delay
      setTimeout(() => {
        setResetSelections(false);
      }, 100);
    } catch (error) {
      // SILENTLY RETURN
      return;
    }

    setPrompt('');
    // Handle the case when the user has no credits
    // navigation.navigate(ROUTE_NAME.SubscriptionScreen);
  };

  const handleInputChange = text => {
    setPrompt(text);
  };

  const [currentTrack, setCurrentTrack] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause(() => {
          setIsPlaying(false);
        });
      } else {
        sound.play(success => {
          if (!success) {
            console.log('Sound playback failed');
          }
        });
        setIsPlaying(true);
      }
    }
  };

  const handleSongPress = (audioUrl, title, duration, imageUrl) => {
    try {
      if (currentTrack?.audioUrl === audioUrl) {
        handlePlayPause();
        return;
      }
      if (sound) {
        sound.release();
      }

      const newSound = new Sound(audioUrl, null, error => {
        if (error) {
          return;
        }

        setSound(newSound);
        setCurrentTrack({audioUrl, title, duration, imageUrl});

        newSound.play(success => {
          if (!success) {
          }
        });
        setIsPlaying(true);
        newSound.setNumberOfLoops(0);
        newSound.onEnded = () => {
          setIsPlaying(false);
        };
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkIfModalShown();
  }, []);

  const checkIfModalShown = async () => {
    try {
      const hasShown = await AsyncStorage.getItem('promoModalShown');
      if (hasShown !== 'true') {
        // if (hasShown === 'true') {
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error checking modal shown status:', error);
    }
  };

  const handleCloseModal = async () => {
    setModalVisible(false);
    try {
      await AsyncStorage.setItem('promoModalShown', 'true');
    } catch (error) {
      console.error('Error saving modal shown status:', error);
    }
  };

  console.log(isGeneratingSong, 'isGeneratingSong');

  // Handle genre selection from the GenreSelectionScreen
  const handleGenreSelect = genre => {
    console.log('Selected genre:', genre);
    setSelectedGenre(genre);
  };

  // Handle voice selection from the GenreSelectionScreen
  const handleVoiceSelect = voice => {
    console.log('Selected voice:', voice);
    setSelectedVoice(voice);
  };

  return (
    <SafeAreaView style={{...styles.flatList, backgroundColor: '#000'}}>
      {/* {isGeneratingSong && (
        <CView style={styles.loaderWrapper}>
          <PlayerLoader isVideoLoading={isGeneratingSong} />
        </CView>
      )} */}
      <CView style={styles.flatList}>
        <CView style={styles.wrapper}>
          <CText size="largeBold" style={styles.promptHeading}>
            Write your Prompt
          </CText>
          <TextInputFC
            control={control}
            name={'promptText'}
            autoComplete={'off'}
            autoCorrect={false}
            placeholder={getRenderDetail(pageHeading).placeholderText}
            multiline={true}
            numberOfLines={5}
            placeholderTextColor={Colors[mode].textLightGray}
            customStyles={styles.inputContainerStyles}
            style={{
              color: Colors[mode].textLightGray,
              textAlignVertical: 'top',
            }}
            onChangeText={handleInputChange}
          />
          {errorMessage ? (
            <CText style={styles.errorText}>{errorMessage}</CText>
          ) : null}
        </CView>

        {/* Show selected genre and voice */}
        {/* {(selectedGenre || selectedVoice) && (
          <CView style={styles.selectionInfoContainer}>
            <CText size="medium" style={styles.selectionInfoText}>
              Selected: {selectedGenre && `Genre: ${selectedGenre}`}{' '}
              {selectedVoice && `Voice: ${selectedVoice}`}
            </CText>
          </CView>
        )} */}

        {/* {generatedListResponse && (
          <>
            <CView style={styles.cardListContainer}>
              <CView style={styles.resultTitle}>
                <CText size="largeBold">Generated Results</CText>
              </CView>
            </CView>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.flatList}>
              <CView key={generatedListResponse?.id}>
                <MusicCard
                  item={generatedListResponse?.data}
                  index={generatedListResponse?.id}
                  handlePlayPause={handleSongPress}
                />
              </CView>
            </ScrollView>
          </>
        )} */}
        <GenreSelectionScreen
          onGenreSelect={handleGenreSelect}
          onVoiceSelect={handleVoiceSelect}
          resetSelections={resetSelections}
        />
        <CView style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={!prompt || isGeneratingSong}>
            <LinearGradient
              colors={['#F4A460', '#DEB887']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.gradient}>
              <CText
                style={[
                  styles.createButtonText,
                  (!prompt || isGeneratingSong) && styles.disabledButtonText,
                ]}>
                {isGeneratingSong ? 'Generating...' : 'Create Song'}
              </CText>
            </LinearGradient>
          </TouchableOpacity>
        </CView>
      </CView>
      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
      />
      {user && <PromoModal visible={modalVisible} onClose={handleCloseModal} />}

      {/* Bottom Sheet Notification */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBottomSheet}
        onRequestClose={() => setShowBottomSheet(false)}>
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetContent}>
            <CText size="largeBold" style={styles.bottomSheetTitle}>
              Song Generation Started
            </CText>
            <CText style={styles.bottomSheetText}>
              Your song will be generated in 10 mins. Come back and check in the
              library.
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

export default AIGenerator;
