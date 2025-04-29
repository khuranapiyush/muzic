import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AppTrackingPermission from '../../utils/AppTrackingPermission';

const TrackingPermissionModal = ({onRequestComplete}) => {
  const [visible, setVisible] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState(null);

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  const checkTrackingStatus = async () => {
    if (Platform.OS !== 'ios') {
      return;
    }

    const status = await AppTrackingPermission.getTrackingStatus();
    setTrackingStatus(status);

    // Only show modal if status is not determined yet
    if (status === 'not-determined') {
      setVisible(true);
    } else {
      // If already determined, inform parent component
      onRequestComplete && onRequestComplete(status);
    }
  };

  const handleRequestPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await AppTrackingPermission.requestTrackingPermission();
      setTrackingStatus(status);
      setVisible(false);
      onRequestComplete && onRequestComplete(status);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    onRequestComplete && onRequestComplete('denied');
  };

  if (Platform.OS !== 'ios' || !visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Personalize Your Experience</Text>
          <Text style={styles.description}>
            We use device identifiers to improve your experience, measure app
            performance, and deliver personalized content. This helps us provide
            a better service tailored to your preferences.
          </Text>
          <Text style={styles.note}>
            You can change this later in your device settings.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Not Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.allowButton]}
              onPress={handleRequestPermission}>
              <Text style={styles.allowButtonText}>Allow Tracking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  allowButton: {
    backgroundColor: '#3E7BFA',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TrackingPermissionModal;
