import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import CustomDrawerComponent from '../components/common/DrawerComponent';
import MainStackNavigator from './MainStackNavigator';
import ROUTE_NAME from './config/routeName';

const Drawer = createDrawerNavigator();

const RootStackNavigator = props => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerComponent {...props} />}
      detachInactiveScreens
      screenOptions={{
        drawerType: 'front',
        headerShown: false,
        drawerStyle: {
          width: '100%',
        },
        swipeEnabled: false,
      }}>
      <Drawer.Screen
        name={ROUTE_NAME.MainStack}
        component={MainStackNavigator}
      />
    </Drawer.Navigator>
  );
};

export default RootStackNavigator;
