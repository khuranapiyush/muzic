import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    width: '100%'
  },
  contentWrapper: {
    marginTop: 33,
    marginBottom: 24,
    alignItems: 'center'
  },
  thumbsUpIcon: { width: 100, height: 100 },
  wohooText: {
    color: '#E94278',
    fontWeight: '600',
    fontSize: 18,
    marginTop: 10
  },
  titleText: {
    color: '#0B091C',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 16,
    paddingHorizontal: 30
  },
  descriptionText: {
    color: '#959595',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 15,
    marginBottom: 15,
    paddingHorizontal: 30
  },
  coinWrapper: {
    backgroundColor: '#d8d8d8',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15
  },
  coinIcon: { height: 24, width: 24, marginRight: 3 },
  coinValue: { fontWeight: '500', fontSize: 14, paddingRight: 2 }
})
export default styles
