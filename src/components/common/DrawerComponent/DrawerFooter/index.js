import React, {useState, useEffect} from 'react';
import appImages from '../../../../resource/images';
import {logoutUser} from '../../../../utils/authUtils';
import CView from '../../core/View';
import CustomDrawerItem from '../DrawerItem';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import {useNavigation} from '@react-navigation/native';
import useModal from '../../../../hooks/useModal';
import analyticsUtils from '../../../../utils/analytics';
import facebookEvents from '../../../../utils/facebookEvents';
import CText from '../../core/Text';
import DeviceInfo from 'react-native-device-info';

const DrawerFooter = () => {
  const navigation = useNavigation();
  const {showModal} = useModal();
  const [appVersion, setAppVersion] = useState('...');

  useEffect(() => {
    const getAppVersion = async () => {
      try {
        const version = await DeviceInfo.getVersion();
        const buildNumber = await DeviceInfo.getBuildNumber();
        setAppVersion(`Version ${version} (${buildNumber})`);
      } catch (error) {
        console.warn('Error getting app version:', error);
        setAppVersion('Version 1.0.0');
      }
    };

    getAppVersion();
  }, []);

  const handleLogout = async () => {
    // Track logout event
    analyticsUtils.trackCustomEvent('user_logout', {
      method: 'drawer_menu',
      timestamp: Date.now(),
    });

    // Track logout with Facebook Events
    try {
      facebookEvents.logCustomEvent('user_logout', {
        method: 'drawer_menu',
      });
    } catch (error) {
      // Silent error handling
    }

    setTimeout(async () => {
      await logoutUser();
    }, 300);
  };

  const handleSubscribe = () => {
    setTimeout(() => {
      navigation.navigate(ROUTE_NAME.SubscriptionScreen);
    }, 300);
  };

  const handleDeleteAccount = () => {
    setTimeout(() => {
      showModal('deleteAccount');
    }, 300);
  };

  const handlePrivacyPolicy = () => {
    setTimeout(() => {
      navigation.navigate(ROUTE_NAME.PrivacyPolicy);
    }, 300);
  };

  const handleTermsAndConditions = () => {
    setTimeout(() => {
      navigation.navigate(ROUTE_NAME.TermsAndConditions);
    }, 300);
  };

  return (
    <CView
      style={{
        justifyContent: 'space-between',
        height: '100%',
      }}>
      <CView>
        <CustomDrawerItem
          arrow={false}
          label="Subscribe"
          logoUrl={appImages.subscribeIcon}
          onPress={handleSubscribe}
        />
        <CustomDrawerItem
          arrow={false}
          label="Privacy Policy"
          logoUrl={appImages.privacyPolicyIcon}
          onPress={handlePrivacyPolicy}
          customStyles={{logoStyles: {tintColor: '#FFF'}}}
        />
        <CustomDrawerItem
          arrow={false}
          label="Terms & Conditions"
          logoUrl={appImages.termsAndConditionsIcon}
          onPress={handleTermsAndConditions}
          customStyles={{logoStyles: {tintColor: '#FFF'}}}
        />
        <CustomDrawerItem
          arrow={false}
          label="Delete Account"
          logoUrl={appImages.warningIcon}
          onPress={handleDeleteAccount}
          customStyles={{logoStyles: {tintColor: '#FF3B30'}}}
        />
        <CustomDrawerItem
          arrow={false}
          label="Logout"
          logoUrl={appImages.logout}
          onPress={handleLogout}
          customStyles={{logoStyles: {tintColor: 'white'}}}
        />
      </CView>
      <CView style={{alignItems: 'center', justifyContent: 'flex-end'}}>
        <CText>{appVersion}</CText>
      </CView>
    </CView>
  );
};

export default DrawerFooter;
