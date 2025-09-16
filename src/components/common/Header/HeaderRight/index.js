import {useNavigation} from '@react-navigation/native';
import React, {memo, useEffect} from 'react';
import {Image, Pressable, Text} from 'react-native';
import appImages from '../../../../resource/images';
import CView from '../../core/View';
import getStyles from './style';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import useCredits from '../../../../hooks/useCredits';

const HeaderRight = ({mode}) => {
  const styles = getStyles(mode);
  const navigation = useNavigation();
  const {credits, refreshCredits} = useCredits();

  // Safely get numeric credit value
  const creditValue = (() => {
    if (typeof credits === 'object' && credits !== null) {
      return credits?.data?.balance || 0;
    }
    return typeof credits === 'number' ? credits : 0;
  })();

  // Refresh credits when component mounts and every 3 minutes
  useEffect(() => {
    refreshCredits();

    // Set up an interval to refresh credits every 3 minutes
    const intervalId = setInterval(() => {
      refreshCredits();
    }, 3 * 60000); // 3 minutes

    return () => clearInterval(intervalId);
  }, [refreshCredits]);

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const handleCreditPress = () => {
    navigation.navigate(ROUTE_NAME.RecurringSubscriptionScreen);
  };

  return (
    <CView row style={styles.wrapper}>
      <CView style={styles.searchWrapper}>
        <Pressable onPress={handleCreditPress}>
          {creditValue > 0 ? (
            <CView style={styles.creditsWrapper}>
              <Text style={styles.creditsText}>{creditValue}</Text>
            </CView>
          ) : (
            <Image
              source={appImages.subscribeIcon}
              style={styles.subscribeIcon}
            />
          )}
        </Pressable>
      </CView>
      <CView style={styles.searchWrapper}>
        <Pressable onPress={openDrawer}>
          <Image source={appImages.settingIcon} style={styles.searchIcon} />
        </Pressable>
      </CView>
    </CView>
  );
};

export default memo(HeaderRight);
