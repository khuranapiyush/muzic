import React, {useState} from 'react';
import {View, Button, Text, ScrollView, StyleSheet, Alert} from 'react-native';
import {isDebugEnabled} from '../../../constants/productionConfig';
import branch, {BranchEvent} from 'react-native-branch';
import {MoEReactNative} from 'moengage-react-native';
import moEngageService from '../../../services/moengageService';
import {
  trackBranchEvent,
  trackBranchPurchase,
} from '../../../utils/branchUtils';
import {
  testBranchPurchaseTracking,
  testBranchPurchaseVariations,
  debugBranchPurchaseStructure,
} from '../../../utils/branchPurchaseTest';
import {
  validateBranchSetup,
  testAllBranchPurchaseTypes,
  debugBranchConfiguration,
} from '../../../utils/branchValidation';
import {
  testAllBranchEvents,
  testBranchEventDataTypes,
  testBranchEventTiming,
} from '../../../utils/branchEventTest';
import {
  testPushNotification,
  debugPushNotificationSetup,
} from '../../../utils/pushNotificationHandler';

const AnalyticsDebug = () => {
  const [logs, setLogs] = useState([]);

  // Disable debug screen in production
  if (!isDebugEnabled()) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Debug Screen Disabled</Text>
        <Text style={styles.disabledText}>
          Debug features are disabled in production builds.
        </Text>
      </View>
    );
  }

  const addLog = message => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const initMoEngage = async () => {
    try {
      addLog('🔄 Initializing MoEngage...');
      MoEReactNative.initialize('BUP4RKUJZXQL8R2J9N61ZKEL');
      MoEReactNative.enableSDKLogs(true);
      addLog('✅ MoEngage initialized');
    } catch (error) {
      addLog(`❌ MoEngage init failed: ${error.message}`);
    }
  };

  const setMoEngageUser = async () => {
    try {
      addLog('🔄 Setting MoEngage user...');
      await MoEReactNative.setUserUniqueID('debugUser123');
      await MoEReactNative.setUserFirstName('Debug');
      await MoEReactNative.setUserLastName('User');
      addLog('✅ MoEngage user set');
    } catch (error) {
      addLog(`❌ MoEngage user set failed: ${error.message}`);
    }
  };

  const sendMoEngageEvent = async () => {
    try {
      addLog('🔄 Sending MoEngage event...');
      await MoEReactNative.trackEvent('Debug_Event', {
        from: 'RN',
        ts: Date.now(),
        test: true,
      });
      await MoEReactNative.flush();
      addLog('✅ MoEngage event sent and flushed');
    } catch (error) {
      addLog(`❌ MoEngage event failed: ${error.message}`);
    }
  };

  const sendBranchEvents = async () => {
    try {
      addLog('🔄 Sending Branch events...');

      // Standard purchase event (correct param position + customData)
      await new BranchEvent(BranchEvent.Purchase, null, {
        revenue: 1.99,
        currency: 'INR',
        customData: {source: String('debug'), ts: String(Date.now())},
      }).logEvent();
      addLog('✅ Branch Purchase event sent');

      // Custom event (correct param position + customData)
      await new BranchEvent('custom_debug_event', null, {
        customData: {foo: 'bar', ts: String(Date.now()), test: String(true)},
      }).logEvent();
      addLog('✅ Branch custom event sent');
    } catch (error) {
      addLog(`❌ Branch events failed: ${error.message}`);
    }
  };

  const testBranchUtils = async () => {
    try {
      addLog('🔄 Testing Branch utils...');

      // Test purchase tracking
      const purchaseSuccess = await trackBranchPurchase({
        revenue: 2.99,
        currency: 'INR',
        product_id: 'debug_product',
        transaction_id: `tx_${Date.now()}`,
      });
      addLog(
        purchaseSuccess
          ? '✅ Branch utils purchase tracked'
          : '❌ Branch utils purchase failed',
      );

      // Test custom event
      const eventSuccess = await trackBranchEvent('debug_utils_event', {
        source: 'utils',
        timestamp: Date.now(),
      });
      addLog(
        eventSuccess
          ? '✅ Branch utils event tracked'
          : '❌ Branch utils event failed',
      );
    } catch (error) {
      addLog(`❌ Branch utils test failed: ${error.message}`);
    }
  };

  const testMoEngageService = async () => {
    try {
      addLog('🔄 Testing MoEngage service...');

      // Test service initialization
      const initSuccess = moEngageService.initialize();
      addLog(
        initSuccess
          ? '✅ MoEngage service initialized'
          : '❌ MoEngage service init failed',
      );

      // Test event tracking
      const eventSuccess = moEngageService.trackEvent('Debug_Service_Event', {
        source: 'service',
        timestamp: Date.now(),
      });
      addLog(
        eventSuccess
          ? '✅ MoEngage service event tracked'
          : '❌ MoEngage service event failed',
      );
    } catch (error) {
      addLog(`❌ MoEngage service test failed: ${error.message}`);
    }
  };

  const testBranchPurchase = async () => {
    try {
      addLog('🔄 Testing Branch purchase tracking...');
      const result = await testBranchPurchaseTracking();
      addLog(
        result
          ? '✅ Branch purchase test completed'
          : '❌ Branch purchase test failed',
      );
    } catch (error) {
      addLog(`❌ Branch purchase test error: ${error.message}`);
    }
  };

  const testBranchPurchaseVariations = async () => {
    try {
      addLog('🔄 Testing Branch purchase variations...');
      await testBranchPurchaseVariations();
      addLog('✅ Branch purchase variations test completed');
    } catch (error) {
      addLog(`❌ Branch purchase variations error: ${error.message}`);
    }
  };

  const debugBranchStructure = () => {
    try {
      addLog('🔄 Debugging Branch structure...');
      debugBranchPurchaseStructure();
      addLog('✅ Branch structure debug completed - check console');
    } catch (error) {
      addLog(`❌ Branch structure debug error: ${error.message}`);
    }
  };

  const validateBranch = async () => {
    try {
      addLog('🔄 Validating Branch setup...');
      const validation = await validateBranchSetup();
      addLog(
        `✅ Branch validation completed - ${validation.errors.length} errors, ${validation.warnings.length} warnings`,
      );
    } catch (error) {
      addLog(`❌ Branch validation error: ${error.message}`);
    }
  };

  const testAllPurchaseTypes = async () => {
    try {
      addLog('🔄 Testing all Branch purchase types...');
      await testAllBranchPurchaseTypes();
      addLog('✅ All Branch purchase types tested');
    } catch (error) {
      addLog(`❌ Branch purchase types test error: ${error.message}`);
    }
  };

  const debugBranchConfig = () => {
    try {
      addLog('🔄 Debugging Branch configuration...');
      debugBranchConfiguration();
      addLog('✅ Branch configuration debug completed - check console');
    } catch (error) {
      addLog(`❌ Branch configuration debug error: ${error.message}`);
    }
  };

  const testAllBranchEvents = async () => {
    try {
      addLog('🔄 Testing all Branch events...');
      const results = await testAllBranchEvents();
      addLog(
        `✅ All Branch events test completed - ${results.errors.length} errors`,
      );
    } catch (error) {
      addLog(`❌ All Branch events test error: ${error.message}`);
    }
  };

  const testPushNotifications = async () => {
    try {
      addLog('🔄 Testing push notifications...');
      const results = await testPushNotification();
      addLog(`✅ Push notification test completed: ${JSON.stringify(results)}`);
    } catch (error) {
      addLog(`❌ Push notification test error: ${error.message}`);
    }
  };

  const debugPushSetup = () => {
    try {
      addLog('🔄 Debugging push notification setup...');
      debugPushNotificationSetup();
      addLog('✅ Push notification debug completed');
    } catch (error) {
      addLog(`❌ Push notification debug error: ${error.message}`);
    }
  };

  const testBranchDataTypes = async () => {
    try {
      addLog('🔄 Testing Branch event data types...');
      await testBranchEventDataTypes();
      addLog('✅ Branch event data types test completed');
    } catch (error) {
      addLog(`❌ Branch event data types test error: ${error.message}`);
    }
  };

  const testBranchTiming = async () => {
    try {
      addLog('🔄 Testing Branch event timing...');
      await testBranchEventTiming();
      addLog('✅ Branch event timing test completed');
    } catch (error) {
      addLog(`❌ Branch event timing test error: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const showInstructions = () => {
    Alert.alert(
      'Debug Instructions',
      "1. Check Branch dashboard in TEST mode\n2. Check MoEngage dashboard with DC-4\n3. Look for events in Liveview/Event Stream\n4. Ensure you're on the correct environment",
      [{text: 'OK'}],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics Debug Screen</Text>

      <View style={styles.buttonContainer}>
        <Button title="Init MoEngage" onPress={initMoEngage} />
        <Button title="Set MoE User" onPress={setMoEngageUser} />
        <Button title="Send MoE Event" onPress={sendMoEngageEvent} />
        <Button title="Send Branch Events" onPress={sendBranchEvents} />
        <Button title="Test Branch Utils" onPress={testBranchUtils} />
        <Button
          title="Test Branch Purchase"
          onPress={testBranchPurchase}
          color="green"
        />
        <Button
          title="Test Purchase Variations"
          onPress={testBranchPurchaseVariations}
          color="green"
        />
        <Button
          title="Debug Branch Structure"
          onPress={debugBranchStructure}
          color="purple"
        />
        <Button
          title="Validate Branch Setup"
          onPress={validateBranch}
          color="red"
        />
        <Button
          title="Test All Purchase Types"
          onPress={testAllPurchaseTypes}
          color="green"
        />
        <Button
          title="Debug Branch Config"
          onPress={debugBranchConfig}
          color="purple"
        />
        <Button
          title="Test All Branch Events"
          onPress={testAllBranchEvents}
          color="red"
        />
        <Button
          title="Test Branch Data Types"
          onPress={testBranchDataTypes}
          color="green"
        />
        <Button
          title="Test Branch Timing"
          onPress={testBranchTiming}
          color="blue"
        />
        <Button
          title="Test Push Notifications"
          onPress={testPushNotifications}
          color="red"
        />
        <Button
          title="Debug Push Setup"
          onPress={debugPushSetup}
          color="brown"
        />
        <Button title="Test MoE Service" onPress={testMoEngageService} />
        <Button title="Clear Logs" onPress={clearLogs} color="orange" />
        <Button title="Instructions" onPress={showInstructions} color="blue" />
      </View>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Debug Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 16,
  },
  logContainer: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    minHeight: 200,
  },
  logTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logText: {
    color: '#0f0',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  disabledText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AnalyticsDebug;
