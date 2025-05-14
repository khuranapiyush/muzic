import React, {useEffect} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {
  getAnalytics,
  logEvent,
  logPurchase,
} from '@react-native-firebase/analytics';
import analyticsUtils from '../utils/analytics';
import facebookEvents from '../utils/facebookEvents';

const AnalyticsExample = ({navigation}) => {
  // Track screen view when component mounts
  useEffect(() => {
    const trackScreen = async () => {
      // Method 1: Using our utility function
      await analyticsUtils.trackScreenView('AnalyticsExample');

      // Method 2: Direct Firebase call
      await logEvent(getAnalytics(), 'screen_view', {
        screen_name: 'AnalyticsExample',
        screen_class: 'AnalyticsExample',
      });
    };

    trackScreen();
  }, []);

  // Example button click handler with analytics
  const handleSubscribeClick = async () => {
    // Method 1: Using our utility function
    await analyticsUtils.trackButtonClick('Subscribe', {
      source: 'example_screen',
      user_type: 'free_user',
    });

    // Method 2: Direct Firebase call
    await logEvent(getAnalytics(), 'button_click', {
      button_name: 'Subscribe',
      source: 'example_screen',
    });

    // Facebook Events tracking
    facebookEvents.logCustomEvent('subscribe_click', {
      source: 'example_screen',
      user_type: 'free_user',
    });

    // Perform actual subscribe action here
    console.log('Subscribe button clicked');
  };

  // Example purchase tracking
  const handlePurchase = async () => {
    // Method 1: Using our utility function
    await analyticsUtils.trackPurchase(29.99, 'USD', {
      item_id: 'premium_subscription',
      item_name: 'Premium Subscription',
      item_category: 'subscription',
    });

    // Method 2: Direct Firebase call
    await logPurchase(getAnalytics(), {
      value: 29.99,
      currency: 'USD',
      items: [
        {
          item_id: 'premium_subscription',
          item_name: 'Premium Subscription',
        },
      ],
    });

    // Facebook Events purchase tracking
    facebookEvents.logPurchase(29.99, 'USD', 'premium_subscription');

    // Perform actual purchase action here
    console.log('Purchase completed');
  };

  // Example custom event
  const handleCustomAction = async () => {
    // Method 1: Using our utility function
    await analyticsUtils.trackCustomEvent('share_content', {
      content_type: 'song',
      content_id: '12345',
      method: 'whatsapp',
    });

    // Method 2: Direct Firebase call
    await logEvent(getAnalytics(), 'share_content', {
      content_type: 'song',
      content_id: '12345',
      method: 'whatsapp',
    });

    // Facebook Events custom event tracking
    facebookEvents.logCustomEvent('share_content', {
      content_type: 'song',
      content_id: '12345',
      method: 'whatsapp',
    });

    // Perform actual share action here
    console.log('Content shared');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Analytics Example</Text>

      <View style={styles.buttonContainer}>
        <Button title="Subscribe Now" onPress={handleSubscribeClick} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Purchase Premium ($29.99)" onPress={handlePurchase} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Share Content" onPress={handleCustomAction} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 10,
  },
});

export default AnalyticsExample;
