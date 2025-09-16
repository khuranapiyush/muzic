import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  parentTabIndex: 0,
  childTabIndex: 0,
  selectedTabId: '',
  fanCardDetails: {}, // strapi data
  fanCardPriceDetail: {},
  streamAndRoyaltyData: {},
  fanCardVideoDetail: {}, //mongo data
};

const trade = createSlice({
  name: 'trade',
  initialState,

  reducers: {
    setParentTabIndex: (state, action) => {
      state.parentTabIndex = action.payload;
      state.childTabIndex = 0;
    },
    setChildTabIndex: (state, action) => {
      state.childTabIndex = action.payload;
    },
    setSelectedTabId: (state, action) => {
      state.selectedTabId = action.payload;
    },
    setFanCardDetails: (state, action) => {
      state.fanCardDetails = action.payload;
    },
    setFanCardPriceDetail: (state, action) => {
      state.fanCardPriceDetail = action.payload;
    },
    setStreamAndRoyaltyData: (state, action) => {
      state.streamAndRoyaltyData = action.payload;
    },
    setFanCardVideoDetail: (state, action) => {
      state.fanCardVideoDetail = action.payload;
    },
  },
});

export const {
  setParentTabIndex,
  setChildTabIndex,
  setSelectedTabId,
  setFanCardDetails,
  setFanCardPriceDetail,
  setStreamAndRoyaltyData,
  setFanCardVideoDetail,
} = trade.actions;

export default trade.reducer;
