import {useNavigation} from '@react-navigation/native';
import React, {memo} from 'react';
import {Image, Pressable} from 'react-native';
import appImages from '../../../../resource/images';
import CView from '../../core/View';
import getStyles from './style';
import ROUTE_NAME from '../../../../navigator/config/routeName';

const HeaderRight = ({mode}) => {
  const styles = getStyles(mode);

  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const openSubscribe = () => {
    navigation.navigate(ROUTE_NAME.SubscriptionScreen);
  };

  return (
    <CView row style={styles.wrapper}>
      <CView style={styles.searchWrapper}>
        <Pressable onPress={openSubscribe}>
          <Image
            source={appImages.subscribeIcon}
            style={styles.subscribeIcon}
          />
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
