import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  artistImage: {
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    width: 24,
  },
  artistName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
    marginLeft: 8,
  },

  channelWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'space-evenly',
  },
  rightIconContainer: { flex: 1, alignItems: 'flex-end' },

  shareContainer: {
    borderColor: '#2D3440',
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
  shareIconStyle: { width: 24, height: 24, tintColor: '#000' },
  titleWrapper: {
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 10,
  },
});
export default styles;
