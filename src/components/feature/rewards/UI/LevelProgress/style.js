import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'red',
    height: 100,
  },
  gradientContainer: { justifyContent: 'space-between' },
  levelLeftWrapper: {
    paddingLeft: 22,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  levelText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
    marginBottom: 2,
  },
  levelIcon: { width: 28, height: 28 },
  levelRightWrapper: {
    paddingRight: 22,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  progressWrapper: { marginTop: 10 },
  progressText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 10,
  },
  btnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#050024',
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingVertical: 5,
    paddingLeft: 12,
    paddingRight: 12,
    borderTopLeftRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
    marginRight: 4,
  },
  backIcon: { tintColor: '#fff', width: 16, height: 16 },
});
export default styles;
