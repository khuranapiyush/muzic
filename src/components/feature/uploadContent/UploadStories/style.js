import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  itemStyle: {
    marginRight: 15,
    width: '100%',
    height: '100%',
    // resizeMode: 'contain'
  },
  labelStyle: { alignSelf: 'center' },
  templateContainer: {
    // flex: 1
  },
});

export default styles;
