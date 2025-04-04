import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import ROUTE_NAME from './config/routeName';
import VerifyOtpScreen from '../screens/Auth/VerifyOtp/VerifyOtp.screen';
import LoginScreen from '../screens/Auth/Login/Login.screen';

const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAME.Login}
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
        contentStyle: {backgroundColor: '#000'},
      }}>
      <Stack.Screen name={ROUTE_NAME.Login} component={LoginScreen} />
      <Stack.Screen name={ROUTE_NAME.VerifyOtp} component={VerifyOtpScreen} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
