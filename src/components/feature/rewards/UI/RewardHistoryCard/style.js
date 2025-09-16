import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    padding: 12,
  },
  rewardLogoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    padding: 8,
    backgroundColor: '#F4F6FA',
    borderRadius: 50,
  },
  rewardIcon: { width: 32, height: 32 },
  detailWrapper: { flex: 1, marginLeft: 14 },
  firstRowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  secondRowWrapper: { justifyContent: 'space-between' },
  itemHeader: { color: '#959595', fontWeight: '500', fontSize: 12 },
  itemValue: { color: '#0B091C', fontWeight: '500', fontSize: 14 },
  tncText: {
    color: '#E14084',
    fontWeight: '500',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
export default styles;
