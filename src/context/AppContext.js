import {useMutation, useQuery} from '@tanstack/react-query';
import React, {createContext, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  requestNotifications,
} from 'react-native-permissions';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAppConfig} from '../api/app';
import {guestAuthLogin} from '../api/auth';
import {dailyStreak, fetchUserDetail, fetchWalletBalance} from '../api/user';
import {APP_VERSION, appKeys} from '../constants/app';
import {addAuthInterceptor, setupResponseInterceptor} from '../dataProvider';
import useDeviceId from '../hooks/useDeviceId';
import useModal from '../hooks/useModal';
import {store} from '../stores';
import {useAuthUser} from '../stores/selector';
import {
  setAppData,
  setAppLoading,
  setDeviceId,
  setFeatureEnable,
  setSessionId,
} from '../stores/slices/app';
import {setUser, setUserData} from '../stores/slices/user';
import {setWalletStats} from '../stores/slices/walletStats';
import {getData, storeData} from '../utils/asyncStorage';
import {compareVersions, getUniqueId} from '../utils/common';
// import AnalyticsHandler from '../components/common/AnalyticsHandler';
import DeepLinkHandler from '../components/common/DeepLinkHandler';

const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const {isGuest, isLoggedIn, id: userId} = useSelector(useAuthUser);

  const {accessToken, refreshToken} = useSelector(state => state.auth);

  const deviceId = useDeviceId();

  const {showModal, hideModal} = useModal();

  const dispatch = useDispatch();

  const checkForUpdates = async data => {
    const lastShownVersion = await getData(appKeys.lastShownAppVersion);

    if (
      data.latestVersion > APP_VERSION &&
      data.latestVersion !== lastShownVersion
    ) {
      showModal('softUpdate', {
        isVisible: true,
        onClose: () => hideModal('softUpdate'),
      });
    }
    await storeData(appKeys.lastShownAppVersion, data.latestVersion || '');
  };

  const checkForHardUpdate = data => {
    if (
      data.requireHardUpdate &&
      compareVersions(data.latestVersion, APP_VERSION)
    ) {
      showModal('hardUpdate', {
        isVisible: true,
        onClose: () => hideModal('hardUpdate'),
      });
    } else if (data.requireSoftUpdate) {
      checkForUpdates(data);
    }
  };

  const requestTrackingPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY;

        const status = await check(permission);

        if (status !== RESULTS.GRANTED) {
          const result = await request(permission);
          if (result === RESULTS.GRANTED) {
            // User granted app tracking permission
          }
        }
      }
    } catch (error) {
      console.log('error in  requestTrackingPermission', error);
    }
  };
  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const {status} = await requestNotifications([]);

        if (status === RESULTS.GRANTED) {
          // Permission granted, you can now use push notifications
        }
      }
    } catch (error) {
      console.log('error in  requestNotificationPermission', error);
    }
  };

  useQuery({
    queryKey: ['appConfig'],
    queryFn: fetchAppConfig,
    enabled: permissionsLoaded,
    onSuccess: res => {
      const data = res.data.data;
      if (data.latestVersion == APP_VERSION) {
        dispatch(setFeatureEnable(false));
      } else {
        dispatch(setFeatureEnable(true));
      }
      dispatch(setAppData(data));
      checkForHardUpdate(data);
    },
  });

  const {refetch: refetchWalletBalance} = useQuery({
    queryKey: [`getWalletBalance/${userId}`],
    queryFn: fetchWalletBalance,
    enabled: isGuest || isLoggedIn,
    onSuccess: res => {
      const data = res?.data;
      dispatch(setWalletStats(data));
    },
    onError: err => {
      console.error('Error while fetchWalletBalance===>', err);
    },
  });

  const {refetch: refetchUserData} = useQuery({
    queryKey: [`getUserData/${userId}`],
    queryFn: fetchUserDetail.bind(this, {userId: userId}),
    enabled: (isGuest || isLoggedIn) && !!userId,
    onSuccess: res => {
      const data = res?.data?.result;
      dispatch(setUserData(data));
    },
    onError: err => {
      console.error('Error while fetchWalletBalance===>', err);
    },
  });

  const {mutate: deviceLogin} = useMutation(data => guestAuthLogin(data), {
    onSuccess: res => {
      dispatch(setDeviceId(deviceId));
      dispatch(setAppLoading(false));
      dispatch(setUser({isGuest: true, ...res.data}));
    },
    onError: err => {
      dispatch(setAppLoading(false));
      console.log(err.response.data.message);
    },
  });

  useEffect(() => {
    dispatch(setSessionId(getUniqueId()));
  }, [dispatch]);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await requestTrackingPermission();
        await requestNotificationPermission();
        setPermissionsLoaded(true); //
      } catch (error) {
        console.log('Error requesting permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  const {mutate: handlePostDailyStreak} = useMutation(data => dailyStreak());

  useEffect(() => {
    if (!isGuest && !isLoggedIn && deviceId) {
      // is a guest account
      dispatch(setAppLoading(true));
      deviceLogin({deviceId});
    }
  }, [deviceId, deviceLogin, dispatch, isGuest, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      handlePostDailyStreak();
    }
  }, [handlePostDailyStreak, isLoggedIn]);

  useEffect(() => {
    if (userId) {
      refetchWalletBalance();
      refetchUserData();
    }
  }, [userId, refetchWalletBalance, refetchUserData]);

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

  useEffect(() => {
    if (!accessToken && !refreshToken) {
      console.log('Redirecting to login as refresh token expired');
      showModal('auth', {
        isVisible: true,
        onClose: () => hideModal('auth'),
      });
    }
  }, [accessToken, hideModal, refreshToken, showModal]);

  return (
    <AppContext.Provider value={isLoggedIn}>
      <DeepLinkHandler>
        {/* {permissionsLoaded && <AnalyticsHandler> */}
        {children}
        {/* </AnalyticsHandler>} */}
      </DeepLinkHandler>
    </AppContext.Provider>
  );
};

export default AppProvider;
