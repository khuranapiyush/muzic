import React, { memo, useRef } from 'react';
import { Dimensions, FlatList, Image, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import { getAppConfig } from '../../../../constants/code';
import appImages from '../../../../resource/images';
import { setFullModePlayer } from '../../../../stores/slices/watch';
import { numberFormatter } from '../../../../utils/common';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import ProgressBar from '../../../common/ProgressBar';

export const SLIDER_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.95);

const Card30 = ({ data }) => {
  const dispatch = useDispatch();
  const cgRef = useRef();

  const handleCardClick = (item, index) => {
    const videoData = {
      ...item,
      meta: {
        pageId: getAppConfig('page', 'home'),
        eventName: 'click',
        order: index + 1,
        viewType: data.viewType,
        type: data?.items?.[0]?.type || 'video',
      },
    };
    dispatch(setFullModePlayer({ isVisible: true, videoDetail: videoData }));
  };

  const renderItem = ({ item, index }) => (
    <CView style={styles.Card30Container}>
      <Pressable
        style={styles.NewCardBody}
        onPress={() => handleCardClick(item, index)}>
        <CView>
          <Image
            source={{ uri: item?.background?.value }}
            style={styles.image}
          />
          <CView style={styles.playIconCenter}>
            <Image source={appImages.playIcon} />
          </CView>
          <CView style={styles.progressContainer}>
            <ProgressBar
              progress={item?.videoDropPercent}
              withPercent={false}
              height={4}
              borderRadius={4}
            />
          </CView>
        </CView>
        <CView style={styles.cardContent}>
          <CText size="extraSmall" numberOfLines={2} text={item?.title} />
          <CView style={styles.viewContainer}>
            <CText size="extraSmall" style={styles.txtColor}>
              {numberFormatter(item?.stats?.views)} views
            </CText>
          </CView>
        </CView>
      </Pressable>
    </CView>
  );
  return (
    <CView style={styles.container}>
      <CView style={styles.sectionTitleStyle}>
        <CText size="mediumBold">{data?.title}</CText>
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

export default memo(Card30);
