import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentWrapper: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  slotContainer: {
    flexDirection: 'row',
    height: 200 - 60,
    width: 300 - 24,
    position: 'absolute',
    bottom: 50,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  slotBoxGradientWrapper: {
    flex: 1
  },
  slotBoxWrapper: {
    backgroundColor: '#fff',
    margin: 8,
    flex: 1,
    overflow: 'hidden'
  },
  playBtnWrapper: {
    position: 'absolute',
    bottom: -20
  },
  playBtn: {
    backgroundColor: 'red',
    height: '100%',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 100
  },
  playText: { fontWeight: '600', fontSize: 15 }
})

export default styles
