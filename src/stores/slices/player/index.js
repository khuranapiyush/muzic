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
      state.showGlobalPlayer = !!action.payload;
    },
    setQueue: (state, action) => {
      state.queue = action.payload;
    },
    setCurrentSongIndex: (state, action) => {
      state.currentSongIndex = action.payload;
    },
    togglePlayPause: state => {
      state.isPlaying = !state.isPlaying;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setSource: (state, action) => {
      state.source = action.payload;
    },
    updateProgress: (state, action) => {
      state.progress = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    hidePlayer: state => {
      state.showGlobalPlayer = false;
    },
    resetPlayer: state => {
      state.currentSong = null;
      state.queue = [];
      state.currentSongIndex = 0;
      state.isPlaying = false;
      state.progress = 0;
      state.duration = 0;
      state.showGlobalPlayer = false;
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
  updateProgress,
  setDuration,
  hidePlayer,
  resetPlayer,
} = player.actions;

export default player.reducer;
