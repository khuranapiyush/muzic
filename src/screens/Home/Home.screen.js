import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import config from 'react-native-config';
import fetcher from '../../dataProvider';
import {useMutation} from '@tanstack/react-query';
import {formatTime} from '../../utils/common';
import getStyles from './Home.style';
import {useTheme} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import useMusicPlayer from '../../hooks/useMusicPlayer';
import appImages from '../../resource/images';
import facebookEvents from '../../utils/facebookEvents';
import analyticsUtils from '../../utils/analytics';
import GradientBackground from '../../components/common/GradientBackground';
import ROUTE_NAME from '../../navigator/config/routeName';
import {useNavigation} from '@react-navigation/native';
import {Platform} from 'react-native';

const cleanSongTitle = title => {
  if (!title) {return 'Untitled Song';}
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
      style={styles.songCard}
      onPress={() => onPress({audioUrl, title, duration, imageUrl})}>
      <View style={styles.songThumbnail}>
        <Image
          source={imageUrl ? {uri: imageUrl} : appImages.songPlaceHolder}
          style={styles.thumbnailImage}
        />
        <View style={[styles.playButton]}>
          <Image
            source={
              isPlaying ? appImages.playerPauseIcon : appImages.playerPlayIcon
            }
            style={[styles.playPauseIcon, !isPlaying && {marginLeft: 4}]}
          />
        </View>
      </View>
      <LinearGradient
        colors={['#18181B', '#1E1E1E']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        locations={[0.35, 1]}
        style={styles.gradient}>
        <View style={styles.contentContainer}>
          <Text style={styles.songTitle} numberOfLines={2} ellipsizeMode="tail">
            {cleanSongTitle(title)}
          </Text>
          <Text style={styles.duration}>{formatTime(duration)} mins</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const SectionHeader = ({title, onShowAllPress}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.moreContainer}
        onPress={onShowAllPress}
        activeOpacity={0.7}>
        <Text style={styles.showMoreText}>Show All</Text>
      </TouchableOpacity>
    </View>
  );
};

const SongSection = ({
  title,
  data,
  onSongPress,
  currentSong,
  isPlaying,
  isListLoading,
  onShowAllPress,
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);

  if (isListLoading) {
    return (
      <View style={styles.sectionContainer}>
        <SectionHeader title={title} onShowAllPress={onShowAllPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFB680" />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title={title} onShowAllPress={onShowAllPress} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item, index) => item.audioUrl || index.toString()}
        renderItem={({item}) => (
          <SongCard
            title={item.title}
            duration={item.duration}
            audioUrl={item.audioUrl}
            imageUrl={item.imageUrl}
            onPress={() => onSongPress(item)}
            isPlaying={
              isPlaying &&
              currentSong &&
              (currentSong.audioUrl === item.audioUrl ||
                currentSong.uri === item.audioUrl ||
                currentSong.id === item.audioUrl)
            }
            createdAt={item.createdAt}
          />
        )}
        contentContainerStyle={styles.songListContainer}
      />
    </View>
  );
};

export default function HomeScreen() {
  const {API_BASE_URL} = config;
  const [newSongList, setNewSongList] = useState([]);
  const [trendingList, setTrendingList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {mode} = useTheme();
  const styles = getStyles(mode);
  const navigation = useNavigation();

  const {play, currentSong, isPlaying, togglePlayPause} =
    useMusicPlayer('HomeScreen');

  const {mutate: fetchAudioList, isLoading: isListLoading} = useMutation(
    () => fetcher.get(`${API_BASE_URL}/v1/audio-list`),
    {
      onSuccess: response => {
        if (response) {
          setNewSongList(
            response.data.data
              .slice(response.data.data.length - 10, response.data.data.length)
              .reverse(),
          );
          setTrendingList(response.data.data.slice(0, 10));
        }
      },
      onError: error => {
        console.error('Error fetching audio list:', error);
      },
    },
  );

  useEffect(() => {
    fetchAudioList();
  }, [fetchAudioList]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await fetchAudioList();
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert(
        'Refresh Failed',
        'Could not refresh content. Please try again.',
      );
    } finally {
      setRefreshing(false);
    }
  }, [fetchAudioList]);

  const handleSongPress = useCallback(
    song => {
      analyticsUtils.trackCustomEvent('song_played', {
        song_id: song.audioUrl,
        song_title: song.title || 'Unknown Song',
        source: 'home_screen',
        timestamp: new Date().toISOString(),
      });

      facebookEvents.logSongPlay(song.audioUrl, song.title || 'Unknown Song');

      if (
        currentSong &&
        (currentSong.audioUrl === song.audioUrl ||
          currentSong.uri === song.audioUrl ||
          currentSong.id === song.audioUrl)
      ) {
        togglePlayPause();
        return;
      }

      // Otherwise play the new song
      play(song);
    },
    [play, currentSong, togglePlayPause],
  );

  const handleShowAllPress = useCallback(
    (sectionType, sectionTitle) => {
      navigation.navigate(ROUTE_NAME.TrendingSongs, {
        sectionType,
        sectionTitle,
      });
    },
    [navigation],
  );

  const sections = [
    {
      title: 'New Songs',
      data: trendingList,
      sectionType: 'trending',
    },
    {
      title: 'Trending Songs',
      data: newSongList,
      sectionType: 'new',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]}>
      <GradientBackground>
        <ScrollView
          style={[styles.content, {backgroundColor: 'transparent'}]}
          contentContainerStyle={{paddingTop: Platform.OS === 'ios' ? 50 : 80}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#F4A460']}
              tintColor="#F4A460"
              title="Refreshing..."
              titleColor="#F4A460"
            />
          }>
          {sections.map((section, index) => (
            <SongSection
              key={index}
              title={section.title}
              data={section.data}
              onSongPress={song => handleSongPress(song)}
              currentSong={currentSong}
              isPlaying={isPlaying}
              isListLoading={isListLoading}
              onShowAllPress={() =>
                handleShowAllPress(section.sectionType, section.title)
              }
            />
          ))}
        </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  );
}
