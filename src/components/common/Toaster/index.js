import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Toast, {
  ErrorToast,
  InfoToast,
  SuccessToast
} from 'react-native-toast-message'

const defaultConfig = {
  visibilityTime: 4000,
  autoHide: true,
  bottomOffset: 100,
  position: 'bottom',
  keyboardOffset: 100,
  text2NumberOfLines: 2
}

const Toaster = ({ config }) => {
  const [toasterProps, setToasterProps] = useState(() => ({
    ...defaultConfig,
    ...config
  }))

  const toastConfig = {
    success: props => (
      <SuccessToast
        {...props}
        style={styles.successContainer}
        contentContainerStyle={styles.contentContainerStyle}
        text1Style={styles.successText1Style}
        text2Style={styles.successText2Style}
        text2NumberOfLines={2}
      />
    ),
    error: props => (
      <ErrorToast
        {...props}
        contentContainerStyle={styles.contentContainerStyle}
        style={styles.errorContainer}
        text1Style={styles.errorText1Style}
        text2Style={styles.errorText2Style}
        text2NumberOfLines={2}
      />
    ),
    info: props => (
      <InfoToast
        {...props}
        contentContainerStyle={styles.contentContainerStyle}
        style={styles.infoContainer}
        text1Style={styles.infoText1Style}
        text2Style={styles.infoText2Style}
        text2NumberOfLines={2}
      />
    ),
    custom: ({ text1, props }) => (
      <View>
        <Text>{text1}</Text>
      </View>
    )
  }
  return <Toast config={toastConfig} {...toasterProps} />
}

const styles = StyleSheet.create({
  contentContainerStyle: {
    paddingHorizontal: 1
  },
  successContainer: {
    borderLeftColor: 'green',
    paddingHorizontal: 10,
    height: 70
  },
  successText1Style: {
    fontSize: 17,
    fontWeight: '400',
    color: 'green',
    paddingBottom: 3
  },
  successText2Style: {
    fontSize: 15,
    color: 'black'
  },

  errorContainer: {
    borderLeftColor: 'red',
    paddingHorizontal: 10,
    height: 70
  },
  errorText1Style: {
    fontSize: 17,
    fontWeight: '400',
    paddingBottom: 3,
    color: 'red'
  },
  errorText2Style: {
    fontSize: 15,
    color: 'black'
  },

  infoContainer: {
    borderLeftColor: '#FCA510',
    paddingHorizontal: 10,
    height: 70
  },
  infoText1Style: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FCA510'
  },
  infoText2Style: {
    fontSize: 15,
    color: 'black'
  }
})

export default Toaster
