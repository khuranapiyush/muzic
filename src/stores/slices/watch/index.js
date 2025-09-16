import { createSlice } from '@reduxjs/toolkit';
import { setMiniPlayer } from '../player';

const initialState = {
  isVisible: false,
  videoDetail: {},
  watchEvent: {},
  watchId: null,
  mode: 'max',
};

const watch = createSlice({
  name: 'watch',
  initialState,

  reducers: {
    setIsWatchPageVisible: (state, action) => {
      state.isVisible = action.payload;
    },
    setWatchId: (state, action) => {
      state.watchId = action.payload;
    },
    setVideoDetail: (state, action) => {
      state.videoDetail = action.payload;
    },
    setWatchEvent: (state, action) => {
      state.watchEvent = action.payload;
    },
    setFullModePlayer: (state, action) => {
      const { videoDetail } = action.payload;
      state.isVisible = true;
      state.videoDetail = videoDetail;
      state.mode = 'shouldBeMax';
    },
    setMiniModePlayer: (state, action) => {
      state.isVisible = true;
      state.mode = 'shouldBeMini';
    },
    setWatchMode: (state, action) => {
      state.mode = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setMiniPlayer, (state, action) => {
      state.mode = action.payload ? 'mini' : 'max';
    });
  },
});

export const {
  setIsWatchPageVisible,
  setVideoDetail,
  setFullModePlayer,
  setMiniModePlayer,
  setWatchMode,
  setWatchId,
  setWatchEvent,
} = watch.actions;

export default watch.reducer;
