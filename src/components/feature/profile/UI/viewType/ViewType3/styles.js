import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 14,
  },
  leftWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  leftIconWrapper: {
    alignSelf: 'flex-start',
  },
  leftIcon: { width: 24, height: 24, marginRight: 8 },
  labelText: {
    fontSize: 16,
    color: '#0B091C',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 12,
  },
  valueWrapper: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionBtnWrapper: {
    marginLeft: 8,
  },
  actionIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
});
export default styles;
