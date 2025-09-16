import React, { useMemo, useRef } from 'react';
import Video from 'react-native-video';
import { getVideoUrl, screenWidth, timeSince } from '../../../utils/common';
import CText from '../../common/core/Text';
import CView from '../../common/core/View';
import getStyles from './style';

const TradePlayer = ({ songData, theme }) => {
  console.log('🚀 ~ TradePlayer ~ songData:', songData);
  const videoDetail = useMemo(
    () =>
      songData &&
      Object.keys(songData).length && {
        uri: songData?.data || getVideoUrl(songData.cdnLocation),
        poster: songData?.videoThumbnail,
      },
    [songData]
  );
  const styles = getStyles(theme);
  const width = useMemo(() => screenWidth, []);
  const height = useMemo(() => screenWidth * 0.5625, []);

  const videoRef = useRef(null);

  return (
    <CView>
      <CText size="mediumBold" style={{ marginHorizontal: 10, marginTop: 10 }}>
        Song and Royalty Details
      </CText>
      <CView
        style={{ width: width, height: height, ...styles.playerContainer }}>
        <Video
          paused={true}
          source={{
            uri: videoDetail?.uri,
          }}
          poster={videoDetail?.poster}
          ref={videoRef}
          controls={true}
          style={styles.backgroundVideo}
          volume={1}
        />
      </CView>
      <CView style={styles.platerTitleWrapper}>
        <CText numberOfLines={2} size="normalBold">
          {songData?.videoTitle || songData?.title}
        </CText>

        <CText size="smallBold" style={styles.paddingTop10}>
          {timeSince(new Date(songData?.launchDate))}
        </CText>
      </CView>
    </CView>
  );
};

export default TradePlayer;
