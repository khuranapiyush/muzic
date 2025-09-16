import get from 'lodash/get';
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Pressable, TouchableOpacity } from 'react-native';
import Popover from 'react-native-popover-view';
import { useDispatch, useSelector } from 'react-redux';
import { getAppConfig } from '../../../../constants/code';
import { handleVideoStartHoverEvent } from '../../../../events/video';
import useEvent from '../../../../hooks/useEvent';
import appImages from '../../../../resource/images';
import { setFullModePlayer } from '../../../../stores/slices/watch';
import {
  numberFormatter,
  screenWidth,
  timeSince,
} from '../../../../utils/common';
import { AuthShareButton } from '../../../common/Button/ShareButton';
import Player from '../../../common/Player';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import VideoCoinToolTip from '../UI/VideoCoinToolTip';
import styles from './style';
import Colors from '../../../common/Colors';
import { ThemeContext } from '../../../../context/ThemeContext';

const Card100 = ({ data, index }) => {
  const dispatch = useDispatch();
  const {
    theme: { mode },
  } = useContext(ThemeContext);

  const videoTitle = get(data, 'items[0].title', 'Title');
  const slug = get(data, 'items[0].slug');
  const slugKey = get(data, 'items[0].slugKey');
  const rewardCoin = get(data, 'items[0].rewardCoin');
  const isLiveStream = get(data, 'items[0].isLiveStream');

  const imageUrl = get(data, 'items[0].background.value', null);

  const views = get(data, 'items[0].stats.views', '0');
  const createdAt = get(data, 'items[0].createdAt', '');

  const chName = get(data, 'items[0].profile.name', '');
  const chImage = get(data, 'items[0].profile.avatar', '');

  const { homePagePlayerProps } = useSelector(state => state.home);
  const { isVisible: isWatchPlayerVisible } = useSelector(state => state.watch);
  const { playerPreferences } = useSelector(state => state.player);
  const { isShowFeature } = useSelector(state => state.app);

  const [showPopover, setShowPopover] = useState(false);
  const touchable = useRef();

  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);

  const { defaultEventData } = useEvent();

  const shouldPlayerBeVisible = useMemo(
    () =>
      !isWatchPlayerVisible &&
      homePagePlayerProps?.isVisible &&
      get(data, 'items[0]._id') == homePagePlayerProps?.data?._id,
    [
      data,
      homePagePlayerProps?.data?._id,
      homePagePlayerProps?.isVisible,
      isWatchPlayerVisible,
    ]
  );

  const shareOptions = useMemo(
    () => ({
      title: videoTitle,
      url: `https://fantv.in/watch/${slug}-${slugKey}`,
    }),
    [slug, slugKey, videoTitle]
  );

  const videoDetails = useMemo(() => {
    return {
      uri: get(data, 'items[0].data'),
    };
  }, [data]);

  const configPlayerProps = useMemo(
    () => ({
      muted: playerPreferences?.autoPlayPlayer?.muted,
    }),
    [playerPreferences?.autoPlayPlayer?.muted]
  );

  const handleCardClick = useCallback(() => {
    const videoData = {
      ...data.items[0],
      meta: {
        pageId: getAppConfig('page', 'home'),
        eventName: 'click',
        order: index + 1,
        viewType: data.viewType,
        type: data?.items?.[0]?.type || 'video',
      },
    };

    dispatch(
      setFullModePlayer({
        isVisible: true,
        videoDetail: videoData,
      })
    );
  }, [data.items, data.viewType, dispatch, index]);

  const handleAutoPlayPlayerClick = useCallback(() => {
    handleCardClick();
  }, [handleCardClick]);

  const handleVideoStart = useCallback(() => {
    setIsPlayerPlaying(true);
    handleVideoStartHoverEvent({ ...defaultEventData });
  }, [defaultEventData]);

  const handlePlayerDestroyed = useCallback(() => {
    setIsPlayerPlaying(false);
  }, []);

  return (
    <CView style={styles.flex1}>
      {data != null && (
        <Pressable onPress={handleCardClick}>
          <CView>
            <Image
              source={{ uri: imageUrl }}
              style={{
                flex: 1,
                width: screenWidth,
                height: screenWidth * (194 / 343),
                opacity: isPlayerPlaying ? 0 : 1,
              }}
              resizeMode="contain"
            />
            {!!rewardCoin && isShowFeature && (
              <VideoCoinToolTip coin={rewardCoin} />
            )}
            {isLiveStream && (
              <CView style={styles.liveBtnContainer}>
                <CText style={{ color: 'white', fontWeight: '500' }}>
                  Live
                </CText>
              </CView>
            )}

            <CView
              style={{
                flex: 1,
                width: screenWidth,
                height: screenWidth * (194 / 343),
                position: 'absolute',
              }}>
              {shouldPlayerBeVisible && (
                <Player
                  playerType="AutoPlayPlayer"
                  videoDetails={videoDetails}
                  handleVideoStart={handleVideoStart}
                  handlePlayerDestroyed={handlePlayerDestroyed}
                  handleAutoPlayPlayerClick={handleAutoPlayPlayerClick}
                  configPlayerProps={configPlayerProps}
                />
              )}
            </CView>
          </CView>
          <CView>
            <CView>
              <CView row style={styles.titleWrapper}>
                <Image
                  source={{ uri: chImage }}
                  style={styles.channelImage}
                  resizeMode="contain"
                />
                <CView style={styles.flex1}>
                  <CView row style={styles.flex1}>
                    <CView style={styles.flex8}>
                      <CText numberOfLines={2} size="normal">
                        {videoTitle}
                      </CText>
                    </CView>
                    <TouchableOpacity
                      style={styles.rightIconContainer}
                      ref={touchable}
                      onPress={() => setShowPopover(true)}>
                      <Image
                        source={appImages.threeDotIcon}
                        style={{
                          ...styles.dotStyle,
                          tintColor: Colors[mode]?.white,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <Popover
                      from={touchable}
                      isVisible={showPopover}
                      backgroundStyle={styles.popoverBg}
                      onRequestClose={() => setShowPopover(false)}>
                      <CView style={styles.popoverContainer}>
                        <AuthShareButton
                          shareOptions={shareOptions}
                          customStyles={{
                            shareContainer: styles.shareContainer,
                          }}
                        />
                      </CView>
                    </Popover>
                  </CView>
                  <CView style={styles.channelWrapper}>
                    <CText
                      size="small"
                      style={{ color: Colors[mode]?.textLightGray }}>
                      {chName} | {numberFormatter(views)} views |{' '}
                      {timeSince(new Date(createdAt))}
                    </CText>
                  </CView>
                </CView>
              </CView>
            </CView>
          </CView>
        </Pressable>
      )}
    </CView>
  );
};

export default Card100;
