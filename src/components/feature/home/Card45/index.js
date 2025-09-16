import { useNavigation, useTheme } from '@react-navigation/native';
import React, { memo, useRef } from 'react';
import { Dimensions, FlatList, Image, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { getAppConfig } from '../../../../constants/code';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import { setTrackData } from '../../../../stores/slices/shortiePlayer';
import { numberFormatter } from '../../../../utils/common';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import Colors from '../../../common/Colors';
import { setIsWatchPageVisible } from '../../../../stores/slices/watch';

export const SLIDER_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.95);

const Card45 = ({ data }) => {
  const dispatch = useDispatch();
  const cgRef = useRef();
  const navigation = useNavigation();

  const handleCardClick = (item, index) => {
    const videoData = {
      ...item,
      meta: {
        pageId: getAppConfig('page', 'home'),
        eventName: 'click',
        order: index + 1,
        viewType: '20',
        type: 'shorties',
      },
    };
    dispatch(setTrackData({ shortieDetail: videoData }));
    dispatch(setIsWatchPageVisible(false));
    navigation.navigate(ROUTE_NAME.Shorties, { data: item });
  };

  const renderItem = ({ item, index }) => (
    <CView style={styles.Card30Container}>
      <Pressable
        style={styles.NewCardBody}
        onPress={() => handleCardClick(item, index)}>
        <CView style={styles.shadow}>
          <Image
            source={{ uri: item?.background?.value }}
            style={styles.image}
          />
        </CView>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.8)']}
          style={styles.cardContent}>
          <CView>
            <CText
              size="smallBold"
              numberOfLines={3}
              color={'commonWhite'}
              text={item?.title}
            />
            <CView style={styles.viewContainer}>
              <CText
                size="smallBold"
                color={'commonWhite'}
                style={styles.txtColor}>
                {numberFormatter(item?.stats?.views)} views
              </CText>
            </CView>
          </CView>
        </LinearGradient>
      </Pressable>
    </CView>
  );
  return (
    <CView style={styles.container}>
      <CView style={styles.sectionTitleStyle}>
        {data?.titleIcon && (
          <Image source={{ uri: data?.titleIcon }} style={styles.sectionIcon} />
        )}
        <CText size="mediumBold">{data?.title} </CText>
      </CView>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={data.items}
        renderItem={renderItem}
        horizontal
        overScrollMode={'never'}
        ref={cgRef}
        extraData={data}
      />
    </CView>
  );
};

export default memo(Card45);
