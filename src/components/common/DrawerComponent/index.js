import {DrawerContentScrollView} from '@react-navigation/drawer';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useAuthUser} from '../../../stores/selector';
import Divider from '../core/Divider';
import CView from '../core/View';
import DrawerFooter from './DrawerFooter';
import DrawerHeader from './DrawerHeader';
import getStyles from './style';
import {useTheme} from '@react-navigation/native';

const CustomDrawerComponent = props => {
  const {isGuest, isLoggedIn} = useSelector(useAuthUser);
  const {mode} = useTheme();
  const styles = getStyles(mode);

  return (
    <SafeAreaView style={styles.drawerComponentWrapper}>
      <CView>
        <DrawerHeader {...props} />
      </CView>
      <Divider customStyle={styles.dividerStyle} />
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{paddingTop: 0}}>
        {!isGuest && !!isLoggedIn && <DrawerFooter />}
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

export default CustomDrawerComponent;
