import {useDispatch, useSelector} from 'react-redux';
import {
  playSong,
  playQueue,
  togglePlay,
  stopPlayback,
  resetPlayerState,
  playNext,
  playPrevious,
} from '../utils/playerUtils';

/**
 * Hook to provide screens with a simple API for music playback
 * while ensuring only one source plays at a time and maintaining the global player state
 *
 * @param {string} screenName - Identifier for which screen is using the player
 * @returns {Object} Music player controls and state
 */
const useMusicPlayer = screenName => {
  const playerState = useSelector(state => state.player);
  const {
    isPlaying,
    currentSong,
    source,
    queue,
    currentSongIndex,
    progress,
    duration,
  } = playerState;

  // Check if this screen is currently the source of playback
  const isActiveSource = source === screenName;

  /**
   * Play a single song
   * @param {Object} song - Song data to play
   */
  const play = song => {
    playSong(song, screenName);
  };

  /**
   * Play a list of songs starting from a specific index
   * @param {Array} songs - Array of song data
   * @param {number} startIndex - Index to start playing from (default: 0)
   */
  const playList = (songs, startIndex = 0) => {
    playQueue(songs, startIndex, screenName);
  };

  /**
   * Toggle play/pause for the currently playing song
   * Only works if this screen is the active source
   */
  const togglePlayPause = () => {
    if (isActiveSource || !source) {
      togglePlay();
    }
  };

  /**
   * Stop any currently playing music
   */
  const stop = () => {
    stopPlayback();
  };

  /**
   * Reset player state completely
   */
  const reset = () => {
    resetPlayerState();
  };

  /**
   * Play the next song in the queue
   * Only works if this screen is the active source
   */
  const next = () => {
    if (isActiveSource) {
      playNext();
    }
  };

  /**
   * Play the previous song in the queue
   * Only works if this screen is the active source
   */
  const previous = () => {
    if (isActiveSource) {
      playPrevious();
    }
  };

  return {
    // Player state
    isPlaying,
    currentSong,
    isActiveSource,
    queue,
    currentSongIndex,
    progress,
    duration,

    // Player controls
    play,
    playList,
    togglePlayPause,
    stop,
    reset,
    next,
    previous,
  };
};

export default useMusicPlayer;
