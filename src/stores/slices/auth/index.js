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
        if (action.payload.hasOwnProperty('access')) {
          state.accessToken = action.payload.access;
        }
        if (action.payload.hasOwnProperty('refresh')) {
          state.refreshToken = action.payload.refresh;
        }

        // Backward/compat: accept keys named accessToken/refreshToken too
        if (action.payload.hasOwnProperty('accessToken')) {
          state.accessToken = action.payload.accessToken;
        }
        if (action.payload.hasOwnProperty('refreshToken')) {
          state.refreshToken = action.payload.refreshToken;
        }

        // Set logged in based on whether we have valid tokens
        const hasValidTokens = state.accessToken && state.refreshToken;
        state.isLoggedIn = hasValidTokens;
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
