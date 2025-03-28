import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import config from 'react-native-config';
import {useMutation} from '@tanstack/react-query';
import fetcher from '../../../dataProvider';
import {formatTime} from '../../../utils/common';
import {getAuthToken, makeAuthenticatedRequest} from '../../../utils/authUtils';
import useMusicPlayer from '../../../hooks/useMusicPlayer';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const LibraryScreen = () => {
  const {API_BASE_URL} = config;
  const [audioList, setAudioList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Use our global music player hook
  const {play, isPlaying, currentSong, togglePlayPause} =
    useMusicPlayer('LibraryScreen');

  // Fetch audio list mutation
  const {mutate: fetchAudioList, isLoading: isListLoading} = useMutation(
    async () => {
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

        const response = await fetcher.get(`${API_BASE_URL}/v1/library`, {
          headers,
        });
        return response;
      });
    },
    {
      onSuccess: response => {
        if (response) {
          setAudioList(response.data.data);
        }
      },
      onError: error => {
        console.error('Error fetching audio list:', error);
      },
    },
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    console.log('Refreshing library...');

    fetchAudioList(undefined, {
      onSuccess: () => {
        console.log('Library refresh complete');
        setRefreshing(false);
      },
      onError: error => {
        console.error('Error refreshing library:', error);
        Alert.alert(
          'Refresh Failed',
          'Could not refresh library. Please try again.',
        );
        setRefreshing(false);
      },
      onSettled: () => {
        // This executes regardless of success or failure
        setRefreshing(false);
      },
    });
  }, [fetchAudioList]);

  useEffect(() => {
    fetchAudioList();
  }, [fetchAudioList]);

  const handleSongPress = (audioUrl, title, duration, imageUrl) => {
    // Format the song for the global player
    const formattedSong = {
      id: audioUrl,
      title: title,
      artist: 'Library Song',
      uri: audioUrl,
      thumbnail: imageUrl,
      poster: imageUrl,
      duration: duration || 0,
    };

    // If the same song is playing, toggle play/pause
    if (currentSong && currentSong.uri === audioUrl) {
      togglePlayPause();
    } else {
      // Otherwise play the new song
      play(formattedSong);
    }
  };

  const SongItem = ({song}) => {
    const isCurrentlyPlaying =
      currentSong && currentSong.uri === song.audioUrl && isPlaying;
    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentlyPlaying && styles.playingSongItem]}
        onPress={() =>
          handleSongPress(
            song.audioUrl,
            song.title,
            song.duration,
            song.imageUrl,
          )
        }>
        <Image source={{uri: song.imageUrl}} style={styles.songImage} />
        {isCurrentlyPlaying && (
          <View style={styles.playingIndicator}>
            <Image
              // source={require('../../../resource/images/playing.gif')}
              style={styles.playingIcon}
            />
          </View>
        )}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songGenres}>{formatTime(song.duration)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Library</Text>
      {isListLoading ? (
        <ActivityIndicator color="#FFD5A9" size="large" style={styles.loader} />
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FFD5A9']}
              tintColor="#FFD5A9"
              title="Pull to refresh..."
              titleColor="#FFD5A9"
            />
          }>
          <View style={styles.songsList}>
            {audioList?.map(song => (
              <SongItem key={song._id} song={song} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  logo: {
    width: 120,
    height: 24,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FDF5E6',
    padding: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  libraryCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FDF5E6',
    marginBottom: 16,
  },
  songsList: {
    marginBottom: 80,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  playingSongItem: {
    backgroundColor: 'rgba(255, 213, 169, 0.1)',
    borderRadius: 8,
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 16,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  songGenres: {
    fontSize: 14,
    color: '#A5A5A5',
  },
  playingIndicator: {
    position: 'absolute',
    top: 42,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIcon: {
    width: 24,
    height: 24,
  },
  loader: {
    marginTop: 40,
  },
});

export default LibraryScreen;
