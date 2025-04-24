import React from 'react';
import {useDispatch} from 'react-redux';
import appImages from '../../../../resource/images';
import {resetUser} from '../../../../stores/slices/user';
import CView from '../../core/View';
import CustomDrawerItem from '../DrawerItem';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import {useNavigation} from '@react-navigation/native';
import useModal from '../../../../hooks/useModal';

const DrawerFooter = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {showModal} = useModal();

  const handleLogout = () => {
    setTimeout(() => {
      dispatch(resetUser());
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

  return (
    <CView>
      <CustomDrawerItem
        arrow={false}
        label="Subscribe"
        logoUrl={appImages.subscribeIcon}
        onPress={handleSubscribe}
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
  );
};

export default DrawerFooter;
