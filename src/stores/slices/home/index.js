import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  homeFeedData: [],
  homePagePlayerProps: { isVisible: false, data: {} },
  isCreatorBannerShow: true,
};

const home = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setHomeFeedData: (state, action) => {
      state.homeFeedData = action.payload;
    },
    setHomePagePlayer: (state, action) => {
      state.homePagePlayerProps = { isVisible: true, data: action.payload };
    },
    resetHomePagePlayer: (state, action) => {
      state.homePagePlayerProps = initialState.homePagePlayerProps;
    },
    resetCreatorBannerShow: (state, action) => {
      state.isCreatorBannerShow = false;
    },
  },
});

export const {
  setHomeFeedData,
  setHomePagePlayer,
  resetHomePagePlayer,
  resetCreatorBannerShow,
} = home.actions;

export default home.reducer;
