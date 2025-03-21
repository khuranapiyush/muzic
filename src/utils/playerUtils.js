import {store} from '../stores';
import {
  setCurrentSong,
  setQueue,
  setCurrentSongIndex,
  togglePlayPause,
  setIsPlaying,
  setSource,
  updateProgress,
  setDuration,
  resetPlayer,
} from '../stores/slices/player';

/**
 * Standardized song object structure
 * @typedef {Object} Song
 * @property {string} id - Unique identifier
 * @property {string} title - Song title
 * @property {string} artist - Artist name
 * @property {string} uri - Audio file URL
 * @property {string} [thumbnail] - Thumbnail image URL
 * @property {string} [poster] - Poster image URL
 */

/**
 * Normalize song data to ensure consistent structure
 * @param {Object} songData - Raw song data
 * @returns {Song} Normalized song object
 */
export const normalizeSongData = songData => {
  // Ensure all required fields are present
  return {
    id: songData.id || songData._id || `song-${Date.now()}`,
    title: songData.title || songData.name || 'Unknown Title',
    artist: songData.artist || songData.artistName || 'Unknown Artist',
    uri: songData.uri || songData.url || songData.audioUrl || '',
    thumbnail: songData.thumbnail || songData.image || songData.artwork || '',
    poster:
      songData.poster ||
      songData.coverImage ||
      songData.thumbnail ||
      songData.image ||
      '',
  };
};

/**
 * Play a single song
 * @param {Object} songData - Song data
 * @param {string} source - Screen or component that triggered playback
 */
export const playSong = (songData, source) => {
  // First stop any currently playing audio
  stopPlayback();

  const normalizedSong = normalizeSongData(songData);
  store.dispatch(setCurrentSong(normalizedSong));
  store.dispatch(setQueue([normalizedSong]));
  store.dispatch(setCurrentSongIndex(0));
  store.dispatch(setIsPlaying(true));
  store.dispatch(setSource(source));
};

/**
 * Play a list of songs starting from a specific index
 * @param {Array} songsData - Array of song data
 * @param {number} startIndex - Index to start playing from
 * @param {string} source - Screen or component that triggered playback
 */
export const playQueue = (songsData, startIndex = 0, source) => {
  if (!songsData || !songsData.length) return;

  // First stop any currently playing audio
  stopPlayback();

  const normalizedSongs = songsData.map(song => normalizeSongData(song));
  store.dispatch(setQueue(normalizedSongs));
  store.dispatch(setCurrentSongIndex(startIndex));
  store.dispatch(setCurrentSong(normalizedSongs[startIndex]));
  store.dispatch(setIsPlaying(true));
  store.dispatch(setSource(source));
};

/**
 * Toggle play/pause state
 */
export const togglePlay = () => {
  store.dispatch(togglePlayPause());
};

/**
 * Stop any currently playing audio
 */
export const stopPlayback = () => {
  const {isPlaying} = store.getState().player;
  if (isPlaying) {
    store.dispatch(setIsPlaying(false));
  }
};

/**
 * Reset player state completely
 */
export const resetPlayerState = () => {
  store.dispatch(resetPlayer());
};

/**
 * Play next song in the queue
 */
export const playNext = () => {
  const {queue, currentSongIndex} = store.getState().player;

  if (queue.length > 0 && currentSongIndex < queue.length - 1) {
    const nextIndex = currentSongIndex + 1;
    store.dispatch(setCurrentSongIndex(nextIndex));
    store.dispatch(setCurrentSong(queue[nextIndex]));
    store.dispatch(setIsPlaying(true));
  }
};

/**
 * Play previous song in the queue
 */
export const playPrevious = () => {
  const {queue, currentSongIndex} = store.getState().player;

  if (queue.length > 0 && currentSongIndex > 0) {
    const prevIndex = currentSongIndex - 1;
    store.dispatch(setCurrentSongIndex(prevIndex));
    store.dispatch(setCurrentSong(queue[prevIndex]));
    store.dispatch(setIsPlaying(true));
  }
};

/**
 * Update song progress
 * @param {number} progress - Current playback position in seconds
 */
export const updatePlayerProgress = progress => {
  store.dispatch(updateProgress(progress));
};

/**
 * Set song duration
 * @param {number} duration - Song duration in seconds
 */
export const setPlayerDuration = duration => {
  store.dispatch(setDuration(duration));
};
