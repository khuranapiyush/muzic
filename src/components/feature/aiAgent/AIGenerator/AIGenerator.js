/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Keyboard, SafeAreaView, Modal, View} from 'react-native';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import {useForm} from 'react-hook-form';
import getStyles from './AIGenerator.styles';
import Colors from '../../../common/Colors';
import {useMutation} from '@tanstack/react-query';
import config from 'react-native-config';
import MusicCard from './MusicCard';
import useToaster from '../../../../hooks/useToaster';
import AudioPlayer from '../../../../screens/Home/AudioPlayer';
import GenreSelectionScreen from './Filters';
import {TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PromoModal from './PromoBanner';
import {useSelector} from 'react-redux';
import fetcher from '../../../../dataProvider';
import {useTheme} from '@react-navigation/native';
import {getAuthToken} from '../../../../utils/authUtils';
import useCredits from '../../../../hooks/useCredits';

const AIGenerator = ({pageHeading}) => {
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

  const generateSongMutation = async (promptText, genreValue, voiceValue) => {
    // Use the provided values or fall back to state if not provided
    const genreToUse = genreValue !== undefined ? genreValue : selectedGenre;
    const voiceToUse = voiceValue !== undefined ? voiceValue : selectedVoice;

    const formattedPrompt = promptText.trim();

    if (!formattedPrompt) {
      throw new Error('Please enter a valid prompt');
    }

    // Prepare the request payload with genre and voice if available
    const requestPayload = {
      prompt: formattedPrompt,
    };

    // Add genre if selected - ensure it's added with the correct field name
    if (genreToUse && genreToUse.trim() !== '') {
      requestPayload.genre = genreToUse.trim();
      console.log('Including genre in request:', genreToUse);
    }

    // Add voice if selected - ensure it's added with the correct field name
    if (voiceToUse && voiceToUse.trim() !== '') {
      requestPayload.voice = voiceToUse.trim();
      console.log('Including voice in request:', voiceToUse);
    }

    console.log(
      'Final request payload:',
      JSON.stringify(requestPayload, null, 2),
    );

    // Get auth token
    const token = await getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Using fetcher with a much longer timeout since we know song generation takes time
    const response = await fetcher.post(
      `${API_BASE_URL}/v1/generate-song`,
      requestPayload,
      {
        headers,
        timeout: 300000, // 5 minutes timeout - significantly longer to accommodate AI processing time
      },
    );

    return response.data;
  };

  // Inside useMutation
  const {mutate: generateSong} = useMutation(
    // Pass the params directly to the mutation function
    params =>
      generateSongMutation(params.promptText, params.genre, params.voice),
    {
      onSuccess: data => {
        if (!data?.errorCode) {
          console.log('Song generation successful:', data);
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
        // We'll handle errors in a more user-friendly way
        console.log('Song generation error:', error);

        // Don't show error toasts for timeouts - the user already knows their song is being generated
        // Only show errors for clear server issues
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          let errorMsg = 'Failed to generate song';

          if (error.response.data && error.response.data.message) {
            errorMsg = error.response.data.message;
          }

          setErrorMessage(errorMsg);
          showToaster({
            type: 'error',
            text1: 'Generation Failed',
            text2: errorMsg,
          });
        }
      },
    },
  );

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

    // Store current selections before showing UI changes
    const genreToSend = selectedGenre;
    const voiceToSend = selectedVoice;

    // Show the bottom sheet immediately to inform the user
    setShowBottomSheet(true);

    // Reset the form and selections immediately for better UX
    reset();
    setPrompt('');

    // Reset selections for UI
    setSelectedGenre(null);
    setSelectedVoice(null);

    // Trigger reset in the GenreSelectionScreen
    setResetSelections(true);
    // Reset the flag after a short delay
    setTimeout(() => {
      setResetSelections(false);
    }, 100);

    // Call the mutation with the stored values
    generateSong({
      promptText: promptText,
      genre: genreToSend,
      voice: voiceToSend,
    });

    // No need for try/catch here as the mutation handles errors
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
            return;
          }
        });
        setIsPlaying(true);
      }
    }
  };

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkIfModalShown();
  }, []);

  const checkIfModalShown = async () => {
    if (modalVisible) {
      setModalVisible(false);
    } else {
      setModalVisible(true);
    }
  };

  const handleCloseModal = async () => {
    setModalVisible(false);
  };

  // Handle genre selection from the GenreSelectionScreen
  const handleGenreSelect = genre => {
    console.log('Genre selected in AIGenerator:', genre);
    setSelectedGenre(genre);
  };

  // Handle voice selection from the GenreSelectionScreen
  const handleVoiceSelect = voice => {
    console.log('Voice selected in AIGenerator:', voice);
    setSelectedVoice(voice);
  };

  const {credits} = useCredits();

  const getCreditsValue = creditsData => {
    if (typeof creditsData === 'object' && creditsData !== null) {
      return creditsData?.data?.balance || 0;
    }
    return typeof creditsData === 'number' ? creditsData : 0;
  };

  const creditsValue = getCreditsValue(credits);

  return (
    <SafeAreaView style={{...styles.flatList, backgroundColor: '#000'}}>
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
          <View style={styles.creditsContainer}>
            <CText style={styles.creditsText}>Song Left: {creditsValue}</CText>
          </View>
          {errorMessage ? (
            <CText style={styles.errorText}>{errorMessage}</CText>
          ) : null}
        </CView>
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
            disabled={!prompt}>
            <LinearGradient
              colors={['#F4A460', '#DEB887']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.gradient}>
              <CText
                style={[
                  styles.createButtonText,
                  !prompt && styles.disabledButtonText,
                ]}>
                {'Create Song'}
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
      {authState.isLoggedIn && (
        <PromoModal visible={modalVisible} onClose={handleCloseModal} />
      )}

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
