import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Image, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import ROUTE_NAME from '../../../../../../navigator/config/routeName';
import {
  setFanCardVideoDetail,
  setSelectedTabId,
} from '../../../../../../stores/slices/trade';
import CText from '../../../../../common/core/Text';
import CView from '../../../../../common/core/View';
import getStyles from './style';

const DashboardNftSection = ({ data }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { mode } = useTheme();
  const styles = getStyles(mode);
  const handleViewAll = useCallback(
    item => {
      dispatch(setSelectedTabId(item?.deeplink?.value));
      navigation.navigate(ROUTE_NAME.Trade, { parentIdx: 1 });
    },
    [dispatch, navigation]
  );

  const handleCardClick = useCallback(
    item => {
      dispatch(setFanCardVideoDetail(item));
      navigation.navigate(ROUTE_NAME.SongDetail, {
        songData: item,
        title: item?.tierName,
      });
    },
    [dispatch, navigation]
  );

  return (
    <CView style={styles.wrapper}>
      <CView style={styles.container}>
        {data?.length > 0 &&
          data?.map((item, i) => (
            <CView style={styles.marginTop15} key={`${item.title + i}`}>
              <CView row style={styles.headerContainer}>
                <CText size="mediumBold">{item?.title}</CText>
                <Pressable onPress={() => handleViewAll(item?.titleClick)}>
                  <CText size="smallBold">{item?.titleClick?.text}</CText>
                </Pressable>
              </CView>
              <CView row>
                {item?.items?.length > 0 &&
                  item?.items?.map((cardItem, i) => (
                    <CView
                      style={
                        i == 1
                          ? styles.cardContainerWithSpace
                          : styles.cardContainer
                      }
                      key={`generic_${i}`}>
                      <Pressable onPress={() => handleCardClick(cardItem)}>
                        <Image
                          source={{ uri: cardItem?.background?.value }}
                          style={styles.imageStyle}
                        />
                        <CView style={styles.contentContainer}>
                          <CText size="normalBold">
                            {cardItem?.tradeDetails?.title}
                          </CText>
                          <CText
                            size="small"
                            style={{
                              color: cardItem.tradeDetails?.subTitle?.color,
                            }}>
                            {cardItem.tradeDetails?.subTitle?.text}
                          </CText>
                        </CView>
                      </Pressable>
                    </CView>
                  ))}
              </CView>
            </CView>
          ))}
      </CView>
    </CView>
  );
};

export default DashboardNftSection;
