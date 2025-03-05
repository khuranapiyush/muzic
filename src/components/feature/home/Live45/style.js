import { StyleSheet } from 'react-native'
import { screenWidth } from '../../../../utils/common'

const SLIDER_WIDTH = Math.round(screenWidth * 0.95)

const styles = StyleSheet.create({
  cardContent: {
    width: '100%',
    position: 'absolute',
    height: '50%',
    justifyContent: 'flex-end',
    bottom: -1,
    padding: 8
  },
  topCardContent: {
    width: '100%',
    position: 'absolute',
    justifyContent: 'space-between',
    top: -5,
    padding: 8
  },
  liveTagContainer: {
    backgroundColor: '#E14084',
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4
  },

  joinTagContainer: {
    backgroundColor: '#000',
    opacity: 0.33,
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },

  viewContainer: {
    paddingTop: 5,
    alignSelf: 'flex-start'
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4
  },

  sectionTitleStyle: {
    flexDirection: 'row',
    display: 'flex',
    paddingBottom: 10,
    paddingHorizontal: 10
  },
  sectionIcon: {
    height: 24,
    width: 24,
    marginRight: 8
  },
  NewCardBody: {
    width: SLIDER_WIDTH * 0.486
  },
  Card30Container: {
    // flexWrap: 'wrap'
    // flexDirection: 'column'
    // display: 'flex'
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
