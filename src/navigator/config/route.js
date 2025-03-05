import ROUTE_NAME from './routeName';
import React from 'react';
import CText from '../../components/common/core/Text';
import HomeStackNavigator from '../HomeStackNavigator';
import RootStackNavigator from '../RootStackNavigator';
import GenerateAIScreen from '../../screens/AIGenerator/AIGenerator.screen';
import VoiceRecordScreen from '../../screens/VoiceRecordScreen';
import SubscriptionScreen from '../../screens/subscriptionScreen/subscription.screen';

export const mainAppRoutes = [
  {name: ROUTE_NAME.HomeStack, component: HomeStackNavigator},
];

export const appStackRoutes = [
  {
    name: ROUTE_NAME.RootStack,
    component: RootStackNavigator,
    options: {
      headerShown: false,
    },
    key: ROUTE_NAME.RootStack,
  },
  {
    name: ROUTE_NAME.AIGenerator,
    component: GenerateAIScreen,
    key: ROUTE_NAME.AIGenerator,
    options: {
      headerShown: false,
      headerTitle: props => {
        const title = props?.route?.params?.title || 'ComposerAI';
        return <CText size="bricolageHeading" style={{flex: 1}} text={title} />;
      },
    },
  },
  {
    name: ROUTE_NAME.VoiceRecord,
    component: VoiceRecordScreen,
    key: ROUTE_NAME.AIHistory,
    options: {
      headerShown: false,
    },
  },
  {
    name: ROUTE_NAME.SubscriptionScreen,
    component: SubscriptionScreen,
    key: ROUTE_NAME.SubscriptionScreen,
    options: {
      headerShown: false,
    },
  },
];
