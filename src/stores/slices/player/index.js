import {createSlice} from '@reduxjs/toolkit';
import {
  setFullModePlayer,
  setIsWatchPageVisible,
  setMiniModePlayer,
  setWatchMode,
} from '../watch';

const initialState = {
  isFullScreen: false,
  isMiniPlayer: false,
  playerProps: {},
  playerPlayPauseState: null,
  playerPreferences: {
    autoPlayPlayer: {muted: true},
  },
  currentSong: null,
  queue: [],
  currentSongIndex: 0,
  isPlaying: false,
  source: null,
  progress: 0,
  duration: 0,
  showGlobalPlayer: false,
  isLoading: false,
  isTransitioning: false,
  isGeneratingSong: false,
  generatingSongId: null,
  shouldRefreshLibrary: false,
  currentPage: null,
};

const player = createSlice({
  name: 'player',
  initialState,
  reducers: {
    togglePlayerFullScreen: (state, action) => {
      state.isFullScreen = !state.isFullScreen;
    },
    setPlayerFullScreen: (state, action) => {
      state.isFullScreen = action.payload;
    },
    setMiniPlayer: (state, action) => {
      state.isMiniPlayer = action.payload;
    },
    setGlobalPlayerProps: (state, action) => {
      state.playerProps = action.payload;
    },
    setPlayerPlayPauseState: (state, action) => {
      state.playerPlayPauseState = action.payload;
    },
    setPlayerPreferences: (state, action) => {
      const {type, data = {}} = action.payload;
      state.playerPreferences = {
        ...state.playerPreferences,
        [type]: {...state.playerPreferences[type], ...data},
      };
    },
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.showGlobalPlayer = true;
      state.isPlaying = true;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
    },
    setCurrentSongIndex: (state, action) => {
      state.currentSongIndex = action.payload;
    },
    togglePlayPause: state => {
      if (state.currentSong) {
        state.isPlaying = !state.isPlaying;
        state.showGlobalPlayer = true;
      }
    },
    setIsPlaying: (state, action) => {
      if (state.currentSong) {
        state.isPlaying = action.payload;
        state.showGlobalPlayer = true;
      }
    },
    setSource: (state, action) => {
      state.source = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    hidePlayer: state => {
      state.showGlobalPlayer = false;
      state.isPlaying = false;
    },
    showPlayer: state => {
      if (state.currentSong) {
        state.showGlobalPlayer = true;
      }
    },
    resetPlayer: state => {
      return initialState;
    },
    setGeneratingSong: (state, action) => {
      state.isGeneratingSong = action.payload;
    },
    setGeneratingSongId: (state, action) => {
      state.generatingSongId = action.payload;
    },
    setShouldRefreshLibrary: (state, action) => {
      state.shouldRefreshLibrary = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setIsWatchPageVisible, (state, action) => {
      const isVisible = action.payload;

      if (!isVisible) {
        state.isFullScreen = false;
        state.isMiniPlayer = false;
        state.playerProps = {};
        state.playerPlayPauseState = null;
      }
    });

    builder.addCase(setFullModePlayer, (state, action) => {
      state.isMiniPlayer = false;
      state.playerPlayPauseState = 'play';
    });

    builder.addCase(setMiniModePlayer, (state, action) => {
      state.isMiniPlayer = true;
    });

    builder.addCase(setWatchMode, (state, action) => {
      state.isMiniPlayer = action.payload == 'shouldBeMax' ? false : true;
    });
  },
});

export const {
  togglePlayerFullScreen,
  setPlayerFullScreen,
  setMiniPlayer,
  setGlobalPlayerProps,
  setPlayerPlayPauseState,
  setPlayerPreferences,
  setCurrentSong,
  setQueue,
  setCurrentSongIndex,
  togglePlayPause,
  setIsPlaying,
  setSource,
  setProgress,
  setDuration,
  hidePlayer,
  showPlayer,
  resetPlayer,
  setGeneratingSong,
  setGeneratingSongId,
  setShouldRefreshLibrary,
  setCurrentPage,
} = player.actions;

export default player.reducer;
