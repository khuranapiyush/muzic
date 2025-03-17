import {store} from '../stores';
import {
  setCurrentSong,
  setQueue,
  setCurrentSongIndex,
  togglePlayPause,
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
 */
export const playSong = songData => {
  const normalizedSong = normalizeSongData(songData);
  store.dispatch(setCurrentSong(normalizedSong));
  store.dispatch(setQueue([normalizedSong]));
  store.dispatch(setCurrentSongIndex(0));
};

/**
 * Play a list of songs starting from a specific index
 * @param {Array} songsData - Array of song data
 * @param {number} startIndex - Index to start playing from
 */
export const playQueue = (songsData, startIndex = 0) => {
  if (!songsData || !songsData.length) return;

  const normalizedSongs = songsData.map(song => normalizeSongData(song));
  store.dispatch(setQueue(normalizedSongs));
  store.dispatch(setCurrentSongIndex(startIndex));
  store.dispatch(setCurrentSong(normalizedSongs[startIndex]));
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
    store.dispatch(togglePlayPause());
  }
};
