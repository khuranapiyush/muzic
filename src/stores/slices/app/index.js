import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  appData: '',
  deviceId: '',
  loading: false,
  sessionId: '',
  isShowFeature: true,
  tokenChecked: false,
};

const app = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppData: (state, action) => {
      state.appData = action.payload;
    },
    setDeviceId: (state, action) => {
      state.deviceId = action.payload;
    },
    setAppLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setFeatureEnable: (state, action) => {
      state.isShowFeature = action.payload;
    },
    setTokenChecked: (state, action) => {
      state.tokenChecked = action.payload;
    },
  },
});

export const {
  setAppData,
  setDeviceId,
  setAppLoading,
  setSessionId,
  setFeatureEnable,
  setTokenChecked,
} = app.actions;

export default app.reducer;
