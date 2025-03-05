import { StyleSheet } from 'react-native'
import { screenWidth, screenHeight } from '../../../../../utils/common'

const styles = StyleSheet.create({
  wrapper: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  muteIcon: {
    fontSize: 20,
    color: 'white',
    position: 'absolute',
    backgroundColor: 'rgba(52,52,52,0.6)',
    borderRadius: 100,
    padding: 20
  },
  bottomLeftItemContainer: {
    heigh: '40%',
    flex: 1,
    position: 'absolute',
    width: screenWidth,
    zIndex: 1,
    bottom: 0
  },
  rightSideItemContainer: {
    maxWidth: '15%',
    alignItems: 'center'
  },
  leftSideItemContainer: {
    maxWidth: '85%'
  },
  alignItemsCenter: {
    alignItems: 'center'
  },
  leftSideItems: {
    alignItems: 'baseline'
  },
  thumbIconStyle: {
    borderColor: 'white',
    margin: 10,
    width: 30,
    height: 30,
    borderWidth: 1,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  profileIcon: {
    backgroundColor: 'white',
    resizeMode: 'cover',
    width: 32,
    height: 32,
    borderRadius: 100,
    margin: 10
  },
  iconStyle: {
    height: 25,
    width: 25
  },
  padding10: {
    padding: 10
  },
  paddingInline10: {
    paddingHorizontal: 10
  },
  margin10: {
    margin: 10
  },
  videoStyle: {
    width: '100%',
    height: '100%'
  },

  followContainer: {
    borderColor: '#fff'
  },
  follow: {
    color: '#FFF'
  },
  shareContainer: { marginLeft: 8 },
  btnContainer: {
    borderColor: 'transparent',
    marginLeft: 0,
    marginRight: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 0,
    marginBottom: 10,
    flexDirection: 'column'
  },
  btnIcon: {
    height: 25,
    width: 25,
    marginRight: 4,
    tintColor: '#FFF',
    alignSelf: 'center'
  },
  trackStyle: {
    height: 1.5
  }
})
export default styles
