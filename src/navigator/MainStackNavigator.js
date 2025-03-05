import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import CView from '../components/common/core/View';
import {mainAppRoutes} from './config/route';
import ROUTE_NAME from './config/routeName';

const Stack = createNativeStackNavigator();

const renderStackScreen = item => {
  return (
    <Stack.Screen
      name={item.name}
      component={item.component}
      options={{headerShown: false, ...item.options}}
      key={item.name}
    />
  );
};

const MainStackNavigator = () => {
  return (
    <CView style={{flex: 1}}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={ROUTE_NAME.HomeStack}>
        {mainAppRoutes.map(renderStackScreen)}
      </Stack.Navigator>
    </CView>
  );
};

export default MainStackNavigator;
