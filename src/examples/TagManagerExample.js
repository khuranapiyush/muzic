import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import tagManager from '../utils/tagManager';

/**
 * Example component demonstrating Google Tag Manager integration
 */
const TagManagerExample = () => {
  const [eventName, setEventName] = useState('button_click');
  const [eventParam, setEventParam] = useState('test_button');
  const [eventValue, setEventValue] = useState('clicked');
  const [logs, setLogs] = useState([]);
  const [includeUserData, setIncludeUserData] = useState(false);

  // Helper to add logs
  const addLog = message => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
  };

  // Track a simple event
  const trackSimpleEvent = async () => {
    try {
      await tagManager.pushEvent(eventName, {button: eventParam});
      addLog(`✅ Event tracked: ${eventName} with param: ${eventParam}`);
    } catch (error) {
      addLog(`❌ Error tracking event: ${error.message}`);
    }
  };

  // Track a custom event with parameters
  const trackCustomEvent = async () => {
    try {
      const params = {
        [eventParam]: eventValue,
        timestamp: new Date().toISOString(),
      };

      // Add user data if enabled
      if (includeUserData) {
        params.user_type = 'tester';
        params.test_device = true;
      }

      await tagManager.pushEvent(eventName, params);
      addLog(
        `✅ Custom event tracked: ${eventName} with params: ${JSON.stringify(
          params,
        )}`,
      );
    } catch (error) {
      addLog(`❌ Error tracking custom event: ${error.message}`);
    }
  };

  // Set a user property
  const setUserProp = async () => {
    try {
      await tagManager.setUserProperty(eventParam, eventValue);
      addLog(`✅ User property set: ${eventParam} = ${eventValue}`);
    } catch (error) {
      addLog(`❌ Error setting user property: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Tag Manager Example</Text>

      <View style={styles.inputContainer}>
        <Text>Event Name:</Text>
        <TextInput
          style={styles.input}
          value={eventName}
          onChangeText={setEventName}
          placeholder="Enter event name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Param Name:</Text>
        <TextInput
          style={styles.input}
          value={eventParam}
          onChangeText={setEventParam}
          placeholder="Enter parameter name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text>Param Value:</Text>
        <TextInput
          style={styles.input}
          value={eventValue}
          onChangeText={setEventValue}
          placeholder="Enter parameter value"
        />
      </View>

      <View style={styles.switchContainer}>
        <Text>Include User Data:</Text>
        <Switch value={includeUserData} onValueChange={setIncludeUserData} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={trackSimpleEvent}>
          <Text style={styles.buttonText}>Track Simple Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={trackCustomEvent}>
          <Text style={styles.buttonText}>Track Custom Event</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={setUserProp}>
          <Text style={styles.buttonText}>Set User Property</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.logTitle}>Event Logs:</Text>
      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
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
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default TagManagerExample;
