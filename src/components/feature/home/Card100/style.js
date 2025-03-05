import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    // paddingHorizontal: 10
  },
  artistImage: {
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    width: 24
  },
  artistName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
    marginLeft: 8
  },

  channelWrapper: {
    marginTop: 5
  },
  txtColor: {
    color: '#626262'
  },
  rightIconContainer: {
    marginLeft: 10,
    paddingLeft: 4,
    paddingTop: 4
  },

  shareContainer: {
    borderColor: '#FFF'
  },
  shareIconStyle: { width: 24, height: 24, tintColor: '#000' },
  titleWrapper: {
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10
  },
  liveBtnContainer: {
    backgroundColor: 'red',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    paddingVertical: 4,
    position: 'absolute',
    bottom: 0,
    zIndex: 3,
    marginLeft: 10,
    marginBottom: 10
  },
  channelImage: {
    width: 32,
    height: 32,
    borderRadius: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 5
  },
  flex1: { flex: 1 },
  flex8: { flex: 8 },
  dotStyle: {
    width: 10,
    height: 18
  },
  popoverContainer: {
    paddingLeft: 5,
    paddingRight: 20
  },
  popoverBg: {
    backgroundColor: 'transparent'
  }
})
export default styles
