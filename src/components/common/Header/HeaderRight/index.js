import {useNavigation} from '@react-navigation/native';
import React, {memo} from 'react';
import {Image, Pressable} from 'react-native';
import appImages from '../../../../resource/images';
import CView from '../../core/View';
import getStyles from './style';

const HeaderRight = ({mode}) => {
  const styles = getStyles(mode);

  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.openDrawer();
  };
  return (
    <CView row style={styles.wrapper}>
      <CView style={styles.searchWrapper}>
        <Pressable onPress={openDrawer}>
          <Image source={appImages.settingIcon} style={styles.searchIcon} />
        </Pressable>
      </CView>
    </CView>
  );
};

export default memo(HeaderRight);
