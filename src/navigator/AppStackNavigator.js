import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {appStackRoutes} from './config/route';
import ROUTE_NAME from './config/routeName';
import {useTheme} from '@react-navigation/native';
import Colors from '../components/common/Colors';

const Stack = createNativeStackNavigator();

const renderStackScreen = item => {
  return (
    <Stack.Screen
      name={item.name}
      component={item.component}
      options={item.options}
      key={item.name}
    />
  );
};

const AppStackNavigator = () => {
  const {mode} = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAME.RootStack}
      screenOptions={{
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: '#000',
          borderWidth: 0,
          borderBottomWidth: 0,
          shadowColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: Colors[mode]?.white,
      }}>
      {appStackRoutes.map(renderStackScreen)}
    </Stack.Navigator>
  );
};

export default AppStackNavigator;
