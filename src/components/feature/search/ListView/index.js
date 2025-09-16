import get from 'lodash/get';
import React, { useCallback, useContext } from 'react';
import { Image, Keyboard, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import { setFullModePlayer } from '../../../../stores/slices/watch';
import {
  numberFormatter,
  screenWidth,
  timeSince,
} from '../../../../utils/common';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import styles from './style';
import { getAppConfig } from '../../../../constants/code';
import Colors from '../../../common/Colors';
import { ThemeContext } from '../../../../context/ThemeContext';

const ListView = ({ data, index, searchQuery }) => {
  const dispatch = useDispatch();
  const videoTitle = get(data, 'items[0].title', 'Title');
  const imageUrl = get(data, 'items[0].background.value', null);
  const imgWidth = screenWidth / 3 - 10;

  const views = get(data, 'items[0].stats.views', '0');
  const createdAt = get(data, 'items[0].createdAt', '');

  const chName = get(data, 'items[0].profile.name', '');

  const handleCardClick = useCallback(() => {
    Keyboard.dismiss();

    const videoData = {
      ...data.items[0],
      meta: {
        pageId: getAppConfig('page', 'home'),
        eventName: 'click',
        order: index + 1,
        ...(searchQuery && { searchKeyWord: searchQuery }),
        viewType: data?.viewType,
        type: data?.items?.[0]?.type || 'video',
      },
    };
    dispatch(
      setFullModePlayer({
        isVisible: true,
        videoDetail: videoData,
      })
    );
  }, [data.items, data.viewType, dispatch, index, searchQuery]);

  const {
    theme: { mode },
  } = useContext(ThemeContext);

  return (
    <>
      {data.items[0]?.data != null && (
        <Pressable onPress={handleCardClick} style={styles.wrapper}>
          <CView row>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: imgWidth,
                height: imgWidth * (193 / 343),
                borderRadius: 10,
              }}
              resizeMode="contain"
            />
            <CView style={styles.channelWrapper}>
              <CText size="mediumBold" numberOfLines={1}>
                {videoTitle}
              </CText>
              <CView row>
                <CText
                  size="normal"
                  style={{ color: Colors[mode]?.textLightGray }}>
                  {chName}{' '}
                </CText>
              </CView>
              <CView row>
                <CText
                  size="small"
                  style={{ color: Colors[mode]?.textLightGray }}>
                  {numberFormatter(views)} views |{' '}
                </CText>
                <CText
                  size="small"
                  style={{ color: Colors[mode]?.textLightGray }}>
                  {timeSince(new Date(createdAt))}
                </CText>
              </CView>
            </CView>
          </CView>
        </Pressable>
      )}
    </>
  );
};

export default ListView;
