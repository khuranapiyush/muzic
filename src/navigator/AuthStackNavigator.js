import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import ROUTE_NAME from './config/routeName';
import VerifyOtpScreen from '../screens/Auth/VerifyOtp/VerifyOtp.screen';
import LoginScreen from '../screens/Auth/Login/Login.screen';
import PhoneInputScreen from '../screens/Auth/PhoneInput/PhoneInput.screen';

const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTE_NAME.Login}
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
        contentStyle: {backgroundColor: 'transparent'},
      }}>
      <Stack.Screen name={ROUTE_NAME.Login} component={LoginScreen} />
      <Stack.Screen name={ROUTE_NAME.PhoneInput} component={PhoneInputScreen} />
      <Stack.Screen name={ROUTE_NAME.VerifyOtp} component={VerifyOtpScreen} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
