import {createSlice} from '@reduxjs/toolkit';
import {resetUser, setUser} from '../user';

const initialState = {
  accessToken: null,
  refreshToken: null,
  isLoggedIn: false,
};

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateToken: (state, action) => {
      // Handle different formats of token payload
      if (typeof action.payload === 'string') {
        // If the payload is just a string token, update access token only
        state.accessToken = action.payload;
        state.isLoggedIn = true;
      } else if (action.payload && typeof action.payload === 'object') {
        // Handle object with access, refresh format
        if (action.payload.access) {
          state.accessToken = action.payload.access;
        }
        if (action.payload.refresh) {
          state.refreshToken = action.payload.refresh;
        }
        // Always set logged in when tokens are updated
        state.isLoggedIn = true;
      }
    },
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setUser, (state, action) => {
      const {tokens, isLoggedIn} = action.payload;
      state.isLoggedIn = isLoggedIn;

      if (tokens) {
        const {access, refresh} = tokens;
        state.accessToken = access?.token;
        state.refreshToken = refresh?.token;
      }
    });

    builder.addCase(resetUser, (state, action) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      return state;
    });
  },
});

export const {updateToken, setLoggedIn} = auth.actions;

export default auth.reducer;
