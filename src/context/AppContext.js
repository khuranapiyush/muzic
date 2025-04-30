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

  // Set tokenChecked to false during the first render
  useEffect(() => {
    // This ensures we reset the tokenChecked state when the component is first mounted
    console.log('AppContext initial mount - resetting tokenChecked');
    dispatch(setTokenChecked(false));
  }, [dispatch]);

  // Add effect for token validation on startup - with simplified logic
  useEffect(() => {
    if (tokenChecked === false) {
      console.log('Starting auth check process...');

      const checkAuth = async () => {
        try {
          // Wait a moment to ensure everything is initialized
          await new Promise(resolve => setTimeout(resolve, 500));

          console.log(
            'Checking auth tokens:',
            accessToken ? 'Access token exists' : 'No access token',
            refreshToken ? ', Refresh token exists' : ', No refresh token',
          );

          if (!accessToken || !refreshToken) {
            // No tokens, set to logged out
            console.log('No valid tokens - setting to logged out state');
            dispatch(setUser({isLoggedIn: false}));
          } else {
            // Have tokens, try to validate them
            try {
              const isValid = await checkAndRefreshTokens();
              console.log(
                'Token validation result:',
                isValid ? 'Valid' : 'Invalid',
              );

              if (isValid) {
                // If tokens are valid, set user as logged in
                dispatch(setUser({isLoggedIn: true}));
              } else {
                dispatch(setUser({isLoggedIn: false}));
              }
            } catch (error) {
              console.error('Token validation error:', error);
              dispatch(setUser({isLoggedIn: false}));
            }
          }
        } catch (error) {
          console.error('Auth check error:', error);
          dispatch(setUser({isLoggedIn: false}));
        } finally {
          console.log('Auth check complete - setting tokenChecked to true');
          dispatch(setTokenChecked(true));
        }
      };

      checkAuth();
    }
  }, [tokenChecked, accessToken, refreshToken, dispatch]);

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

  useQuery({
    queryKey: ['appConfig'],
    queryFn: fetchAppConfig,
    enabled: permissionsLoaded, // Only fetch after permissions are loaded
    onSuccess: res => {
      const data = res.data.data;
      if (data.latestVersion == APP_VERSION) {
        dispatch(setFeatureEnable(false));
      } else {
        dispatch(setFeatureEnable(true));
      }
      dispatch(setAppData(data));
    },
  });

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

    if (userId) {
      setupInterceptors();
    }

    return () => {
      if (removeAuthInterceptor) {
        removeAuthInterceptor();
      }

      if (removeResponseInterceptor) {
        removeResponseInterceptor();
      }
    };
  }, [userId]);

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
