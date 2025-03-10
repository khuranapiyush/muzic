/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {Keyboard, SafeAreaView, ScrollView} from 'react-native';
import CView from '../../../common/core/View';
import CText from '../../../common/core/Text';
import TextInputFC from '../../../common/FormComponents/TextInputFC';
import {useForm} from 'react-hook-form';
import {useNavigation, useTheme} from '@react-navigation/native';
import getStyles from './AIGenerator.styles';
import Colors from '../../../common/Colors';
import {useMutation} from '@tanstack/react-query';
import fetcher from '../../../../dataProvider';
import config from 'react-native-config';
import MusicCard from './MusicCard';
import useToaster from '../../../../hooks/useToaster';
import PlayerLoader from '../../../common/Player/lib/components/PlayerLoader';
import AudioPlayer from '../../../../screens/Home/AudioPlayer';
import GenreSelectionScreen from './Filters';
import {TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PromoModal from './PromoBanner';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import {useSelector} from 'react-redux';

const AIGenerator = ({pageHeading}) => {
  const {user} = useSelector(state => state.user);
  const {API_BASE_URL} = config;
  const {mode} = useTheme();
  const {showToaster} = useToaster();
  const styles = getStyles(mode);
  const navigation = useNavigation();
  const [response, setResponse] = useState(null);
  const [videoGenerating, setVideoGenerating] = useState({
    status: 'COMPLETED',
    isGenerated: true,
  });
  const [generatedListResponse, setGeneratedListResponse] = useState(null);
  const [prompt, setPrompt] = useState('');

  const {control, getValues} = useForm({
    criteriaMode: 'all',
    mode: 'all',
    defaultValues: {
      promptText: '',
    },
  });

  const {mutate: generateVideo, isLoading: isVideoLoading} = useMutation(
    promptText =>
      fetcher.post(`${API_BASE_URL}/v1/generate-song`, {
        prompt: promptText,
      }),
    {
      onSuccess: videoResponse => {
        if (!videoResponse?.data?.errorCode) {
          setResponse(videoResponse?.data);
          setGeneratedListResponse(videoResponse?.data);
        }
      },
      onError: error => {
        showToaster({
          type: 'error',
          text1: 'Video Not Found',
          text2: error.response.data.message,
        });
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

  const handleSubmit = () => {
    Keyboard?.dismiss();
    const promptText = getValues().promptText;
    generateVideo(promptText);
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
          console.log('Failed to load sound', error);
          return;
        }

        setSound(newSound);
        setCurrentTrack({audioUrl, title, duration, imageUrl});

        newSound.play(success => {
          if (!success) {
            console.log('Sound playback failed');
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
      // if (hasShown !== 'true') {
      if (hasShown === 'true') {
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

  return (
    <SafeAreaView style={{...styles.flatList, backgroundColor: '#000'}}>
      {isVideoLoading && (
        <CView style={styles.loaderWrapper}>
          <PlayerLoader isVideoLoading={isVideoLoading} />
        </CView>
      )}
      <CView style={styles.flatList}>
        <CView style={styles.wrapper}>
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
            style={{color: Colors[mode].textLightGray}}
            onChangeText={handleInputChange}
          />
        </CView>
        {generatedListResponse && (
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
        )}
        <GenreSelectionScreen />
        <CView style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => {
              handleSubmit();
            }}
            disabled={!prompt}>
            <LinearGradient
              colors={['#F4A460', '#DEB887']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.gradient}>
              <CText style={styles.createButtonText}>Create Song</CText>
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
    </SafeAreaView>
  );
};

export default AIGenerator;
