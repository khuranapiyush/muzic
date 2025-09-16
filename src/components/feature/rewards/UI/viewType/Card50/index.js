import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutAnimation,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import appImages from '../../../../../../resource/images';
import { screenWidth } from '../../../../../../utils/common';
import CText from '../../../../../common/core/Text';
import CView from '../../../../../common/core/View';
import getStyles from './style';
import { useTheme } from '@react-navigation/native';

const customStyles = { spacing: 16 };
const config = { adjustableItems: 2 };

const Card50 = ({
  label,
  description,
  items,
  feedType,
  visibleItems,
  type,
  handleGameAction,
  ...rest
}) => {
  const [isShowMoreItems, setIsShowMoreItems] = useState(false);

  const { mode } = useTheme();
  const styles = getStyles(mode);

  const { isGrid, gridItems, showGridBtn } = useMemo(
    () => ({
      isGrid: feedType === 'grid',
      gridItems: !isShowMoreItems ? items.slice(0, visibleItems) : items,
      showGridBtn: items.length > visibleItems,
    }),
    [feedType, isShowMoreItems, items, visibleItems]
  );

  const handleClick = useCallback(
    idx => {
      handleGameAction(items[idx]);
    },
    [handleGameAction, items]
  );

  const renderItem = useCallback(
    ({ item, index: idx }) => {
      return (
        <Pressable
          key={idx}
          onPress={() => handleClick(idx)}
          disabled={item?.isLocked}>
          <AutoHeightImage
            source={{
              uri: item?.isLocked
                ? item?.metaData?.lockedCardImageUrl
                : item?.metaData?.cardImageUrl,
            }}
            width={screenWidth * 0.5 - customStyles.spacing * 2}
          />
        </Pressable>
      );
    },
    [handleClick]
  );

  const renderGrid = useCallback(
    (item, idx) => {
      return (
        <Pressable
          onPress={() => handleClick(idx)}
          disabled={item?.isLocked}
          key={idx}
          style={{
            ...(idx % config.adjustableItems != 0 && {
              marginLeft: customStyles.spacing,
            }),
            ...(gridItems.length - idx > config.adjustableItems && {
              marginBottom: customStyles.spacing,
            }),
          }}>
          <AutoHeightImage
            source={{
              uri: item?.isLocked
                ? item?.metaData?.lockedCardImageUrl
                : item?.metaData?.cardImageUrl,
            }}
            width={
              screenWidth * 0.5 -
              customStyles.spacing -
              customStyles.spacing / 2
            }
          />
        </Pressable>
      );
    },
    [gridItems.length, handleClick]
  );

  const HorizontalItemSeparator = useCallback(() => {
    return (
      <CView
        style={{
          width: customStyles.spacing * 2,
          ...(feedType == 'vertical' && { height: customStyles.spacing }),
        }}
      />
    );
  }, [feedType]);

  const toggleExpand = useCallback(value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsShowMoreItems(value);
  }, []);

  return (
    <CView style={styles.wrapper}>
      <CView style={{ paddingLeft: customStyles.spacing }}>
        <CView>
          <CText style={styles.feedHeaderText}>{label}</CText>
        </CView>

        {!!description && (
          <CView style={styles.feedDescriptionWrapper}>
            <CText style={styles.feedDescriptionText}>{description}</CText>
          </CView>
        )}
      </CView>

      <CView style={styles.itemWrapper}>
        {isGrid ? (
          <CView>
            <CView
              row
              style={{
                flexWrap: 'wrap',
                marginHorizontal: customStyles.spacing,
              }}>
              {gridItems.map(renderGrid)}
            </CView>
            {showGridBtn && (
              <CView>
                {!isShowMoreItems ? (
                  <CView row style={styles.gridBtnWrapper}>
                    <TouchableOpacity
                      onPress={() => toggleExpand(true)}
                      style={styles.gridBtn}>
                      <CText style={styles.btnText}>View more</CText>
                      <Image
                        source={appImages.arrowDownIcon}
                        style={styles.btnIcon}
                      />
                    </TouchableOpacity>
                  </CView>
                ) : (
                  <CView row style={styles.gridBtnWrapper}>
                    <TouchableOpacity
                      onPress={() => toggleExpand(false)}
                      style={styles.gridBtn}>
                      <CText style={styles.btnText}>Show less</CText>
                      <Image
                        source={appImages.arrowUpIcon}
                        style={styles.btnIcon}
                      />
                    </TouchableOpacity>
                  </CView>
                )}
              </CView>
            )}
          </CView>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item?.action?.gameId}
            renderItem={renderItem}
            horizontal={feedType == 'horizontal'}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={HorizontalItemSeparator}
            style={{
              ...(feedType == 'vertical' && {
                marginLeft: customStyles.spacing,
                marginRight: customStyles.spacing,
              }),
              ...(feedType == 'horizontal' &&
                items.length <= config.adjustableItems && {
                  marginLeft: customStyles.spacing,
                  marginRight: customStyles.spacing,
                }),
            }}
            contentContainerStyle={{
              ...(feedType == 'horizontal' &&
                items.length > config.adjustableItems && {
                  paddingHorizontal: customStyles.spacing,
                }),
            }}
          />
        )}
      </CView>
    </CView>
  );
};
export default Card50;
