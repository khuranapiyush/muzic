import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  wrapper: {},
  input: {
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 12,
    fontSize: 14,
    padding: 15,
    backgroundColor: '#FFF'
  },
  arrowIcon: {
    alignSelf: 'flex-end',
    width: 20,
    height: 30,
    paddingLeft: 10
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputContainer: {
    justifyContent: 'space-between'
  },

  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipsContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    width: '100%'
  },
  chip: {
    backgroundColor: '#F4F6FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    margin: 4
  },
  textInput: {
    padding: 6,
    fontSize: 16
  },
  chipsLabel: {
    color: 'red',
    fontSize: 14
  }
})
