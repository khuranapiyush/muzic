import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Video from 'react-native-video';
import {
  togglePlay,
  playNext,
  playPrevious,
  updatePlayerProgress,
  setPlayerDuration,
} from '../../../utils/playerUtils';
import appImages from '../../../resource/images';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import {hidePlayer, setIsPlaying} from '../../../stores/slices/player';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const GlobalPlayer = () => {
  const {
    currentSong,
    isPlaying,
    playerProps,
    queue,
    currentSongIndex,
    progress,
    duration,
    showGlobalPlayer,
  } = useSelector(state => state.player);

  const [isFullPlayer, setIsFullPlayer] = useState(false);
  const videoRef = useRef(null);
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const dispatch = useDispatch();

  useEffect(() => {
    // Animate the player when play/pause state changes
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isPlaying, scaleAnimation]);

  // Don't render if no song is selected or player shouldn't be shown
  if (!currentSong || !showGlobalPlayer) {
    return null;
  }

  const handlePlayPause = () => {
    if (currentSong) {
      togglePlay();
    }
  };

  const handleNext = () => {
    if (currentSong) {
      playNext();
    }
  };

  const handlePrevious = () => {
    if (currentSong) {
      playPrevious();
    }
  };

  const handleVideoEnd = () => {
    handleNext();
  };

  const handleProgress = data => {
    updatePlayerProgress(data.currentTime);
  };

  const handleLoad = data => {
    setPlayerDuration(data.duration);
  };

  const handleSeek = value => {
    if (videoRef.current) {
      videoRef.current.seek(value);
    }
  };

  const formatTime = seconds => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const toggleFullPlayer = () => {
    setIsFullPlayer(!isFullPlayer);
  };

  const handleClose = () => {
    // Only hide the player, don't reset the state
    dispatch(hidePlayer());
  };

  const handlePlay = () => {
    if (currentSong) {
      dispatch(setIsPlaying(true));
      dispatch(hidePlayer()); // This will show the player
    }
  };

  return (
    <>
      {/* Mini Player */}
      <Animated.View
        style={[styles.container, {transform: [{scale: scaleAnimation}]}]}>
        <TouchableOpacity
          style={styles.playerContainer}
          activeOpacity={0.9}
          onPress={toggleFullPlayer}>
          <LinearGradient
            colors={['#FE954A', '#FC6C14']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.gradientContainer}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closePlayerButton}
              onPress={handleClose}>
              <View style={styles.closeButtonCircle}>
                <Text style={styles.closeButtonText}>×</Text>
              </View>
            </TouchableOpacity>

            {/* Song thumbnail */}
            <View style={styles.thumbnailContainer}>
              <Image
                source={
                  currentSong.poster || currentSong.thumbnail
                    ? {uri: currentSong.poster || currentSong.thumbnail}
                    : appImages.songPlaceHolder
                }
                style={styles.thumbnail}
                // defaultSource={appImages.songPlaceHolder}
                onError={() =>
                  console.log('Mini player thumbnail failed to load')
                }
              />
            </View>

            {/* Song info */}
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {currentSong.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentSong.artist}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(progress)} / {formatTime(duration)}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playPauseButton}>
                <Image
                  source={
                    isPlaying
                      ? appImages.playerPauseIcon
                      : appImages.playerPlayIcon
                  }
                  style={styles.playPauseIcon}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Progress bar for mini player */}
          <View style={styles.miniProgressBarContainer}>
            <View
              style={[
                styles.miniProgressBar,
                {width: `${(progress / duration) * 100}%`},
              ]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Full Player Modal */}
      <Modal
        visible={isFullPlayer}
        animationType="slide"
        transparent={false}
        onRequestClose={toggleFullPlayer}>
        <LinearGradient
          colors={['#121212', '#232323', '#323232']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.fullPlayerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleFullPlayer}>
            <Image source={appImages.closeIcon} style={styles.closeIcon} />
          </TouchableOpacity>

          <View style={styles.albumArtContainer}>
            <Image
              source={
                currentSong.poster || currentSong.thumbnail
                  ? {uri: currentSong.poster || currentSong.thumbnail}
                  : appImages.songPlaceHolder
              }
              style={styles.albumArt}
              resizeMode="cover"
              // defaultSource={appImages.songPlaceHolder}
              onError={() =>
                console.log('Full player album art failed to load')
              }
            />
          </View>

          <View style={styles.songInfoContainer}>
            <Text style={styles.fullPlayerTitle}>{currentSong.title}</Text>
            <Text style={styles.fullPlayerArtist}>{currentSong.artist}</Text>
          </View>

          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressBar}
              minimumValue={0}
              maximumValue={duration}
              value={progress}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#FE954A"
              maximumTrackTintColor="#444"
              thumbTintColor="#FE954A"
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(progress)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.fullPlayerControls}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={styles.fullPlayerControlButton}>
              <Image
                source={appImages.playerNextIcon}
                style={styles.fullPlayerPreviousControlIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.fullPlayerPlayPauseButton}>
              <LinearGradient
                colors={['#FE954A', '#FC6C14']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.playPauseGradient}>
                <Image
                  source={
                    isPlaying
                      ? appImages.playerPauseIcon
                      : appImages.playerPlayIcon
                  }
                  style={[
                    styles.fullPlayerPlayPauseIcon,
                    {tintColor: '#121212'},
                  ]}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={styles.fullPlayerControlButton}>
              <Image
                source={appImages.playerNextIcon}
                style={styles.fullPlayerNextControlIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Song queue if available */}
          {queue.length > 1 && (
            <View style={styles.queueContainer}>
              <Text style={styles.queueTitle}>Up Next</Text>
              <View style={styles.queueList}>
                {queue
                  .slice(currentSongIndex + 1, currentSongIndex + 3)
                  .map((song, index) => (
                    <TouchableOpacity
                      key={song.id || index}
                      style={styles.queueItem}
                      onPress={() => {
                        // Play this song from the queue
                        playNext();
                      }}>
                      <View style={styles.queueItemThumbnail}>
                        <Image
                          source={
                            song.thumbnail || song.poster
                              ? {uri: song.thumbnail || song.poster}
                              : appImages.songPlaceHolder
                          }
                          style={styles.queueItemImage}
                          // defaultSource={appImages.songPlaceHolder}
                          onError={() =>
                            console.log(
                              'Queue item thumbnail failed to load:',
                              song.title,
                            )
                          }
                        />
                      </View>
                      <View style={styles.queueItemInfo}>
                        <Text style={styles.queueItemTitle} numberOfLines={1}>
                          {song.title}
                        </Text>
                        <Text style={styles.queueItemArtist} numberOfLines={1}>
                          {song.artist}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}
        </LinearGradient>
      </Modal>

      {/* Hidden video player */}
      <Video
        ref={videoRef}
        source={{uri: currentSong.uri}}
        paused={!isPlaying}
        onEnd={handleVideoEnd}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onError={error => {
          console.error('Video playback error:', error);
          console.log('Attempted to play URI:', currentSong.uri);
        }}
        onPlaybackStalled={() => console.log('Playback stalled')}
        onPlaybackRateChange={rate =>
          console.log('Playback rate changed:', rate)
        }
        onReadyForDisplay={() =>
          console.log('Ready for display, URI:', currentSong.uri)
        }
        style={{height: 0, width: 0}}
        ignoreSilentSwitch="ignore"
        {...playerProps}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1,
  },
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    margin: 0,
  },
  playerContainer: {
    width: '100%',
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  artist: {
    color: '#EEEEEE',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  timeText: {
    color: '#EEEEEE',
    fontSize: 10,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  playPauseIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  miniProgressBarContainer: {
    height: 3,
    width: '100%',
    backgroundColor: '#FE954A',
  },
  miniProgressBar: {
    height: 3,
    backgroundColor: '#FFFFFF',
  },
  closePlayerButton: {
    position: 'absolute',
    top: -15,
    right: -5,
    zIndex: 1000,
  },
  closeButtonCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Full Player Styles
  fullPlayerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
  albumArtContainer: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  songInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  fullPlayerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  fullPlayerArtist: {
    color: '#DDDDDD',
    fontSize: 18,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  fullPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullPlayerControlButton: {
    padding: 20,
  },
  fullPlayerPreviousControlIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF',
    transform: [{rotate: '180deg'}],
  },
  fullPlayerNextControlIcon: {
    width: 30,
    height: 30,
    tintColor: '#FFFFFF',
  },
  fullPlayerPlayPauseButton: {
    marginHorizontal: 30,
    borderRadius: 40,
    overflow: 'hidden',
  },
  playPauseGradient: {
    padding: 20,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPlayerPlayPauseIcon: {
    width: 40,
    height: 40,
  },
  queueContainer: {
    width: '100%',
    marginTop: 40,
  },
  queueTitle: {
    color: '#FE954A',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  queueList: {
    width: '100%',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(254, 149, 74, 0.15)',
    borderRadius: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#FE954A',
  },
  queueItemThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  queueItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  queueItemArtist: {
    color: '#DDDDDD',
    fontSize: 12,
  },
});

export default GlobalPlayer;
