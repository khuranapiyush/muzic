/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  Keyboard,
  SafeAreaView,
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
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
import GenreSelectionScreen from './Filters';
import LinearGradient from 'react-native-linear-gradient';
import PromoModal from './PromoBanner';
import {useSelector, useDispatch} from 'react-redux';
import fetcher from '../../../../dataProvider';
import {useTheme} from '@react-navigation/native';
import {getAuthToken} from '../../../../utils/authUtils';
import GradientBackground from '../../../common/GradientBackground';
import useCredits from '../../../../hooks/useCredits';
import {
  setGeneratingSong,
  setGeneratingSongId,
} from '../../../../stores/slices/player';
import {useNavigation} from '@react-navigation/native';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import {selectCreditsPerSong} from '../../../../stores/selector';
import analyticsUtils from '../../../../utils/analytics';
import facebookEvents from '../../../../utils/facebookEvents';
import moEngageService from '../../../../services/moengageService';
import {BranchEvent} from 'react-native-branch';

const AIGenerator = ({pageHeading}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const authState = useSelector(state => state.auth);
  const {API_BASE_URL} = config;
  const {mode} = useTheme();
  const {showToaster} = useToaster();
  const styles = getStyles(mode);
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
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] =
    useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

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
    }

    // Add voice if selected - ensure it's added with the correct field name
    if (voiceToUse && voiceToUse.trim() !== '') {
      requestPayload.voice = voiceToUse.trim();
    }

    // Get auth token
    const token = await getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetcher.post(
      `${API_BASE_URL}/v1/generate-song`,
      requestPayload,
      {
        headers,
        // No timeout specified - allows unlimited time for AI processing
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
          setResponse(data);
          setGeneratedListResponse(data);
          setErrorMessage('');

          // Store the generated song ID for tracking
          if (data._id) {
            dispatch(setGeneratingSongId(data._id));
            dispatch(setGeneratingSong(false));
          }

          dispatch(setGeneratingSong(false));
          // Only show toast for direct UI feedback about generation success
          // Don't show song generation progress notifications here
          showToaster({
            type: 'success',
            text1: 'Success',
            text2: 'Song generated successfully!',
          });

          // Track song prompt creation - using enhanced event name with more detail
          analyticsUtils.trackCustomEvent('song_created', {
            method: 'ai_generator',
            song_id: data._id || 'unknown',
            prompt: data.prompt,
            screen: 'ai_generator',
            word_count: data.prompt.split(' ').length,
            title: data.title || 'Untitled',
            singer: data.singer || 'Unknown',
            genre: data.genre || 'Not specified',
            voice: data.voice || 'Not specified',
            timestamp: Date.now(),
          });

          // Track song creation with Facebook Events + MoEngage + Branch
          try {
            facebookEvents.logCustomEvent('song_created', {
              method: 'ai_generator',
              song_id: data._id || 'unknown',
              screen: 'ai_generator',
              prompt: data.prompt,
              word_count: data.prompt.split(' ').length,
              title: data.title || 'Untitled',
              singer: data.singer || 'Unknown',
              genre: data.genre || 'Not specified',
              voice: data.voice || 'Not specified',
              timestamp: Date.now(),
            });

            moEngageService.trackEvent('AI_Content_Generated', {
              generation_type: 'song',
              song_id: data._id || 'unknown',
              prompt: data.prompt,
              title: data.title || 'Untitled',
              genre: data.genre || 'Not specified',
              voice: data.voice || 'Not specified',
            });

            new BranchEvent('AI_SONG_GENERATED', {
              song_id: data._id || 'unknown',
              title: data.title || 'Untitled',
            }).logEvent();
          } catch (error) {
            // Silent error handling
          }
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

          // Reset the generation state on error
          dispatch(setGeneratingSong(false));
          dispatch(setGeneratingSongId(null));
        }
      },
    },
  );

  const getRenderDetail = () => {
    return {
      heading: 'Music Description',
      placeholderText:
        'Tell us the vibe and topic, and let AI create your perfect soundtrack!',
      component: generatedListResponse ? (
        <CView key={generatedListResponse?.id}>
          <MusicCard
            item={generatedListResponse?.data}
            index={generatedListResponse?.id}
            videoGenerating={videoGenerating}
            songList={[generatedListResponse?.data]}
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
      setShowValidationModal(true);
      return;
    }

    // Track create song button click
    analyticsUtils.trackCustomEvent('create_song_button_click', {
      screen: 'ai_generator',
      prompt_length: promptText.trim().length,
      genre: selectedGenre || 'not_selected',
      voice: selectedVoice || 'not_selected',
      timestamp: Date.now(),
    });

    // Track with Facebook Events
    try {
      facebookEvents.logCustomEvent('create_song_button_click', {
        screen: 'ai_generator',
        genre: selectedGenre || 'not_selected',
        voice: selectedVoice || 'not_selected',
      });
    } catch (error) {
      // Silent error handling
    }

    // Check if user has sufficient credits
    if (creditsValue <= 0) {
      // Show insufficient credits modal instead of alert
      setShowInsufficientCreditsModal(true);
      return;
    }

    // Store current selections before showing UI changes
    const genreToSend = selectedGenre;
    const voiceToSend = selectedVoice;

    // Show the bottom sheet immediately to inform the user
    setShowBottomSheet(true);

    // Set global generating state - this will trigger the library indicator
    dispatch(setGeneratingSong(true));

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

    try {
      // Call the mutation with the stored values
      await generateSong({
        promptText: promptText,
        genre: genreToSend,
        voice: voiceToSend,
      });
      dispatch(setGeneratingSong(true));
    } catch (error) {
      dispatch(setGeneratingSong(false));
      dispatch(setGeneratingSongId(null));
      throw error;
    }
  };

  const handleInputChange = text => {
    setPrompt(text);
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
    setSelectedGenre(genre);
  };

  // Handle voice selection from the GenreSelectionScreen
  const handleVoiceSelect = voice => {
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

  const creditsPerSong = useSelector(selectCreditsPerSong);

  const {showGlobalPlayer} = useSelector(state => state.player);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={{...styles.flatList, backgroundColor: 'transparent'}}>
        <GradientBackground>
          <CView style={[styles.flatList, {backgroundColor: 'transparent'}]}>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={[
                styles.scrollContentContainer,
                {paddingTop: Platform.OS === 'ios' ? 50 : 70},
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <CView style={styles.wrapper}>
                <CText size="largeBold" style={styles.promptHeading}>
                  Description
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
              <GenreSelectionScreen
                onGenreSelect={handleGenreSelect}
                onVoiceSelect={handleVoiceSelect}
                resetSelections={resetSelections}
              />
              {/* Add padding at the bottom to ensure content isn't hidden behind the button */}
              <View style={styles.scrollBottomPadding} />
            </ScrollView>
            <CView
              style={[
                styles.buttonContainer,
                showGlobalPlayer && {bottom: 90},
              ]}>
              <View style={styles.creditsContainer}>
                <CText style={styles.creditsText}>
                  {Math.floor(creditsValue / creditsPerSong)} Songs Left
                </CText>
              </View>
              <TouchableOpacity
                style={styles.createButton}
                activeOpacity={0.8}
                onPress={handleSubmit}>
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.20)',
                    'rgba(255, 255, 255, 0.40)',
                  ]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.gradient}>
                  <CText style={[styles.createButtonText]}>Create Song</CText>
                </LinearGradient>
              </TouchableOpacity>
            </CView>
          </CView>
          {authState.isLoggedIn && (
            <PromoModal visible={modalVisible} onClose={handleCloseModal} />
          )}

          {/* Bottom Sheet Notification */}
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
                  Song Generation Started
                </CText>
                <CText style={styles.bottomSheetText}>
                  Your song will be generated in 10 mins. Come back and check in
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

          {/* Insufficient Credits Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showInsufficientCreditsModal}
            onRequestClose={() => setShowInsufficientCreditsModal(false)}
            onBackdropPress={() => setShowInsufficientCreditsModal(false)}
            onBackButtonPress={() => setShowInsufficientCreditsModal(false)}
            swipeDirection={['down']}
            propagateSwipe
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            avoidKeyboard={true}>
            <View style={styles.bottomSheetContainer}>
              <View style={styles.bottomSheetContent}>
                <CText size="largeBold" style={styles.bottomSheetTitle}>
                  Insufficient Credits
                </CText>
                <CText style={styles.bottomSheetText}>
                  Please buy some credits to generate song
                </CText>
                <TouchableOpacity
                  style={styles.bottomSheetButton}
                  onPress={() => {
                    setShowInsufficientCreditsModal(false);
                    navigation.navigate(ROUTE_NAME.SubscriptionScreen);
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
          </Modal>

          {/* Validation Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showValidationModal}
            onRequestClose={() => setShowValidationModal(false)}
            onBackdropPress={() => setShowValidationModal(false)}
            onBackButtonPress={() => setShowValidationModal(false)}>
            <TouchableWithoutFeedback
              onPress={() => setShowValidationModal(false)}>
              <View style={styles.bottomSheetContainer}>
                <TouchableWithoutFeedback>
                  <View style={styles.bottomSheetContent}>
                    <CText size="largeBold" style={styles.bottomSheetTitle}>
                      Missing Prompt
                    </CText>
                    <CText style={styles.bottomSheetText}>
                      Please add a prompt for song creation
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
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </GradientBackground>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default AIGenerator;
