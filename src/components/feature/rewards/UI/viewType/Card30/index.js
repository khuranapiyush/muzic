import React, { useMemo, useState } from 'react';
import { Button, FlatList, Pressable } from 'react-native';
import AutoHeightImage from 'react-native-auto-height-image';
import { screenWidth } from '../../../../../../utils/common';
import CText from '../../../../../common/core/Text';
import CView from '../../../../../common/core/View';
import getStyles from './style';
import { useTheme } from '@react-navigation/native';

const customStyles = { spacing: 16 };

const generateWidth = count => {
  return screenWidth * 0.5 - customStyles.spacing * 2;
};

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
  const [isShowMoreItems, setIsShowItems] = useState(false);

  const isGrid = false;

  const { mode } = useTheme();
  const styles = getStyles(mode);

  useMemo(
    () => feedType === 'vertical' && items.length > visibleItems,
    [feedType, items.length, visibleItems]
  );

  const handleClick = idx => {
    handleGameAction(items[idx]);
  };

  const renderItem = ({ item, index: idx }) => {
    return (
      <Pressable onPress={() => handleClick(idx)} disabled={item?.isLocked}>
        <AutoHeightImage
          source={{
            uri: item?.isLocked
              ? item?.metaData?.lockedCardImageUrl
              : item?.metaData?.cardImageUrl,
          }}
          width={screenWidth * 0.3 - customStyles.spacing * 2}
        />
      </Pressable>
    );
  };

  const renderGrid = (item, idx) => {
    return (
      <CView key={idx}>
        <AutoHeightImage
          source={{ uri: item?.metaData?.cardImageUrl }}
          width={screenWidth * 0.9}
        />
      </CView>
    );
  };

  const HorizontalItemSeparator = () => {
    return (
      <CView
        style={{
          width: customStyles.spacing,
          ...(feedType == 'vertical' && { height: customStyles.spacing }),
        }}
      />
    );
  };

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
            <CView row style={{ flexWrap: 'wrap', flex: 1 }}>
              {items.slice(0, visibleItems).map(renderGrid)}
            </CView>
            {!isShowMoreItems ? (
              <Button title=" View more" onPress={() => setIsShowItems(true)}>
                {/* <img src="/images/fantv/arrow_feed.svg" alt="open" /> */}
              </Button>
            ) : (
              <Button title="Show less" onPress={() => setIsShowItems(false)}>
                {/* <img src="/images/fantv/arrow_feed2.svg" alt="close" /> */}
              </Button>
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
                items.length <= 3 && {
                  marginLeft: customStyles.spacing,
                  marginRight: customStyles.spacing,
                }),
            }}
            contentContainerStyle={{
              ...(feedType == 'horizontal' &&
                items.length > 3 && {
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
