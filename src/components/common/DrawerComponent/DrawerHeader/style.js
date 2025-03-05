import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 10 },
  container: { alignItems: 'center' },
  contentContainer: { justifyContent: 'center', marginLeft: 10 },
  submitBtn: {
    buttonTextStyles: { fontSize: 16, fontWeight: '600' }
  },
  userStyle: { marginBottom: 5 },
  closeButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  closeButtonStyle: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  badgeStyle: {
    position: 'absolute',
    right: -5,
    top: -5,
    height: 25,
    width: 25
  }
})

export default styles
