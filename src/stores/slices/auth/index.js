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
      state.refreshToken = action.payload.refresh;
      state.accessToken = action.payload.access;
      state.isLoggedIn = true;
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
