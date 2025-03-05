import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 10,
    justifyContent: 'center'
  },
  wrapperWithoutCenter: {
    flex: 1,
    margin: 10
  },
  container: {
    flex: 1
  },
  paddingTop10: {
    paddingTop: 8
  },
  royaltyProjectionContainer: { marginHorizontal: 10, marginTop: 15 },
  royaltyProjectionTopItems: { justifyContent: 'space-between' },
  projectedRoyaltyEarning: {
    marginVertical: 20
  },
  graphLabelContainer: {
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 5,
    borderWdith: 1,
    backgroundColor: 'lightgray'
  },
  graphSelectedLabel: {
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#000'
  },
  graphContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    margin: 10,
    padding: 16,
    borderColor: '#DADADA',
    borderWidth: 1
  }
})
export default styles
