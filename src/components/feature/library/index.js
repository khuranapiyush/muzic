import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import config from 'react-native-config';
import {useMutation} from '@tanstack/react-query';
import fetcher from '../../../dataProvider';
import {formatTime} from '../../../utils/common';
import {getAuthToken} from '../../../utils/authUtils';
import useMusicPlayer from '../../../hooks/useMusicPlayer';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import useToaster from '../../../hooks/useToaster';
import LinearGradient from 'react-native-linear-gradient';
import appImages from '../../../resource/images';
import BottomSheet from '@gorhom/bottom-sheet';
import RNFS from 'react-native-fs';
import {PermissionsAndroid} from 'react-native';
import {
  setGeneratingSong,
  setGeneratingSongId,
} from '../../../stores/slices/player';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Memoized Empty Library Component
const EmptyLibrary = React.memo(() => {
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
    </View>
  );
});

// Memoized Song Item Component
const SongItem = React.memo(
  ({song, isCurrentlyPlaying, onPress, onDownload}) => {
    return (
      <TouchableOpacity
        style={[styles.songItem, isCurrentlyPlaying && styles.playingSongItem]}
        onPress={onPress}>
        <Image
          source={
            song.imageUrl ? {uri: song.imageUrl} : appImages.songPlaceHolder
          }
          style={styles.songImage}
          resizeMode="cover"
          // defaultSource={appImages.songPlaceHolder}
          onError={e => {
            console.log('Image failed to load:', song.title);
          }}
        />
        {isCurrentlyPlaying && (
          <View style={styles.playingIndicator}>
            <Image
              source={appImages.playerPauseIcon}
              style={styles.playingIcon}
            />
          </View>
        )}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.songGenres}>{formatTime(song.duration)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDownload(song)}
          style={styles.menuButton}>
          <Image source={appImages.downloadIcon} style={styles.menuIcon} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
);

const LibraryScreen = () => {
  const {API_BASE_URL} = config;
  const [audioList, setAudioList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const {showToaster, hideToaster} = useToaster();
  const {isGeneratingSong, generatingSongId} = useSelector(
    state => state.player,
  );
  const [prevGeneratingState, setPrevGeneratingState] = useState(false);
  const [prevAudioList, setPrevAudioList] = useState([]);
  const isLibraryScreen = useRef(true);
  const dispatch = useDispatch();

  // Use our global music player hook
  const {isPlaying, currentSong, togglePlayPause, play} =
    useMusicPlayer('LibraryScreen');

  // Memoize the fetch audio list mutation
  const {mutate: fetchAudioList, isLoading: isListLoading} = useMutation(
    useCallback(async () => {
      // Get the current auth token
      const token = await getAuthToken();

      const headers = {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
      };

      const response = await fetcher.get(`${API_BASE_URL}/v1/library`, {
        headers,
      });
      return response;
    }, [API_BASE_URL]),
    {
      onSuccess: response => {
        if (response) {
          // Log API response to understand data structure
          console.log('Library API response:', response.data);

          // Process the songs to ensure all required fields are present
          if (response.data && Array.isArray(response.data.data)) {
            const processedSongs = response.data.data.map(song => {
              // Ensure audioUrl is properly set - it might be under a different field name
              const audioUrl = song.audioUrl || song.url || song.uri || '';

              return {
                ...song,
                audioUrl, // Ensure audioUrl is always set
                title: song.title || 'Untitled Song',
                duration: song.duration || 0,
                imageUrl:
                  song.imageUrl || song.coverArt || song.thumbnail || '',
              };
            });

            console.log('Processed songs for library:', processedSongs.length);
            setAudioList(processedSongs);
          } else {
            console.warn(
              'Invalid or empty response from library API:',
              response.data,
            );
            setAudioList([]);
          }
        }
      },
      onError: error => {
        console.error('Error fetching audio list:', error);
      },
    },
  );

  // Memoize the refresh handler
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

  useEffect(() => {
    // Check if we're on the library screen
    const unsubscribe = navigation.addListener('focus', () => {
      isLibraryScreen.current = true;
    });

    const unsubscribeBlur = navigation.addListener('blur', () => {
      isLibraryScreen.current = false;
    });

    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  useEffect(() => {
    // Check if a new song was added to the library
    if (audioList.length > prevAudioList.length) {
      // Look for new songs that weren't in the previous list
      const newSongs = audioList.filter(
        song => !prevAudioList.some(prevSong => prevSong._id === song._id),
      );

      // If we find a new song that matches the generating song ID
      if (newSongs.length > 0 && generatingSongId) {
        const matchingSong = newSongs.find(
          song => song._id === generatingSongId,
        );
        if (matchingSong) {
          console.log(
            'Generated song appeared in library:',
            matchingSong.title,
          );

          // Reset the generating state when we find the generated song
          dispatch(setGeneratingSong(false));
          dispatch(setGeneratingSongId(null));
          console.log(
            'Reset generating song state after song appeared in library',
          );
        }
      }
    }
    setPrevAudioList(audioList);
  }, [audioList, prevAudioList, generatingSongId, dispatch]);

  // No changes needed for the song generation state tracking
  useEffect(() => {
    setPrevGeneratingState(isGeneratingSong);
  }, [isGeneratingSong]);

  // Add effect to handle the generating toast
  useEffect(() => {
    // Show toast when song generation starts
    if (isGeneratingSong && isLibraryScreen.current) {
      console.log('Showing generating song toast in library');
      showToaster({
        type: 'info',
        text1: 'Song Generation in Progress',
        text2:
          'Your song is being created. It will appear in your library soon.',
        visibilityTime: 4000,
        autoHide: false,
        topOffset: 50,
      });
    } else if (!isGeneratingSong && prevGeneratingState) {
      // Song generation completed or was canceled
      console.log('Hiding generating song toast - generation complete');
      hideToaster();
    }
  }, [isGeneratingSong, prevGeneratingState, showToaster, hideToaster]);

  // Fetch library data every 15 seconds while a song is generating
  useEffect(() => {
    let intervalId = null;

    if (isGeneratingSong && isLibraryScreen.current) {
      // Poll for updates while song is generating and we're on the library screen
      intervalId = setInterval(() => {
        console.log('Polling for library updates...');
        fetchAudioList();
      }, 15000); // Check every 15 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isGeneratingSong, fetchAudioList]);

  // Memoize the song press handler
  const handleSongPress = useCallback(
    (audioUrl, title, duration, imageUrl) => {
      console.log('Song pressed:', {audioUrl, title});

      // Verify audioUrl is valid before attempting to play
      if (!audioUrl) {
        console.error('Cannot play song with empty audio URL:', title);
        return;
      }

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

      // Format all songs in the library for the queue
      const formattedQueue = audioList.map(song => ({
        id: song.audioUrl,
        title: song.title,
        artist: 'Library Song',
        uri: song.audioUrl,
        thumbnail: song.imageUrl,
        poster: song.imageUrl,
        duration: song.duration || 0,
      }));

      console.log('Current song URI:', currentSong?.uri);
      console.log('New song URI:', audioUrl);
      console.log('Queue size:', formattedQueue.length);

      // Comprehensive logging to debug playback
      console.log('Song data check:', {
        songHasValidUri: !!audioUrl,
        uriIsString: typeof audioUrl === 'string',
        uriLength: audioUrl?.length,
        uriStartsWith: audioUrl?.substring(0, 10) + '...',
        formattedSongHasValidUri: !!formattedSong.uri,
        queueHasValidUris: formattedQueue.every(s => !!s.uri),
      });

      // If the same song is playing, toggle play/pause
      if (currentSong && currentSong.uri === audioUrl) {
        console.log('Same song - toggling play/pause');
        togglePlayPause();
      } else {
        // Otherwise play the new song with the library queue
        console.log('New song - playing with queue');
        play(formattedSong, formattedQueue);
      }
    },
    [audioList, currentSong, togglePlayPause, play],
  );

  // Updated permission handler that works better for Android 11+
  const requestAndroidPermissions = async () => {
    try {
      if (Platform.OS !== 'android') return true;

      console.log('Android SDK Version:', Platform.Version);

      // For Android 11+ (API 30+), we'll use a simpler approach that works without special permissions
      if (Platform.Version >= 30) {
        console.log(
          'Android 11+ detected - using app-specific directory instead of requesting MANAGE_EXTERNAL_STORAGE',
        );
        // For Android 11+, we'll use the app's specific external directory
        // This doesn't require any special permissions
        return true;
      }
      // For Android 10 (API 29)
      else if (Platform.Version >= 29) {
        console.log('Requesting WRITE_EXTERNAL_STORAGE for Android 10');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download files',
            buttonPositive: 'Grant Permission',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // For Android 9 and below
      else {
        console.log('Requesting multiple permissions for Android 9 and below');
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  };

  // Updated download function that uses the blobId
  const handleDownload = useCallback(
    async song => {
      try {
        // Show a download starting alert
        Alert.alert('Download Started', 'Preparing to download your song...');

        console.log('Starting download process for song:', song.title);
        console.log('Song data:', song);

        // For modern Android, we'll use a different approach
        const isModernAndroid =
          Platform.OS === 'android' && Platform.Version >= 30;

        // For older Android versions, still check permissions
        if (Platform.OS === 'android' && !isModernAndroid) {
          const hasPermission = await requestAndroidPermissions();
          if (!hasPermission) {
            console.log('Permission denied for older Android');
            Alert.alert(
              'Permission Denied',
              'Storage permission is required to download songs',
            );
            return;
          }
        }

        // Get authentication token
        const token = await getAuthToken();
        if (!token) {
          throw new Error('Authentication required');
        }

        // Create a download path based on platform
        const downloadDir =
          Platform.OS === 'ios'
            ? RNFS.DocumentDirectoryPath
            : isModernAndroid
            ? RNFS.ExternalCachesDirectoryPath
            : RNFS.DownloadDirectoryPath;

        // Remove special characters from filename
        const filename = `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
        const downloadPath = `${downloadDir}/${filename}`;

        console.log(`Downloading to: ${downloadPath}`);

        // Check for file existence and delete if exists
        if (await RNFS.exists(downloadPath)) {
          await RNFS.unlink(downloadPath);
          console.log('Deleted existing file');
        }

        // Extract blobId from audioUrl or use _id if available
        let blobId = song._id;

        if (!blobId && song.audioUrl) {
          // Try to extract ID from URL pattern
          const match = song.audioUrl.match(/([^\/]+)$/);
          if (match && match[1]) {
            blobId = match[1];
          }
        }

        if (!blobId) {
          throw new Error('Could not determine blob ID for download');
        }

        console.log(`Using blob ID for download: ${blobId}`);

        // Setup download URL with the blobId directly in the path
        const downloadUrl = `${API_BASE_URL}/v1/download/${blobId}`;
        console.log(`Download URL: ${downloadUrl}`);

        // Setup download options
        const download = RNFS.downloadFile({
          fromUrl: downloadUrl,
          toFile: downloadPath,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          progressDivider: 10, // Report progress less frequently
          progress: res => {
            const progressPercent =
              (res.bytesWritten / res.contentLength) * 100;
            console.log(`Download progress: ${progressPercent.toFixed(0)}%`);
          },
          background: true,
        });

        // Wait for the download to complete
        const result = await download.promise;
        console.log('Download result status code:', result.statusCode);

        // Check if download failed
        if (result.statusCode !== 200) {
          throw new Error(`Download failed with status: ${result.statusCode}`);
        }

        // Verify the file exists and is valid
        const fileExists = await RNFS.exists(downloadPath);
        console.log('File exists check:', fileExists);

        if (fileExists) {
          // Get file information
          const fileInfo = await RNFS.stat(downloadPath);
          console.log('File stats:', JSON.stringify(fileInfo));

          if (fileInfo.size === 0) {
            throw new Error('Downloaded file is empty');
          }

          // Success handling based on platform
          if (Platform.OS === 'ios') {
            // On iOS, we need to share the file to make it accessible
            Alert.alert('Download Complete', 'Opening file for saving...');

            // Open the file with the share dialog
            try {
              await RNFS.openDocument(downloadPath);
            } catch (error) {
              console.error('Error opening document:', error);
              throw new Error('Could not open the downloaded file');
            }
          } else if (isModernAndroid) {
            // For Android 11+, show a success message with instructions
            Alert.alert(
              'Download Complete',
              `${song.title} saved to app storage`,
              [
                {
                  text: 'OK',
                  style: 'cancel',
                },
                {
                  text: 'Share File',
                  onPress: async () => {
                    try {
                      // Show file sharing options
                      Alert.alert(
                        'Access Your File',
                        'To access your file, go to Files app > Internal storage > Android > data > [your app package name] > files',
                      );
                    } catch (error) {
                      console.error('Error sharing file:', error);
                    }
                  },
                },
              ],
            );
          } else {
            // For older Android versions, we already saved to Downloads
            Alert.alert(
              'Download Complete',
              `${song.title} saved to Downloads folder`,
            );
          }
        } else {
          throw new Error('File not found after download');
        }
      } catch (error) {
        console.error('Download failed:', error);
        Alert.alert(
          'Download Failed',
          error.message || 'Could not download the song',
        );
      }
    },
    [API_BASE_URL],
  );

  // Update the renderItem function to include the download handler
  const renderItem = useCallback(
    ({item}) => {
      // Check if audioUrl is missing or invalid
      if (!item.audioUrl) {
        console.warn('Song missing audioUrl:', item.title, item);
        return null; // Skip rendering songs without audioUrl
      }

      const isCurrentlyPlaying =
        currentSong && currentSong.uri === item.audioUrl && isPlaying;

      return (
        <TouchableOpacity
          style={styles.songItemContainer}
          onPress={() =>
            handleSongPress(
              item.audioUrl,
              item.title,
              item.duration,
              item.imageUrl,
            )
          }>
          <LinearGradient
            colors={
              isCurrentlyPlaying
                ? ['#3C3129', '#1A1A1A']
                : ['#1F1F1F', '#121212']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={[
              styles.songItem,
              isCurrentlyPlaying && styles.playingSongItem,
            ]}>
            <Image
              source={
                item.imageUrl ? {uri: item.imageUrl} : appImages.songPlaceHolder
              }
              style={styles.songImage}
              resizeMode="cover"
              // defaultSource={appImages.songPlaceHolder}
              onError={e => {
                console.log('Image failed to load:', item.title);
              }}
            />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.songGenres}>{formatTime(item.duration)}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {isCurrentlyPlaying && (
                <View style={styles.playingIndicator}>
                  <Image
                    source={appImages.playerPauseIcon}
                    style={[styles.playingIcon, {width: 20, height: 20}]}
                  />
                </View>
              )}
              <TouchableOpacity
                style={[styles.menuButton, {padding: 6}]}
                onPress={() => handleDownload(item)}>
                <Image
                  source={appImages.downloadIcon}
                  style={{width: 20, height: 20, tintColor: '#fff'}}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [currentSong, isPlaying, handleSongPress, handleDownload],
  );

  // Memoize the key extractor
  const keyExtractor = useCallback(item => item._id, []);

  // Memoize the list header
  const ListHeaderComponent = useMemo(
    () => <Text style={styles.heading}>Library</Text>,
    [],
  );

  // Memoize the list empty component
  const ListEmptyComponent = useMemo(() => <EmptyLibrary />, []);

  // Create a generation indicator component
  const GenerationIndicator = () => {
    // Only show if a song is actively being generated AND we have a generatingSongId
    if (!isGeneratingSong || !generatingSongId) return null;

    return (
      <LinearGradient
        colors={['#FE954A', '#FC6C14']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.generationIndicator}>
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
          style={{marginRight: 10}}
        />
        <Text style={styles.generationIndicatorText}>
          Your song is being generated...
        </Text>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isGeneratingSong ||
          (generatingSongId && (
            <View style={styles.generatingContainer}>
              <ActivityIndicator color="#F4A460" size="small" />
              <Text style={styles.generatingText}>
                Generating your song... Please wait
              </Text>
            </View>
          ))}
        {isListLoading && audioList.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#F4A460" />
            <Text style={styles.loadingText}>Loading your library...</Text>
          </View>
        ) : audioList.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <FlatList
            data={audioList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={{paddingBottom: 80}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#F4A460']}
                tintColor="#F4A460"
              />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 73,
              offset: 73 * index,
              index,
            })}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 15,
    paddingHorizontal: 16,
  },
  list: {
    flex: 1,
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
    color: '#fff',
    tintColor: '#fff',
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
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FDF5E6',
    fontFamily: 'Bricolage Grotesque',
    letterSpacing: -0.8,
    textTransform: 'capitalize',
    marginBottom: 16,
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
  songItemContainer: {
    marginHorizontal: 0,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playingSongItem: {
    borderColor: '#F4A460',
    transform: [{scale: 1.02}],
  },
  songImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 4,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  songGenres: {
    fontSize: 13,
    color: '#A5A5A5',
  },
  playingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
    marginLeft: 4,
  },
  playingIcon: {
    width: 20,
    height: 20,
    tintColor: '#F4A460',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#F4A460',
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
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
  controlButtons: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  controlIcon: {
    width: 24,
    height: 24,
    tintColor: '#F4A460',
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  bottomSheetBackground: {
    backgroundColor: '#1A1A1A',
  },
  bottomSheetIndicator: {
    backgroundColor: '#666',
  },
  bottomSheetContent: {
    padding: 16,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  bottomSheetIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    marginRight: 16,
  },
  bottomSheetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  generationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  generationIndicatorText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F4A460',
  },
  generatingText: {
    color: '#F4A460',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default React.memo(LibraryScreen);
