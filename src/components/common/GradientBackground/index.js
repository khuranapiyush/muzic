import {SCREEN_HEIGHT, SCREEN_WIDTH} from '@gorhom/bottom-sheet';
import React from 'react';
import {Platform} from 'react-native';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({
  children,
  style,
  colors,
  locations,
  start,
  end,
}) => {
  const defaultColors = colors || [
    '#000000',
    '#101010',
    '#FF7E85',
    '#FD753F',
    '#101010',
    '#000000',
  ];
  const defaultLocations = locations || [0, 0.2, 0.4, 0.55, 0.75, 1];
  const defaultStart = start || {x: 0, y: 1};
  const defaultEnd = end || {x: 1, y: 0};

  return (
    <View style={styles.gradientOverlay}>
      <LinearGradient
        colors={defaultColors}
        locations={defaultLocations}
        start={defaultStart}
        end={defaultEnd}
        style={[styles.gradient, style]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.75,
  },
  gradientOverlay: {
    flex: 1,
  },
});

export default GradientBackground;
