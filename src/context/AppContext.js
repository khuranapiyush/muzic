import {useQuery} from '@tanstack/react-query';
import React, {createContext, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import PermissionsManager from '../utils/PermissionsManager';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAppConfig} from '../api/app';
import {APP_VERSION} from '../constants/app';
import {addAuthInterceptor, setupResponseInterceptor} from '../dataProvider';
import {store} from '../stores';
import {useAuthUser} from '../stores/selector';
import {
  setAppData,
  setFeatureEnable,
  setSessionId,
  setTokenChecked,
} from '../stores/slices/app/index';
import {setUser} from '../stores/slices/user';
import {getUniqueId} from '../utils/common';
import {checkAndRefreshTokens} from '../utils/authUtils';
import DeepLinkHandler from '../components/common/DeepLinkHandler';

const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const {isLoggedIn, id: userId} = useSelector(useAuthUser);

  const {accessToken, refreshToken} = useSelector(state => state.auth);

  const dispatch = useDispatch();

  // Now tokenChecked is part of the redux state, we can select it
  const {tokenChecked} = useSelector(state => state.app);

  // Add tokenCheckInitiated state to prevent multiple checks
  const [tokenCheckInitiated, setTokenCheckInitiated] = useState(false);

  // Set tokenChecked to false during the first render
  useEffect(() => {
    // Only reset tokenChecked if it hasn't been checked yet
    if (!tokenCheckInitiated) {
      dispatch(setTokenChecked(false));
      setTokenCheckInitiated(true);

      // Add a fallback timer to ensure tokenChecked is set to true eventually
      const fallbackTimer = setTimeout(() => {
        dispatch(setTokenChecked(true));
      }, 4000);

      return () => clearTimeout(fallbackTimer);
    }
  }, [dispatch, tokenCheckInitiated]);

  // Add effect for token validation on startup - with simplified logic
  useEffect(() => {
    if (tokenChecked === false && tokenCheckInitiated) {
      const checkAuth = async () => {
        try {
          // Wait a moment to ensure everything is initialized
          await new Promise(resolve => setTimeout(resolve, 500));

          if (!accessToken || !refreshToken) {
            // No tokens, set to logged out
            dispatch(setUser({isLoggedIn: false}));
            dispatch(setTokenChecked(true));
            return;
          }

          // Tokens present, validate them
          try {
            // Validate tokens and refresh if needed
            const validationResult = await checkAndRefreshTokens();

            if (validationResult) {
              // Token valid or successfully refreshed, set user state
              dispatch(setUser({isLoggedIn: true}));
            }
            // If validationResult is false, do NOT force logout here.
            // It could be a transient network/server issue. Keep current state.
          } catch (error) {
            // On unexpected errors, do not force logout. Keep current state.
            console.error('Token validation error:', error);
          } finally {
            // Always mark token check as complete
            dispatch(setTokenChecked(true));
          }
        } catch (error) {
          // Error in auth check - do not force logout; just mark as checked
          dispatch(setTokenChecked(true));
        }
      };

      // Start the auth check process
      checkAuth();
    }
  }, [tokenChecked, dispatch, accessToken, refreshToken, tokenCheckInitiated]);

  const requestMicrophonePermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        console.log('Requesting microphone permissions...');
        try {
          const result = await PermissionsManager.request(
            PermissionsManager.PERMISSIONS.IOS.MICROPHONE,
          );
          console.log('Microphone permission result:', result);
          return result === PermissionsManager.RESULTS.GRANTED;
        } catch (permError) {
          // If there's an error, handle it gracefully
          console.warn('Microphone permissions error:', permError.message);
          return false;
        }
      } else if (Platform.OS === 'android') {
        console.log('Requesting microphone permissions on Android...');
        try {
          const result = await PermissionsManager.request(
            PermissionsManager.PERMISSIONS.ANDROID.RECORD_AUDIO,
          );
          console.log('Microphone permission result:', result);
          return result === PermissionsManager.RESULTS.GRANTED;
        } catch (permError) {
          console.warn('Microphone permissions error:', permError.message);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error in requestMicrophonePermission', error);
      return false;
    }
  };

  // useQuery({
  //   queryKey: ['appConfig'],
  //   queryFn: fetchAppConfig,
  //   enabled: permissionsLoaded, // Only fetch after permissions are loaded
  //   onSuccess: res => {
  //     const data = res.data.data;
  //     if (data.latestVersion == APP_VERSION) {
  //       dispatch(setFeatureEnable(false));
  //     } else {
  //       dispatch(setFeatureEnable(true));
  //     }
  //     dispatch(setAppData(data));
  //   },
  //   onError: error => {
  //     console.log('Error fetching app config:', error);
  //     // Even if app config fails, ensure we move forward with the app
  //     if (!tokenChecked) {
  //       dispatch(setTokenChecked(true));
  //     }
  //   },
  // });

  useEffect(() => {
    dispatch(setSessionId(getUniqueId()));
  }, [dispatch]);

  // Update the token check effect to handle navigation properly
  useEffect(() => {
    if (!accessToken && !refreshToken) {
      console.log('No valid tokens found, user needs to login');
      // No need to show modal, navigation will handle redirecting to auth
      dispatch(setUser({isLoggedIn: false}));
    }
  }, [accessToken, refreshToken, dispatch]);

  useEffect(() => {
    let removeAuthInterceptor = null;
    let removeResponseInterceptor = null;

    const setupInterceptors = async () => {
      removeAuthInterceptor = await addAuthInterceptor();
      removeResponseInterceptor = await setupResponseInterceptor(store);
    };

    // Set up interceptors irrespective of whether userId is present.
    // This ensures token refresh/attachment works even before user profile is loaded.
    setupInterceptors();

    return () => {
      if (removeAuthInterceptor) {
        removeAuthInterceptor();
      }

      if (removeResponseInterceptor) {
        removeResponseInterceptor();
      }
    };
  }, []);

  // Initialize only microphone permissions when needed
  useEffect(() => {
    const initializePermissions = async () => {
      // Only mark permissions as loaded, we'll request microphone when needed
      setPermissionsLoaded(true);
    };

    initializePermissions();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        requestMicrophonePermission,
      }}>
      <DeepLinkHandler>{children}</DeepLinkHandler>
    </AppContext.Provider>
  );
};

export default AppProvider;
