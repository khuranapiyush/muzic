import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useTheme, useNavigation} from '@react-navigation/native';
import config from 'react-native-config';
import fetcher from '../../dataProvider';
import {useMutation} from '@tanstack/react-query';
import {formatTime} from '../../utils/common';
import useMusicPlayer from '../../hooks/useMusicPlayer';
import appImages from '../../resource/images';
import facebookEvents from '../../utils/facebookEvents';
import analyticsUtils from '../../utils/analytics';
import GradientBackground from '../../components/common/GradientBackground';
import getStyles from './TrendingSongs.style';

const cleanSongTitle = title => {
  if (!title) {
    return 'Untitled Song';
  }
  return title.replace(/"/g, '').trim();
};

const SongCard = ({
  title,
  duration,
  audioUrl,
  imageUrl,
  onPress,
  isPlaying,
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);

  return (
    <TouchableOpacity
      style={[styles.songCard, isPlaying && styles.playingSongCard]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.contentContainer}>
        <Image
          source={imageUrl ? {uri: imageUrl} : appImages.songPlaceHolder}
          style={styles.songImage}
          resizeMode="cover"
        />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1} ellipsizeMode="tail">
            {cleanSongTitle(title)}
          </Text>
          <Text style={styles.duration}>{formatTime(duration)} mins</Text>
        </View>
        <TouchableOpacity style={styles.playButton} onPress={onPress}>
          <View style={styles.playIconContainer}>
            <Image
              source={
                isPlaying ? appImages.playerPauseIcon : appImages.playerPlayIcon
              }
              style={styles.playIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const TrendingSongsScreen = ({route}) => {
  const {API_BASE_URL} = config;
  const {mode} = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(mode);
  const [newSongList, setNewSongList] = useState([]);
  const [trendingList, setTrendingList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const {play, currentSong, togglePlayPause, isPlaying} = useMusicPlayer(
    'TrendingSongsScreen',
  );

  const sectionType = route?.params?.sectionType || 'trending';
  const sectionTitle = route?.params?.sectionTitle || 'Trending Songs';

  const {mutate: fetchTrendingList, isLoading: isListLoading} = useMutation(
    () => fetcher.get(`${API_BASE_URL}/v1/audio-list`),
    {
      onSuccess: data => {
        setTrendingList(data.data.data);
      },
      onError: error => {
        console.error('Error fetching audio list:', error);
      },
    },
  );

  const {mutate: fetchNewSongList, isLoading: isTrendingLoading} = useMutation(
    () => fetcher.get(`${API_BASE_URL}/v1/audio-list`),
    {
      onSuccess: data => {
        if (data.data) {
          setNewSongList(data.data.data.reverse());
        }
      },
      onError: error => {
        console.error('Error fetching trending list:', error);
      },
    },
  );

  useEffect(() => {
    if (sectionType === 'trending') {
      console.log('fetching trending list');
      fetchTrendingList();
    } else {
      console.log('fetching audio list');
      fetchNewSongList();
    }
  }, [fetchTrendingList, fetchNewSongList, sectionType]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      if (sectionType === 'trending') {
        await fetchTrendingList();
      } else {
        await fetchNewSongList();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchNewSongList, fetchTrendingList, sectionType]);

  const handleSongPress = useCallback(
    song => {
      analyticsUtils.trackCustomEvent('song_played', {
        song_id: song.audioUrl,
        song_title: song.title || 'Unknown Song',
        source: 'trending_songs_screen',
        timestamp: new Date().toISOString(),
      });

      facebookEvents.logSongPlay(song.audioUrl, song.title || 'Unknown Song');

      if (currentSong && currentSong.audioUrl === song.audioUrl) {
        togglePlayPause();
        return;
      }

      play(song);
    },
    [play, currentSong, togglePlayPause],
  );

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderSongItem = ({item}) => (
    <SongCard
      title={item.title}
      duration={item.duration}
      audioUrl={item.audioUrl}
      imageUrl={item.imageUrl}
      isPlaying={
        currentSong && currentSong.audioUrl === item.audioUrl && isPlaying
      }
      onPress={() => handleSongPress(item)}
    />
  );

  const getSongList = () => {
    return sectionType === 'trending' ? trendingList : newSongList;
  };

  const isLoading =
    sectionType === 'trending' ? isTrendingLoading : isListLoading;

  return (
    <SafeAreaView style={styles.container}>
      <GradientBackground>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}>
              <Image
                source={appImages.arrowLeftIcon}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{sectionTitle}</Text>
          </View>

          {/* Song List */}
          {isLoading && getSongList().length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F4A460" />
              <Text style={styles.loadingText}>Loading songs...</Text>
            </View>
          ) : (
            <FlatList
              data={getSongList()}
              renderItem={renderSongItem}
              keyExtractor={item => item.audioUrl || item._id}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#F4A460']}
                  tintColor="#F4A460"
                  title="Refreshing..."
                  titleColor="#F4A460"
                />
              }
            />
          )}
        </View>
      </GradientBackground>
    </SafeAreaView>
  );
};

export default TrendingSongsScreen;
