import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { View, StyleSheet, Button, Text } from 'react-native'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler
} from 'react-native-exception-handler'

setJSExceptionHandler((error, isFatal) => {
  console.log('error in setJSExceptionHandler====>:', error)
})

const exceptionHandler = exceptionString => {
  console.log('error in : setNativeExceptionHandler==>', exceptionString)
  // your exception handler code here
}
setNativeExceptionHandler(exceptionHandler, true, true)

const myErrorHandler = error => {
  console.log('error in myErrorHandler ====>:', error)
}

function ErrorFallback({ resetErrorBoundary }) {
  return (
    <View style={[styles.container]}>
      <View>
        <Text> Something went wrong: </Text>
        <Button title="try Again" onPress={resetErrorBoundary} />
      </View>
    </View>
  )
}

export const ErrorHandler = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
    {children}
  </ErrorBoundary>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    alignContent: 'center',
    paddingHorizontal: 12
  }
})
