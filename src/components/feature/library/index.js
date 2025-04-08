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
import {useSelector} from 'react-redux';
import {useAuthUser} from '../../../stores/selector';
import fetcher from '../../../dataProvider';
import {formatTime} from '../../../utils/common';
import {getAuthToken, checkAndRefreshTokens} from '../../../utils/authUtils';
import useMusicPlayer from '../../../hooks/useMusicPlayer';
import {useNavigation} from '@react-navigation/native';
// import ROUTE_NAME from '../../../navigator/config/routeName';
// import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Empty Library Component
const EmptyLibrary = () => {
  // const navigation = useNavigation();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyImageContainer}>
        <Text style={styles.musicEmoji}>🎵</Text>
      </View>
      <Text style={styles.emptyTitle}>Your Library is Empty</Text>
      <Text style={styles.emptyText}>
        Create your first AI cover to start building your personal music
        collection
      </Text>
      {/* <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate(ROUTE_NAME.AIGenerator)}
        activeOpacity={0.8}>
        <LinearGradient
          colors={['#F4A460', '#DEB887']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.buttonGradient}>
          <Text style={styles.createButtonText}>Create a Cover</Text>
        </LinearGradient>
      </TouchableOpacity> */}
    </View>
  );
};

const LibraryScreen = () => {
  const {API_BASE_URL} = config;
  const [audioList, setAudioList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const {isLoggedIn} = useSelector(useAuthUser);

  // Use our global music player hook
  const {play, isPlaying, currentSong, togglePlayPause} =
    useMusicPlayer('LibraryScreen');

  // Fetch audio list mutation
  const {mutate: fetchAudioList, isLoading: isListLoading} = useMutation(
    async () => {
      if (!isLoggedIn) {
        throw new Error('User is not logged in');
      }

      // Check and refresh tokens before making the request
      const tokensValid = await checkAndRefreshTokens();
      if (!tokensValid) {
        throw new Error('Authentication tokens are invalid');
      }

      // Get the current auth token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const response = await fetcher.get(`${API_BASE_URL}/v1/library`, {
        headers,
      });
      return response;
    },
    {
      onSuccess: response => {
        if (response) {
          setAudioList(response.data.data);
        }
      },
      onError: error => {
        console.error('Error fetching audio list:', error);
        if (error.message === 'User is not logged in') {
          Alert.alert(
            'Authentication Required',
            'Please log in to access your library',
          );
        } else if (error.message === 'Authentication tokens are invalid') {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
          );
        } else {
          Alert.alert(
            'Error',
            'Failed to load your library. Please try again.',
          );
        }
      },
    },
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    if (!isLoggedIn) {
      Alert.alert(
        'Authentication Required',
        'Please log in to access your library',
      );
      return;
    }

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
        setRefreshing(false);
      },
    });
  }, [fetchAudioList, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAudioList();
    }
  }, [fetchAudioList, isLoggedIn]);

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
          {audioList && audioList.length > 0 ? (
            <View style={styles.songsList}>
              {audioList.map(song => (
                <SongItem key={song._id} song={song} />
              ))}
            </View>
          ) : (
            <EmptyLibrary />
          )}
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
    fontSize: 20,
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
    fontSize: 20,
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
  // Empty library styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  musicEmoji: {
    fontSize: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F4A460',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#C87D48',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LibraryScreen;
