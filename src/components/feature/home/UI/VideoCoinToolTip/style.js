import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  mainBtnContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
    paddingVertical: 4,
    paddingRight: 6,
    paddingLeft: 8,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#C1C1C1CC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIcon: { width: 24, height: 24, marginRight: 4 },
  coinText: { fontWeight: '500', fontSize: 14, marginRight: 2 },
  infoIcon: { width: 16, height: 16 },
  popoverBtnContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 3,
    paddingVertical: 4,
    paddingRight: 8,
    paddingLeft: 6,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});
export default styles;
