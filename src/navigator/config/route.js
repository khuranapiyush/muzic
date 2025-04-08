import ROUTE_NAME from './routeName';
import React, {Suspense} from 'react';
import CText from '../../components/common/core/Text';
import {ActivityIndicator, View} from 'react-native';

// Lazy load screens
const HomeStackNavigator = React.lazy(() => import('../HomeStackNavigator'));
const RootStackNavigator = React.lazy(() => import('../RootStackNavigator'));
const GenerateAIScreen = React.lazy(() =>
  import('../../screens/AIGenerator/AIGenerator.screen'),
);
const VoiceRecordScreen = React.lazy(() =>
  import('../../screens/VoiceRecordScreen'),
);
const SubscriptionScreen = React.lazy(() =>
  import('../../screens/subscriptionScreen/subscription.screen'),
);
const AuthStackNavigator = React.lazy(() => import('../AuthStackNavigator'));

// Loading component for Suspense
const LoadingComponent = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    }}>
    <ActivityIndicator size="large" color="#FE954A" />
  </View>
);

// Wrapper component to handle lazy loading
const withSuspense = Component => props =>
  (
    <Suspense fallback={<LoadingComponent />}>
      <Component {...props} />
    </Suspense>
  );

// Memoize the header title component
const HeaderTitle = React.memo(({title}) => (
  <CText
    size="bricolageHeading"
    style={{flex: 1, marginTop: 20}}
    text={title}
  />
));

export const mainAppRoutes = [
  {name: ROUTE_NAME.HomeStack, component: withSuspense(HomeStackNavigator)},
];

export const appStackRoutes = [
  {
    name: ROUTE_NAME.RootStack,
    component: withSuspense(RootStackNavigator),
    options: {
      headerShown: false,
    },
    key: ROUTE_NAME.RootStack,
  },
  {
    name: ROUTE_NAME.AIGenerator,
    component: withSuspense(GenerateAIScreen),
    key: ROUTE_NAME.AIGenerator,
    options: {
      headerShown: false,
      headerTitle: () => <HeaderTitle title="Generate Song" />,
    },
  },
  {
    name: ROUTE_NAME.VoiceRecord,
    component: withSuspense(VoiceRecordScreen),
    key: ROUTE_NAME.AIHistory,
    options: {
      headerShown: false,
    },
  },
  {
    name: ROUTE_NAME.SubscriptionScreen,
    component: withSuspense(SubscriptionScreen),
    key: ROUTE_NAME.SubscriptionScreen,
    options: {
      headerShown: false,
    },
  },
  {
    name: ROUTE_NAME.AuthStack,
    component: withSuspense(AuthStackNavigator),
    key: ROUTE_NAME.AuthStack,
    options: {
      headerShown: false,
    },
  },
];
