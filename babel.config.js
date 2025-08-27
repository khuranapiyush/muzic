module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        relativeSourceLocation: true,
        // Add these options to prevent C++ crashes
        globals: ['__scanCppObjects'],
        processNestedWorklets: true,
      },
    ],
  ],
};
