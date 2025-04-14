import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  creditsPerSong: 0,
  isLoading: false,
  error: null,
};

const creditSettings = createSlice({
  name: 'creditSettings',
  initialState,
  reducers: {
    setCreditsPerSong: (state, action) => {
      state.creditsPerSong = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {setCreditsPerSong, setLoading, setError} = creditSettings.actions;

export default creditSettings.reducer;
