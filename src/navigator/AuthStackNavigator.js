import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Login from '../screens/Auth/Login/Login.screen';
import VerifyOtp from '../screens/Auth/VerifyOtp/VerifyOtp.screen';

const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Verify your mobile number" component={VerifyOtp} />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;
