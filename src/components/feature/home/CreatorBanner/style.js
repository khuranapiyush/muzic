import { StyleSheet } from 'react-native';

import { screenWidth } from '../../../../utils/common';

const ITEM_WIDTH = Math.round(screenWidth);

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    width: ITEM_WIDTH,
  },
  image: {
    height: 200,
    width: 100,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  joinButtonContainer: {
    position: 'absolute',
    bottom: 12,
    right: 35,
  },
  closeButtonStyle: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  submitBtn: {
    fontWeight: '700',
    color: '#000',
    fontSize: 16,
    paddingHorizontal: 12,
  },
});
export default styles;
