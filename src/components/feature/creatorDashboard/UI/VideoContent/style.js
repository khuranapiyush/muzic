import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 10,
    paddingHorizontal: 10
  },
  levelContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderColor: '#DADADA',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'space-between'
  },
  itemLabelStyle: {
    fontWeight: '500',
    fontStyle: 'normal',
    fontSize: 14,
    lineHeight: 22
  },
  iconStyle: {
    marginLeft: 15,
    height: 18,
    width: 18
  },
  channelWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'space-evenly'
  },
  textColor: {
    color: '#959595',
    fontWeight: '500',
    fontSize: 12
  },
  coinIcon: {
    height: 20,
    width: 20
  }
})

export default styles
