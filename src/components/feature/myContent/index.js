import React from 'react'
import { Image, Pressable } from 'react-native'

import {
  getThumbnailUrl,
  numberFormatter,
  screenWidth,
  timeSince
} from '../../../utils/common'
import CText from '../../common/core/Text'
import CView from '../../common/core/View'
import styles from './style'

const MyContent = ({ item }) => {
  const imgWidth = screenWidth / 2.5 - 10

  return (
    <>
      <Pressable>
        <CView row>
          <Image
            source={{ uri: getThumbnailUrl(item?.newThumbnails) }}
            style={{
              width: imgWidth,
              height: imgWidth * (193 / 343),
              borderRadius: 10
            }}
            resizeMode="contain"
          />
          <CView style={styles.channelWrapper}>
            <CText size="normalBold" numberOfLines={1}>
              {item?.title}
            </CText>
            <CView row>
              <CText size="normal">{item?.creator?.name} </CText>
            </CView>
            <CView row>
              <CText size="smallBold">
                {numberFormatter(item.stats.views)} views |{' '}
              </CText>
              <CText size="smallBold">
                {timeSince(new Date(item?.createdAt))}
              </CText>
            </CView>
          </CView>
        </CView>
      </Pressable>
    </>
  )
}

export default MyContent
