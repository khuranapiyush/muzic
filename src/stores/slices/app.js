import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  appLoading: false,
  deviceId: '',
  sessionId: '',
  appData: {},
  featureEnable: false,
  tokenChecked: false, // Track if token validation has completed
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppLoading: (state, action) => {
      state.appLoading = action.payload;
    },
    setDeviceId: (state, action) => {
      state.deviceId = action.payload;
    },
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setAppData: (state, action) => {
      state.appData = action.payload;
    },
    setFeatureEnable: (state, action) => {
      state.featureEnable = action.payload;
    },
    setTokenChecked: (state, action) => {
      state.tokenChecked = action.payload;
    },
  },
});

export const {
  setAppLoading,
  setDeviceId,
  setSessionId,
  setAppData,
  setFeatureEnable,
  setTokenChecked,
} = appSlice.actions;

export default appSlice.reducer;
