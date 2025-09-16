import { StyleSheet } from 'react-native';

import { screenWidth } from '../../../../utils/common';

const ITEM_WIDTH = Math.round(screenWidth);

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    width: ITEM_WIDTH,
  },
  image: {
    aspectRatio: 16 / 9,
    width: ITEM_WIDTH,
  },
});
export default styles;
