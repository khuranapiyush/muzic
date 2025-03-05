import React, { memo } from 'react'
import { Dimensions, Image, Pressable } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { getAppConfig } from '../../../../constants/code'
import useEvent from '../../../../hooks/useEvent'
import { setFullModePlayer } from '../../../../stores/slices/watch'
import CarouselView from '../CarouselView'
import styles from './style'
import { handleVideoStartBannerEvent } from '../../../../events/video'

export const SLIDER_WIDTH = Dimensions.get('window').width
export const ITEM_WIDTH = Math.round(SLIDER_WIDTH)

const Banner = ({ data }) => {
  const dispatch = useDispatch()
  const { isShowFeature } = useSelector(state => state.app)

  const { defaultEventData } = useEvent()

  const handleBannerClick = (item, index) => {
    if (item?.type == 'video') {
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

      handleVideoStartBannerEvent({ ...defaultEventData })
    }
  }

  const renderBanner = ({ item, index }) => (
    <Pressable
      onPress={() => handleBannerClick(item, index)}
      style={styles.container}
      key={index}>
      <Image source={{ uri: item.background.value }} style={styles.image} />
    </Pressable>
  )

  return (
    <CarouselView
      data={
        isShowFeature
          ? data?.items
          : data?.items?.filter(item => item.type == 'video')
      }
      renderComponent={renderBanner}
    />
  )
}

export default memo(Banner)
