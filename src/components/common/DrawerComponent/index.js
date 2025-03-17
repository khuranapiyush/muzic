import {DrawerContentScrollView} from '@react-navigation/drawer';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
// import appImages from '../../../resource/images'
import {useAuthUser} from '../../../stores/selector';
import Divider from '../core/Divider';
import CView from '../core/View';
import DrawerFooter from './DrawerFooter';
import DrawerHeader from './DrawerHeader';
// import CustomDrawerItem from './DrawerItem'
// import ROUTE_NAME from '../../../navigator/config/routeName'
import getStyles from './style';
import {useTheme} from '@react-navigation/native';

const CustomDrawerComponent = props => {
  const {isGuest, isLoggedIn} = useSelector(useAuthUser);
  // const { isShowFeature } = useSelector(state => state.app)
  // const { showDashboard = false } = useSelector(state => state.user)
  const {mode} = useTheme();
  const styles = getStyles(mode);

  // const handleProfile = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.Profile)
  // }
  // const handleEarnCoin = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.EarnCoin)
  // }
  // const handleWallet = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.Wallet)
  // }

  // const handleLanguage = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.Language)
  // }
  // const handleReward = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.Rewards)
  // }
  // const handleCreatorDashboard = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.CreatorDashboard)
  // }

  // const handleReferAndEarn = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.ReferAndEarn)
  // }

  // const handleMyContent = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.MyContent)
  // }

  // const handleCommunityGroup = () => {
  //   props.navigation.closeDrawer()
  //   props.navigation.navigate(ROUTE_NAME.CommunityGroup)
  // }

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
