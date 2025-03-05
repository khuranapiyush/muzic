import React, { memo, useContext, useRef } from 'react'
import { Dimensions, FlatList, Image, Pressable } from 'react-native'
import { useDispatch } from 'react-redux'
import { getAppConfig } from '../../../../constants/code'
import { setFullModePlayer } from '../../../../stores/slices/watch'
import { numberFormatter, timeSince } from '../../../../utils/common'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import styles from './style'
import Colors from '../../../common/Colors'
import { ThemeContext } from '../../../../context/ThemeContext'

export const SLIDER_WIDTH = Dimensions.get('window').width
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.95)

const Card80 = ({ data }) => {
  const dispatch = useDispatch()
  const cgRef = useRef()

  const {
    theme: { mode }
  } = useContext(ThemeContext)

  const handleCardClick = (item, index) => {
    const videoData = {
      ...item,
      meta: {
        pageId: getAppConfig('page', 'home'),
        eventName: 'click',
        order: index + 1,
        viewType: data?.viewType,
        type: item?.type || 'video'
      }
    }
    dispatch(setFullModePlayer({ isVisible: true, videoDetail: videoData }))
  }

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
        </CView>
        <CView style={styles.cardContent}>
          <CText size="normal" numberOfLines={2} text={item?.title} />
          <CView style={styles.channelWrapper} row>
            <CText size="small" style={{ color: Colors[mode]?.textLightGray }}>
              {item?.profile?.name} | {numberFormatter(item?.stats?.views)}{' '}
              views | {timeSince(new Date(item?.createdAt))}
            </CText>
          </CView>
        </CView>
      </Pressable>
    </CView>
  )
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
  )
}

export default memo(Card80)
