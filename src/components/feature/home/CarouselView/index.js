import React, { useCallback } from 'react';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { screenWidth } from '../../../../utils/common';
import CView from '../../../common/core/View';
import getStyles from './style';
import { useTheme } from '@react-navigation/native';

const CarouselView = ({
  data,
  renderComponent,
  autoplay = false,
  loop = false,
  sliderWidth = screenWidth,
  itemWidth = screenWidth,
  autoplayInterval = 3000,
  autoplayDelay = 5000,
}) => {
  const [index, setIndex] = React.useState(0);
  const isCarousel = React.useRef(null);

  const { mode } = useTheme();
  const styles = getStyles(mode);

  const handleSnapItem = useCallback(idx => {
    setIndex(idx);
  }, []);

  return (
    <CView>
      <Carousel
        ref={isCarousel}
        data={data}
        renderItem={renderComponent}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        onSnapToItem={handleSnapItem}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
        autoplay={autoplay}
        autoplayDelay={autoplayDelay}
        autoplayInterval={autoplayInterval}
        loop={loop}
        activeDotColor="red"
      />

      <Pagination
        dotsLength={data?.length}
        activeDotIndex={index}
        carouselRef={isCarousel}
        containerStyle={styles.dotContainer}
        dotStyle={styles.dotStyle}
        inactiveDotStyle={styles.inactiveDotStyle}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.8}
      />
    </CView>
  );
};

export default CarouselView;
