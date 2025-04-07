import {createSelector} from 'reselect';

// Selectors for auth slice
const selectAuthState = state => state.auth;

// Selectors for user slice
const selectUserState = state => state.user;

export const selectIsLoggedIn = createSelector(
  [selectUserState],
  user => user.isLoggedIn,
);

export const selectUserId = createSelector(
  [selectUserState],
  user => user.userId || user.id || user._id,
);

// Selectors for App slice
const selectAppState = state => state.app;

export const selectDeviceId = createSelector(
  [selectAppState],
  app => app.deviceId,
);

// Combined selector
export const useAuthUser = createSelector(
  [selectIsLoggedIn, selectUserId, selectDeviceId],
  (isLoggedIn, id, deviceId) => {
    return {
      isLoggedIn,
      id,
      deviceId,
    };
  },
);
