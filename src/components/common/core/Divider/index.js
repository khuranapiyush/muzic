import React from 'react'
import { View, StyleSheet } from 'react-native'

const Divider = ({ customStyle = {} }) => {
  return <View style={[styles.lineStyle, customStyle]} />
}

export default Divider

const styles = StyleSheet.create({
  lineStyle: {
    borderWidth: 3,
    borderColor: '#DBDBDE',
    marginTop: 16,
    marginBottom: 16
  }
})
