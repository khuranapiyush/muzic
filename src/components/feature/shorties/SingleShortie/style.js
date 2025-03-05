import { StyleSheet } from 'react-native'
import { screenHeight, screenWidth } from '../../../../utils/common'

const styles = StyleSheet.create({
  wrapper: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  muteIconContainer: {
    fontSize: 25,
    borderRadius: 100,
    color: 'white',
    position: 'absolute',
    backgroundColor: 'rgba(52,52,52,0.6)',
    padding: 15
  },
  muteIcon: {
    fontSize: 25,
    color: 'white'
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
  }
})
export default styles
