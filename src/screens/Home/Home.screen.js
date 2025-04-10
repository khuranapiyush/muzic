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

// Add helper function to clean song titles
const cleanSongTitle = title => {
  if (!title) return 'Untitled Song';
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
  const {isPlaying: globalIsPlaying} = useMusicPlayer('HomeScreen');

  return (
    <TouchableOpacity
      style={styles.songCard}
      onPress={() => onPress({audioUrl, title, duration, imageUrl})}>
      <View style={styles.songThumbnail}>
        <Image
          source={imageUrl ? {uri: imageUrl} : appImages.songPlaceHolder}
          style={styles.thumbnailImage}
        />
        <View style={[styles.playButton, isPlaying && styles.playButtonActive]}>
          <Image
            source={
              isPlaying && globalIsPlaying
                ? appImages.playerPauseIcon
                : appImages.playerPlayIcon
            }
            style={styles.playPauseIcon}
          />
        </View>
      </View>
      <LinearGradient
        colors={['#18181B', '#3C3129']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        locations={[0.35, 1]}
        style={styles.gradient}>
        <View style={styles.contentContainer}>
          <Text style={styles.songTitle}>
            {cleanSongTitle(title).slice(0, 18)}...
          </Text>
          <Text style={styles.duration}>{formatTime(duration)}</Text>
          {/* <Text style={styles.duration}>{formatDate(createdAt)}</Text> */}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const SectionHeader = ({title}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
};

// Song Section Component
const SongSection = ({
  title,
  data,
  onSongPress,
  currentSongId,
  isListLoading,
}) => {
  const {mode} = useTheme();
  const styles = getStyles(mode);

  if (isListLoading) {
    return (
      <View style={styles.sectionContainer}>
        <SectionHeader title={title} />
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
      <SectionHeader title={title} />
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
            isPlaying={currentSongId === item.audioUrl}
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
  const [audioList, setAudioList] = useState([]);
  const [trendingList, setTrendingList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {mode} = useTheme();
  const styles = getStyles(mode);

  // Use our custom music player hook
  const {play, currentSong, togglePlayPause} = useMusicPlayer('HomeScreen');

  // Fetch audio list mutation
  const {mutate: fetchAudioList, isLoading: isListLoading} = useMutation(
    () => fetcher.get(`${API_BASE_URL}/v1/audio-list`),
    {
      onSuccess: response => {
        if (response) {
          setAudioList(response.data.data.slice(0, 10));
          setTrendingList(
            response.data.data.slice(
              response.data.data.length - 10,
              response.data.data.length,
            ),
          );
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

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      // Call the mutation to fetch fresh data
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

  const handleSongPress = (song, sectionData) => {
    // Format the song to match the expected format for the global player
    const formattedSong = {
      id: song.audioUrl, // Use audioUrl as unique ID
      title: cleanSongTitle(song.title),
      artist: 'Artist', // Add a default artist or get it from your data
      uri: song.audioUrl,
      thumbnail: song.imageUrl,
      poster: song.imageUrl,
      duration: song.duration,
    };

    // Format the full section list of songs
    const formattedSongList = sectionData.map(item => ({
      id: item.audioUrl,
      title: cleanSongTitle(item.title),
      artist: 'Artist',
      uri: item.audioUrl,
      thumbnail: item.imageUrl,
      poster: item.imageUrl,
      duration: item.duration,
    }));

    // If the same song is playing, toggle play/pause
    if (currentSong && currentSong.uri === song.audioUrl) {
      togglePlayPause();
    } else {
      // Otherwise play the new song with the full list
      play(formattedSong, formattedSongList);
    }
  };

  const sections = [
    {
      title: 'Trending Songs',
      data: trendingList,
    },
    {
      title: 'New Songs',
      data: audioList,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
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
            onSongPress={song => handleSongPress(song, section.data)}
            currentSongId={currentSong?.uri}
            isListLoading={isListLoading}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
