import { useNavigation } from '@react-navigation/native';
import React, { memo, useRef } from 'react';
import { Dimensions, FlatList, Image, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import ROUTE_NAME from '../../../../navigator/config/routeName';
import appImages from '../../../../resource/images';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';

export const SLIDER_WIDTH = Dimensions.get('window').width;
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.95);

const Circle30 = ({ data }) => {
  const dispatch = useDispatch();
  const cgRef = useRef();

  const navigation = useNavigation();

  const handleCardClick = (item, index) => {
    navigation.navigate(ROUTE_NAME.ConsumerInstaLive, {
      roomId: item?.roomId,
      data: item,
    });
  };

  const renderItem = ({ item, index }) => (
    <CView style={styles.Card30Container}>
      <Pressable
        style={styles.NewCardBody}
        onPress={() => handleCardClick(item, index)}>
        <CView centered>
          <Image source={{ uri: item?.profilePic }} style={styles.image} />
        </CView>
        <CView row centered style={styles.cardContent}>
          <CText color="commonWhite" size="normal" text="Live" />
          <Image
            source={appImages.liveIcon}
            style={{ width: 20, height: 20, marginLeft: 5 }}
          />
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

export default memo(Circle30);
