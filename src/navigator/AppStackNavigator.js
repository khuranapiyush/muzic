import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useMemo} from 'react';
import {appStackRoutes} from './config/route';
import ROUTE_NAME from './config/routeName';
import {useTheme} from '@react-navigation/native';
import Colors from '../components/common/Colors';
import GlobalPlayer from '../components/common/GlobalPlayer';

const Stack = createNativeStackNavigator();

const AppStackNavigator = () => {
  const {mode} = useTheme();

  const screenOptions = useMemo(
    () => ({
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: 0,
        shadowColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
      headerTintColor: Colors[mode]?.white,
    }),
    [mode],
  );

  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAME.RootStack}
      screenOptions={screenOptions}>
      {appStackRoutes.map(route => (
        <Stack.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={route.options}
        />
      ))}
    </Stack.Navigator>
  );
};

export default React.memo(AppStackNavigator);
