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
import {useSelector} from 'react-redux';
import Video from 'react-native-video';
import {playQueue, togglePlay} from '../../../utils/playerUtils';
import appImages from '../../../resource/images';
import Slider from '@react-native-community/slider';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const GlobalPlayer = () => {
  const {currentSong, isPlaying, playerProps, queue, currentSongIndex} =
    useSelector(state => state.player);

  const [isFullPlayer, setIsFullPlayer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef(null);

  // Don't render if no song is selected
  if (!currentSong) {
    return null;
  }

  const handlePlayPause = () => {
    togglePlay();
  };

  const handleNext = () => {
    if (queue.length > 0 && currentSongIndex < queue.length - 1) {
      playQueue(queue, currentSongIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (queue.length > 0 && currentSongIndex > 0) {
      playQueue(queue, currentSongIndex - 1);
    }
  };

  const handleVideoEnd = () => {
    handleNext();
  };

  const handleProgress = data => {
    setProgress(data.currentTime);
  };

  const handleLoad = data => {
    setDuration(data.duration);
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

  return (
    <>
      {/* Mini Player */}
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={toggleFullPlayer}>
        <View style={styles.playerContainer}>
          {/* Song thumbnail */}
          <Image
            source={{uri: currentSong.poster || currentSong.thumbnail}}
            style={styles.thumbnail}
          />

          {/* Song info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
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

            <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
              <Image
                source={appImages.playerNextIcon}
                style={styles.controlIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Full Player Modal */}
      <Modal
        visible={isFullPlayer}
        animationType="slide"
        transparent={false}
        onRequestClose={toggleFullPlayer}>
        <View style={styles.fullPlayerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleFullPlayer}>
            {/* <Image
              source={
                appImages.closeIcon ||
                require('../../../resource/images/close.png')
              }
              style={styles.closeIcon}
            /> */}
          </TouchableOpacity>

          <View style={styles.albumArtContainer}>
            <Image
              source={{uri: currentSong.poster || currentSong.thumbnail}}
              style={styles.albumArt}
              resizeMode="cover"
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
              minimumTrackTintColor="#FFD5A9"
              maximumTrackTintColor="#333"
              thumbTintColor="#FFD5A9"
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
                source={appImages.playerPreviousIcon}
                style={styles.fullPlayerControlIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.fullPlayerPlayPauseButton}>
              <Image
                source={
                  isPlaying
                    ? appImages.playerPauseIcon
                    : appImages.playerPlayIcon
                }
                style={styles.fullPlayerPlayPauseIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={styles.fullPlayerControlButton}>
              <Image
                source={appImages.playerNextIcon}
                style={styles.fullPlayerControlIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hidden video player */}
      <Video
        ref={videoRef}
        source={{uri: currentSong.uri}}
        paused={!isPlaying}
        onEnd={handleVideoEnd}
        onProgress={handleProgress}
        onLoad={handleLoad}
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
    bottom: 70, // Above the tab bar
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#FFD5A9',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#A5A5A5',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  controlIcon: {
    width: 20,
    height: 20,
    tintColor: '#A5A5A5',
  },
  playPauseButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 213, 169, 0.1)',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  playPauseIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFD5A9',
  },

  // Full Player Styles
  fullPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
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
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  songInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  fullPlayerTitle: {
    color: '#FFD5A9',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  fullPlayerArtist: {
    color: '#A5A5A5',
    fontSize: 18,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
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
  timeText: {
    color: '#A5A5A5',
    fontSize: 14,
  },
  fullPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullPlayerControlButton: {
    padding: 15,
  },
  fullPlayerControlIcon: {
    width: 30,
    height: 30,
    tintColor: '#A5A5A5',
  },
  fullPlayerPlayPauseButton: {
    padding: 20,
    backgroundColor: 'rgba(255, 213, 169, 0.1)',
    borderRadius: 40,
    marginHorizontal: 30,
  },
  fullPlayerPlayPauseIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFD5A9',
  },
});

export default GlobalPlayer;
