import {createSlice} from '@reduxjs/toolkit';
import {resetUser, setUser} from '../user';

const initialState = {
  accessToken: null,
  refreshToken: null,
};

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateToken: (state, action) => {
      state.refreshToken = action.payload.refresh;
      state.accessToken = action.payload.access;
    },
  },
  extraReducers: builder => {
    builder.addCase(setUser, (state, action) => {
      const {tokens, isLoggedIn} = action.payload;

      if (tokens) {
        const {access, refresh} = tokens;
        state.accessToken = access?.token;
        state.refreshToken = refresh?.token;
      }
    });

    builder.addCase(resetUser, (state, action) => {
      state.accessToken = null;
      state.refreshToken = null;
      return state;
    });
  },
});

export const {updateToken} = auth.actions;

export default auth.reducer;
