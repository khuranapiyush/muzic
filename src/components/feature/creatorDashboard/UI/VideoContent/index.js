import React from 'react'

import { Image, Pressable } from 'react-native'
import {
  formatDate1,
  getThumbnailUrlCreator,
  numberWithComma,
  screenWidth
} from '../../../../../utils/common'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import styles from './style'
import appImages from '../../../../../resource/images'

const VideoContent = ({ title, data, handleCardClick, type = '' }) => {
  const imgWidth = screenWidth / 3 - 10

  return (
    <CView>
      <Pressable onPress={handleCardClick} style={styles.wrapper}>
        <CView row>
          <Image
            source={{ uri: getThumbnailUrlCreator(data?.newThumbnails) }}
            style={{
              width: imgWidth,
              height: imgWidth * (193 / 343),
              borderRadius: 4
            }}
            resizeMode="contain"
          />
          <CView style={styles.channelWrapper}>
            <CText size="mediumBold" numberOfLines={1}>
              {data?.title}
            </CText>
            <CView row>
              {type == 'earnings' && (
                <CView row centered>
                  <Image source={appImages.coin} style={styles.coinIcon} />
                  <CText size="smallBold" style={styles.coinValue}>
                    {' '}
                    {numberWithComma(data?.totalCoin)}
                  </CText>
                </CView>
              )}
              {type == 'views' && (
                <CText size="smallBold">
                  {numberWithComma(data?.views)} views
                </CText>
              )}
              {type == 'engagement' && (
                <CText size="smallBold">
                  {numberWithComma(data?.totalWatchHours)} Hrs
                </CText>
              )}
            </CView>
            <CView>
              <CText size="small" style={styles.textColor}>
                {formatDate1(new Date(data?.createdAt))}
              </CText>
            </CView>
          </CView>
        </CView>
      </Pressable>
    </CView>
  )
}

export default VideoContent
