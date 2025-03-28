import React from 'react';
import {useDispatch} from 'react-redux';
import appImages from '../../../../resource/images';
import {resetUser} from '../../../../stores/slices/user';
import CView from '../../core/View';
import CustomDrawerItem from '../DrawerItem';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import {useNavigation} from '@react-navigation/native';

const DrawerFooter = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    dispatch(resetUser());
  };

  const deleteAccount = () => {
    // Handle the case when the user has no credits
    navigation.navigate(ROUTE_NAME.SubscriptionScreen);
  };

  return (
    <CView>
      <CustomDrawerItem
        arrow={false}
        label="Subscribe"
        logoUrl={appImages.subscribeIcon}
        onPress={deleteAccount}
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
