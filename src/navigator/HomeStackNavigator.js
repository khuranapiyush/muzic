/* eslint-disable react-native/no-inline-styles */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image, StyleSheet, Text} from 'react-native';
import {useSelector} from 'react-redux';
import CustomHeader from '../components/common/Header';
import appImages from '../resource/images';
import Home from '../screens/Home/Home.screen';
import {useTheme} from '@react-navigation/native';
import CView from '../components/common/core/View';
import AIGenerator from '../components/feature/aiAgent/AIGenerator/AIGenerator';
import CoverCreationScreen from '../components/feature/aiAgent/AIGenerator/AiCover';
import LibraryScreen from '../components/feature/library';

const Tab = createBottomTabNavigator();

const HomeStackNavigator = () => {
  const {isFullScreen: isPlayerFullScreen} = useSelector(state => state.player);

  const {mode} = useTheme();

  const renderTabIcon = (iconSource, focused) => {
    return (
      <CView
        style={[
          styles.iconContainer,
          focused ? styles.focusedIcon : styles.unfocusedIcon,
        ]}>
        <Image
          source={iconSource}
          style={[styles.iconImage, {tintColor: focused ? '#000' : '#A5A5A5'}]}
        />
      </CView>
    );
  };

  const renderTabLabel = (label, focused) => {
    return (
      <Text
        style={[
          styles.tabLabel,
          focused ? styles.focusedLabel : styles.unfocusedLabel,
        ]}>
        {label}
      </Text>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 80,
          paddingBottom: 10,
          paddingTop: 20,
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderColor: '#FFB680',
        },
        headerShown: false,
        header: props => {
          return <CustomHeader {...props} />;
        },
        tabBarActiveTintColor: '#FFD5A9',
        tabBarInactiveTintColor: '#A5A5A5',
      }}>
      <Tab.Screen
        name={'Create'}
        component={AIGenerator}
        options={{
          headerShown: true,
          tabBarIcon: ({focused}) =>
            renderTabIcon(appImages.createIcon, focused),
          tabBarLabel: ({focused}) => renderTabLabel('Create', focused),
        }}
      />
      <Tab.Screen
        name={'Discover'}
        component={Home}
        options={{
          headerShown: !isPlayerFullScreen ? true : false,
          ...(isPlayerFullScreen && {tabBarStyle: {display: 'none'}}),
          tabBarIcon: ({focused}) =>
            renderTabIcon(appImages.discoverIcon, focused),
          tabBarLabel: ({focused}) => renderTabLabel('Discover', focused),
        }}
      />

      <Tab.Screen
        name={'AI Cover'}
        component={CoverCreationScreen}
        options={{
          headerShown: true,
          tabBarIcon: ({focused}) =>
            renderTabIcon(appImages.aiCoverIcon, focused),
          tabBarLabel: ({focused}) => renderTabLabel('AI Cover', focused),
        }}
      />

      <Tab.Screen
        name={'Library'}
        component={LibraryScreen}
        options={{
          headerShown: !isPlayerFullScreen ? true : false,
          ...(isPlayerFullScreen && {tabBarStyle: {display: 'none'}}),
          tabBarIcon: ({focused}) =>
            renderTabIcon(appImages.libraryIcon, focused),
          tabBarLabel: ({focused}) => renderTabLabel('Library', focused),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  focusedIcon: {
    backgroundColor: '#FFD5A9',
  },
  unfocusedIcon: {
    backgroundColor: '#1E1E1E',
  },
  iconImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Nohemi',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 14.4,
    letterSpacing: 0.24,
    marginTop: 4,
  },
  focusedLabel: {
    color: '#FFD5A9',
    fontWeight: '600',
  },
  unfocusedLabel: {
    color: '#A5A5A5',
  },
});

export default HomeStackNavigator;
