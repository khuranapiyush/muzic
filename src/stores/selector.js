import { createSelector } from 'reselect'

// Selectors for auth slice
const selectAuthState = state => state.auth

export const selectIsLoggedIn = createSelector(
  [selectAuthState],
  auth => auth.isLoggedIn
)

export const selectIsGuest = createSelector(
  [selectAuthState],
  auth => auth.isGuest
)

// Selectors for user slice
const selectUserState = state => state.user

export const selectUserId = createSelector([selectUserState], user => user.id)

// Selectors for App slice
const selectAppState = state => state.app

export const selectDeviceId = createSelector(
  [selectAppState],
  app => app.deviceId
)

// Combined selector
export const useAuthUser = createSelector(
  [selectIsLoggedIn, selectIsGuest, selectUserId, selectDeviceId],
  (isLoggedIn, isGuest, id, deviceId) => {
    return {
      isLoggedIn,
      isGuest,
      id,
      deviceId
    }
  }
)
