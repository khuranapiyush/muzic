import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Remove redux-persist
// If you still need persistence functionality, consider using:
// 1. @reduxjs/toolkit's createListenerMiddleware for selective state persistence
// 2. AsyncStorage directly in your app for manual persistence
// 3. Redux Toolkit Query's cache persistence

export default store;
