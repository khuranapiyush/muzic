import {createSlice} from '@reduxjs/toolkit';
import {resetUser, setUser} from '../user';

const initialState = {
  isLoggedIn: false,
  accessToken: null,
  refreshToken: null,
  isGuest: false,
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
      const {tokens, isGuest, isLoggedIn} = action.payload;

      const {access, refresh} = tokens;

      state.accessToken = access?.token;

      state.refreshToken = refresh?.token;

      if (isLoggedIn) {
        state.isLoggedIn = true;
      }

      if (isGuest) {
        state.isGuest = true;
      } else {
        state.isGuest = false;
      }
    });

    builder.addCase(resetUser, (state, action) => {
      state.isLoggedIn = false;
      state.isGuest = false;
      state.accessToken = null;
      state.refreshToken = null;
      return state;
    });
  },
});

export const {signOut, updateToken} = auth.actions;

export default auth.reducer;
