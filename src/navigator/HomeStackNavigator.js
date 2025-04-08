/* eslint-disable react-native/no-inline-styles */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useMemo, useCallback} from 'react';
import {Image, StyleSheet, Text, Platform} from 'react-native';
import {useSelector} from 'react-redux';
import CustomHeader from '../components/common/Header';
import appImages from '../resource/images';
import CView from '../components/common/core/View';

// Import screens directly instead of using lazy loading
import Home from '../screens/Home/Home.screen';
import AIGenerator from '../components/feature/aiAgent/AIGenerator/AIGenerator';
import CoverCreationScreen from '../components/feature/aiAgent/AIGenerator/AiCover';
import LibraryScreen from '../components/feature/library';

const Tab = createBottomTabNavigator();

// Pre-define constants to avoid recreating objects in render cycles
const ICON_TINT_COLORS = {
  active: '#000',
  inactive: '#A5A5A5',
};

// Optimize the tab icon component with stricter memoization
const TabIcon = React.memo(
  ({iconSource, focused}) => (
    <CView
      style={[
        styles.iconContainer,
        focused ? styles.focusedIcon : styles.unfocusedIcon,
      ]}>
      <Image
        source={iconSource}
        style={[
          styles.iconImage,
          {
            tintColor: focused
              ? ICON_TINT_COLORS.active
              : ICON_TINT_COLORS.inactive,
          },
        ]}
        resizeMode="contain"
      />
    </CView>
  ),
  (prevProps, nextProps) =>
    prevProps.iconSource === nextProps.iconSource &&
    prevProps.focused === nextProps.focused,
);

// Optimize the tab label component with stricter memoization
const TabLabel = React.memo(
  ({label, focused}) => (
    <Text
      style={[
        styles.tabLabel,
        focused ? styles.focusedLabel : styles.unfocusedLabel,
      ]}>
      {label}
    </Text>
  ),
  (prevProps, nextProps) =>
    prevProps.label === nextProps.label &&
    prevProps.focused === nextProps.focused,
);

// Create constant styles outside the component to prevent recreating them
const hiddenTabBarStyle = {display: 'none'};

const HomeStackNavigator = () => {
  const {isFullScreen: isPlayerFullScreen} = useSelector(state => state.player);

  // Memoize base screen options to avoid recalculation
  const baseScreenOptions = useMemo(
    () => ({
      tabBarStyle: {
        height: 80,
        paddingBottom: 10,
        paddingTop: 20,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderColor: '#FFB680',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerShown: false,
      header: props => <CustomHeader {...props} />,
      tabBarActiveTintColor: '#FFD5A9',
      tabBarInactiveTintColor: '#A5A5A5',
      lazy: true,
      detachInactiveScreens: true,
      tabBarHideOnKeyboard: true, // Hide when keyboard is visible
      // Optimize transition animations
      ...(Platform.OS === 'android' && {
        animationEnabled: false,
      }),
    }),
    [],
  );

  // Optimize tab options creation with proper memoization
  const createTabOptions = useCallback(
    (icon, label) => ({
      headerShown: true,
      tabBarIcon: ({focused}) => (
        <TabIcon iconSource={icon} focused={focused} />
      ),
      tabBarLabel: ({focused}) => <TabLabel label={label} focused={focused} />,
    }),
    [],
  );

  // Memoize player-dependent options
  const playerDependentOptions = useMemo(
    () => ({
      headerShown: !isPlayerFullScreen,
      tabBarStyle: isPlayerFullScreen
        ? hiddenTabBarStyle
        : baseScreenOptions.tabBarStyle,
    }),
    [isPlayerFullScreen, baseScreenOptions.tabBarStyle],
  );

  // Create individual tab options with minimal dependencies
  const discoverTabOptions = useMemo(
    () => ({
      ...playerDependentOptions,
      tabBarIcon: ({focused}) => (
        <TabIcon iconSource={appImages.discoverIcon} focused={focused} />
      ),
      tabBarLabel: ({focused}) => (
        <TabLabel label="Discover" focused={focused} />
      ),
    }),
    [playerDependentOptions],
  );

  const libraryTabOptions = useMemo(
    () => ({
      ...playerDependentOptions,
      tabBarIcon: ({focused}) => (
        <TabIcon iconSource={appImages.libraryIcon} focused={focused} />
      ),
      tabBarLabel: ({focused}) => (
        <TabLabel label="Library" focused={focused} />
      ),
    }),
    [playerDependentOptions],
  );

  // Memoize create tab options
  const createOptions = useMemo(
    () => createTabOptions(appImages.createIcon, 'Create'),
    [createTabOptions],
  );

  // Memoize AI cover tab options
  const aiCoverOptions = useMemo(
    () => createTabOptions(appImages.aiCoverIcon, 'AI Cover'),
    [createTabOptions],
  );

  return (
    <Tab.Navigator
      screenOptions={baseScreenOptions}
      backBehavior="initialRoute">
      <Tab.Screen
        name="Create"
        component={AIGenerator}
        options={createOptions}
      />
      <Tab.Screen
        name="Discover"
        component={Home}
        options={discoverTabOptions}
      />
      <Tab.Screen
        name="AI Cover"
        component={CoverCreationScreen}
        options={aiCoverOptions}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={libraryTabOptions}
      />
    </Tab.Navigator>
  );
};

// Optimize styles with StyleSheet.create for better performance
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

export default React.memo(HomeStackNavigator);
