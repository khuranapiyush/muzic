import {StyleSheet, Platform} from 'react-native';

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  fullScreenContainer: {
    flex: 1,
    // Ensure modal takes full height on Android without gaps
    ...(Platform.OS === 'android' && {
      // Remove any potential top/bottom margins
      marginTop: 0,
      marginBottom: 0,
    }),
  },
});

export default styles;
