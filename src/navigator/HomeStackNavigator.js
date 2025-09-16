
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useMemo, useCallback} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import CustomHeader from '../components/common/Header';
import appImages from '../resource/images';

// Import screens directly instead of using lazy loading
import Home from '../screens/Home/Home.screen';
import AIGenerator from '../components/feature/aiAgent/AIGenerator/AIGenerator';
import CoverCreationScreen from '../components/feature/aiAgent/AIGenerator/AiCover';
import LibraryScreen from '../components/feature/library';
import LinearGradient from 'react-native-linear-gradient';

const Tab = createBottomTabNavigator();

const ICON_TINT_COLORS = {
  active: '#FFF',
  inactive: '#A5A5A5',
};

const TabIcon = React.memo(
  ({iconSource, focused}) => (
    <LinearGradient
      colors={focused ? ['#FF6F02', '#FF7E85'] : ['#121212', '#121212']}
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
    </LinearGradient>
  ),
  (prevProps, nextProps) =>
    prevProps.iconSource === nextProps.iconSource &&
    prevProps.focused === nextProps.focused,
);

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

const hiddenTabBarStyle = {display: 'none'};

const HomeStackNavigator = () => {
  const {isFullScreen: isPlayerFullScreen} = useSelector(state => state.player);

  const baseScreenOptions = useMemo(
    () => ({
      tabBarStyle: {
        display: 'flex',
        paddingTop: 30,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderTopWidth: 1,
        borderColor: '#2A2A2A',
        backgroundColor: '#1E1E1E',
        height: 120,
        paddingBottom: 30,
        elevation: 0,
        shadowOpacity: 1,
      },
      headerShown: false,
      header: props => <CustomHeader {...props} />,
      tabBarActiveTintColor: '#FFD5A9',
      tabBarInactiveTintColor: '#A5A5A5',
      lazy: true,
      detachInactiveScreens: true,
      tabBarHideOnKeyboard: true,
      tabBarButton: props => (
        <TouchableOpacity {...props} activeOpacity={1} style={props.style} />
      ),
      ...(Platform.OS === 'android' && {
        animationEnabled: false,
      }),
    }),
    [],
  );

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

  const playerDependentOptions = useMemo(
    () => ({
      headerShown: !isPlayerFullScreen,
      tabBarStyle: isPlayerFullScreen
        ? hiddenTabBarStyle
        : baseScreenOptions.tabBarStyle,
    }),
    [isPlayerFullScreen, baseScreenOptions.tabBarStyle],
  );

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

  const createOptions = useMemo(
    () => createTabOptions(appImages.createIcon, 'Create'),
    [createTabOptions],
  );

  const aiCoverOptions = useMemo(
    () => createTabOptions(appImages.aiCoverIcon, 'Cover Song'),
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
        name="Cover Song"
        component={CoverCreationScreen}
        options={aiCoverOptions}
      />
      <Tab.Screen
        name="Discover"
        component={Home}
        options={discoverTabOptions}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={libraryTabOptions}
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
    borderRadius: 58,
  },
  unfocusedIcon: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#121212',
  },
  iconImage: {
    width: 20,
    height: 20,
    marginLeft: -2,
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
