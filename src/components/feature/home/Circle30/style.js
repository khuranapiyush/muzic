import { StyleSheet } from 'react-native'
import { screenWidth } from '../../../../utils/common'

const SLIDER_WIDTH = Math.round(screenWidth * 0.95)

const styles = StyleSheet.create({
  cardContent: {
    backgroundColor: '#E14084',
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 4
  },
  viewContainer: {
    paddingTop: 5
  },
  container: {
    paddingHorizontal: 10
  },
  sectionTitleStyle: {
    paddingBottom: 10
  },
  NewCardBody: {
    width: SLIDER_WIDTH * 0.25,
    marginRight: 10
  },
  Card30Container: {
    flexDirection: 'row',
    display: 'flex'
  },
  image: {
    height: SLIDER_WIDTH * 0.25,
    width: SLIDER_WIDTH * 0.25,
    borderRadius: 100,
    display: 'flex',
    backgroundColor: 'red'
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

  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  txtColor: {
    color: '#979797'
  }
})
export default styles
