/* eslint-disable react-native/no-inline-styles */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image} from 'react-native';
import {useSelector} from 'react-redux';
import CustomHeader from '../components/common/Header';
import appImages from '../resource/images';
import Home from '../screens/Home/Home.screen';
import {useTheme} from '@react-navigation/native';
import CView from '../components/common/core/View';
import AIGenerator from '../components/feature/aiAgent/AIGenerator/AIGenerator';
import CoverCreationScreen from '../components/feature/aiAgent/AIGenerator/AiCover';
import LibraryScreen from '../components/feature/library';
import Colors from '../components/common/Colors';
// import AddFund from '../components/feature/wallet/AddFund'

const Tab = createBottomTabNavigator();

const HomeStackNavigator = () => {
  const {isFullScreen: isPlayerFullScreen} = useSelector(state => state.player);

  const {mode} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: '8%',
          marginTop: 10,
          paddingBottom: 10,
          paddingTop: 2,
          marginBottom: 15,
          backgroundColor: '#000',
        },
        headerShown: false,
        header: props => {
          return <CustomHeader {...props} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Nohemi',
          textAlign: 'center',
          fontWeight: '400',
          lineHeight: 14.4,
          letterSpacing: 0.24,
          color: Colors[mode].similarSongTabColor,
        },
      }}>
      <Tab.Screen
        name={'Create'}
        component={AIGenerator}
        options={{
          tabBarLabel: 'Create',
          headerShown: true,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <CView
                style={{
                  padding: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 58,
                  backgroundColor: focused ? '#FFD5A9' : '#1E1E1E',
                }}>
                <Image
                  source={appImages.createIcon}
                  style={{
                    width: 25,
                    height: 25,
                    overflow: 'hidden',
                    tintColor: focused ? '#000' : '#A5A5A5',
                  }}
                />
              </CView>
            );
          },
        }}
      />
      <Tab.Screen
        name={'Discover'}
        component={Home}
        options={{
          headerShown: !isPlayerFullScreen ? true : false,
          ...(isPlayerFullScreen && {tabBarStyle: {display: 'none'}}),
          tabBarLabel: 'Discover',
          tabBarIcon: ({focused, color, size}) => {
            return (
              <CView
                style={{
                  padding: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 58,
                  backgroundColor: focused ? '#FFD5A9' : '#1E1E1E',
                }}>
                <Image
                  source={appImages.discoverIcon}
                  style={{
                    width: 25,
                    height: 25,
                    overflow: 'hidden',
                    tintColor: focused ? '#000' : '#A5A5A5',
                  }}
                />
              </CView>
            );
          },
        }}
      />

      <Tab.Screen
        name={'AI Cover'}
        component={CoverCreationScreen}
        options={{
          headerShown: true,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <CView
                style={{
                  padding: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 58,
                  backgroundColor: focused ? '#FFD5A9' : '#1E1E1E',
                }}>
                <Image
                  source={appImages.aiCoverIcon}
                  style={{
                    width: 25,
                    height: 25,
                    overflow: 'hidden',
                    tintColor: focused ? '#000' : '#A5A5A5',
                  }}
                />
              </CView>
            );
          },
        }}
      />

      <Tab.Screen
        name={'Library'}
        // component={AddFund}
        component={LibraryScreen}
        options={{
          headerShown: !isPlayerFullScreen ? true : false,
          ...(isPlayerFullScreen && {tabBarStyle: {display: 'none'}}),
          tabBarIcon: ({focused, color, size}) => {
            return (
              <CView
                style={{
                  padding: 5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 58,
                  backgroundColor: focused ? '#FFD5A9' : '#1E1E1E',
                }}>
                <Image
                  source={appImages.libraryIcon}
                  style={{
                    width: 25,
                    height: 25,
                    overflow: 'hidden',
                    tintColor: focused ? '#000' : '#A5A5A5',
                  }}
                />
              </CView>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeStackNavigator;
