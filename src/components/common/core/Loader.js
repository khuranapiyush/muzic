import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import CText from './Text';

const Loader = ({message = 'Loading...'}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F4A460" />
      <CText style={styles.message}>{message}</CText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  message: {
    marginTop: 16,
    color: '#F4A460',
    fontSize: 16,
  },
});

export default Loader;
