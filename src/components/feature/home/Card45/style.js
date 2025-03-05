import { StyleSheet } from 'react-native'
import { screenWidth } from '../../../../utils/common'

const SLIDER_WIDTH = Math.round(screenWidth * 0.95)

const styles = StyleSheet.create({
  cardContent: {
    width: '100%',
    position: 'absolute',
    height: '50%',
    justifyContent: 'flex-end',
    bottom: 0,
    padding: 8
  },

  viewContainer: {
    paddingTop: 5
  },
  container: {
    paddingHorizontal: 10
  },
  sectionTitleStyle: {
    flexDirection: 'row',
    display: 'flex',
    paddingBottom: 10
  },
  sectionIcon: {
    height: 24,
    width: 24,
    marginRight: 8
  },
  NewCardBody: {
    width: SLIDER_WIDTH * 0.45,
    paddingRight: 10
  },
  Card30Container: {
    flexDirection: 'row',
    display: 'flex'
  },
  image: {
    height: SLIDER_WIDTH * 0.76,
    borderRadius: 5,
    display: 'flex'
  },
  playIconCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  txtColor: {
    // color: '#979797'
  }
})
export default styles
