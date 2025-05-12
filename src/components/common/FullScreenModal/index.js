import React from 'react';
import {Platform, SafeAreaView, View} from 'react-native';
import Modal from 'react-native-modal';
import {screenHeight} from '../../../utils/common';
import styles from './style';

const FullScreenModal = ({
  isVisible,
  onClose,
  onBackdropPress,
  onBackButtonPress,
  children,
  animationIn = 'slideInUp',
  animationOut = 'slideOutDown',
  backdropOpacity = 0.5,
  avoidKeyboard = true,
  style,
  contentStyle,
}) => {
  // Determine if we're on Android
  const isAndroid = Platform.OS === 'android';

  return (
    <Modal
      useNativeDriver={true}
      isVisible={isVisible}
      onBackdropPress={onBackdropPress || onClose}
      onBackButtonPress={onBackButtonPress || onClose}
      swipeDirection={null}
      propagateSwipe
      style={[styles.modal, style]}
      animationIn={animationIn}
      animationOut={animationOut}
      backdropOpacity={backdropOpacity}
      avoidKeyboard={avoidKeyboard}
      // Android fix - set statusBarTranslucent to true for Android
      statusBarTranslucent={isAndroid}
      // Android fix - This helps remove the gap at the bottom on Android
      coverScreen={true}>
      {isAndroid ? (
        // On Android, don't use SafeAreaView for full screen modals
        <View style={[styles.fullScreenContainer, contentStyle]}>
          {children}
        </View>
      ) : (
        // On iOS, use SafeAreaView to respect the notch/home indicator
        <SafeAreaView
          style={[
            styles.fullScreenContainer,
            {height: screenHeight},
            contentStyle,
          ]}>
          {children}
        </SafeAreaView>
      )}
    </Modal>
  );
};

export default FullScreenModal;
