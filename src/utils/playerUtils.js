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
  hidePlayer,
  showPlayer,
  setProgress,
} from '../stores/slices/player';

// Cache for normalized songs to avoid redundant processing
const songCache = new Map();

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
  // Generate a cache key based on the song's unique identifier
  const cacheKey = songData.id || songData._id || JSON.stringify(songData);

  // Return cached normalized song if available
  if (songCache.has(cacheKey)) {
    return songCache.get(cacheKey);
  }

  // Create normalized song object
  const normalizedSong = {
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

  // Cache the normalized song
  songCache.set(cacheKey, normalizedSong);
  return normalizedSong;
};

/**
 * Play a single song
 * @param {Object} songData - Song data
 * @param {string} source - Screen or component that triggered playback
 * @param {Array} [songList] - Optional list of songs that contains the current song
 */
export const playSong = (songData, source, songList = null) => {
  console.log('playSong called with:', {
    songId: songData?.id,
    songTitle: songData?.title,
    songUri: songData?.uri,
    source,
    songListLength: songList?.length || 0,
  });

  const normalizedSong = normalizeSongData(songData);
  console.log('Normalized song:', {
    id: normalizedSong.id,
    title: normalizedSong.title,
    uri: normalizedSong.uri,
  });

  const {queue, currentSong} = store.getState().player;

  // If songList is provided, use it as the new queue
  if (songList && Array.isArray(songList) && songList.length > 0) {
    // Normalize all songs in the list
    const normalizedList = songList.map(song => normalizeSongData(song));
    console.log(
      'Queue setup - using provided songList with length:',
      normalizedList.length,
    );

    // Find the index of the song being played in the list
    const songIndex = normalizedList.findIndex(
      song => song.id === normalizedSong.id,
    );
    console.log('Found song at index:', songIndex);

    // If song is found in the list, update the queue and set song index
    if (songIndex !== -1) {
      console.log('Song found in list - updating queue and index');
      store.dispatch(setQueue(normalizedList));
      store.dispatch(setCurrentSongIndex(songIndex));
    } else {
      // If song is not found in the list (rare case), add it to the list
      console.log('Song not found in list - adding to end of queue');
      const newList = [...normalizedList, normalizedSong];
      store.dispatch(setQueue(newList));
      store.dispatch(setCurrentSongIndex(newList.length - 1));
    }
  } else {
    // If no songList is provided, check if song exists in current queue
    console.log('No songList provided - checking existing queue');
    const existingIndex = queue.findIndex(
      song => song.id === normalizedSong.id,
    );
    console.log('Existing index in queue:', existingIndex);

    if (existingIndex !== -1) {
      // If song exists in queue, just update the current index
      console.log('Song exists in queue - updating index only');
      store.dispatch(setCurrentSongIndex(existingIndex));
    } else {
      // If song is not in queue, add it and set as current
      console.log('Song not in queue - adding to queue');
      const newQueue = [...queue, normalizedSong];
      store.dispatch(setQueue(newQueue));
      store.dispatch(setCurrentSongIndex(newQueue.length - 1));
    }
  }

  // Update current song and playing state in a single batch
  console.log('Setting current song:', normalizedSong.title);
  store.dispatch(setCurrentSong(normalizedSong));
  console.log('Setting isPlaying to true');
  store.dispatch(setIsPlaying(true));
  console.log('Setting source to:', source);
  store.dispatch(setSource(source));
  console.log('Showing player');
  store.dispatch(showPlayer());
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

  // Normalize all songs in the queue
  const normalizedSongs = songsData.map(song => normalizeSongData(song));

  // Batch state updates to reduce re-renders
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
  const {isPlaying, currentSong} = store.getState().player;
  if (currentSong) {
    store.dispatch(setIsPlaying(!isPlaying));
  }
};

/**
 * Stop any currently playing audio
 */
export const stopPlayback = () => {
  store.dispatch(setIsPlaying(false));
};

/**
 * Reset player state completely
 */
export const resetPlayerState = () => {
  // Clear the song cache
  songCache.clear();
  store.dispatch(resetPlayer());
};

/**
 * Play next song in the queue
 */
export const playNext = () => {
  const {queue, currentSongIndex} = store.getState().player;
  if (queue.length > 0) {
    const nextIndex =
      currentSongIndex < queue.length - 1 ? currentSongIndex + 1 : 0;
    store.dispatch(setCurrentSongIndex(nextIndex));
    store.dispatch(setCurrentSong(queue[nextIndex]));
  }
};

/**
 * Play previous song in the queue
 */
export const playPrevious = () => {
  const {queue, currentSongIndex} = store.getState().player;
  if (queue.length > 0) {
    const prevIndex =
      currentSongIndex > 0 ? currentSongIndex - 1 : queue.length - 1;
    store.dispatch(setCurrentSongIndex(prevIndex));
    store.dispatch(setCurrentSong(queue[prevIndex]));
  }
};

/**
 * Update player progress
 * @param {number} progress - Current playback position in seconds
 */
export const updatePlayerProgress = progress => {
  store.dispatch(setProgress(progress));
};

/**
 * Set player duration
 * @param {number} duration - Total duration in seconds
 */
export const setPlayerDuration = duration => {
  store.dispatch(setDuration(duration));
};
