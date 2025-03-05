import { useMutation } from '@tanstack/react-query'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { SwiperFlatList } from 'react-native-swiper-flatlist'
import { useSelector } from 'react-redux'
import { similarShortieListRequest } from '../../../../api/shortie'
import { trackEvents } from '../../../../api/watch'
import { getAppConfig } from '../../../../constants/code'
import { get } from '../../../../utils/common'
import SingleShortie from '../SingleShortie'

const ShortiesComponent = ({ data }) => {
  const { sessionId } = useSelector(state => state.app)
  const { watchId } = useSelector(state => state.watch)

  const [isItemClickedTrack, setIsItemClickedTrack] = useState(true)

  const { trackData } = useSelector(state => state.shortiePlayer)

  const [currentIndex, setCurrentIndex] = useState(0)

  const [page, setPage] = useState(0)

  const [shortieList, setShortieList] = useState([data])

  const { mutate: shortieRequest } = useMutation(
    obj => similarShortieListRequest(obj),
    {
      onSuccess: response => {
        let result = response.data.data
        setShortieList([...shortieList, ...result])
      },
      onError: error => {
        console.log('hoom feed error error: ', error.response.data.data)
      }
    }
  )

  const handleChangeIndexValue = ({ index }) => {
    setCurrentIndex(index)
  }

  const handleEndReached = useCallback(() => {
    setPage(page + 1)
  }, [page])

  const { mutate: handleTrackEvents } = useMutation(obj => trackEvents(obj))

  const handleShortiePlay = useCallback(
    idx => {
      const videoId = get(shortieList[currentIndex], '_id', null)
      if (videoId != null && watchId && sessionId) {
        if (isItemClickedTrack) {
          let obj = {
            watchId: watchId,
            platform: 'ios',
            sessionId: sessionId,
            ...trackData.shortieDetail.meta
          }
          handleTrackEvents({ id: videoId, data: obj })
          setIsItemClickedTrack(false)
        } else {
          let obj = {
            watchId: watchId,
            platform: 'ios',
            sessionId: sessionId,
            pageId: getAppConfig('page', 'home'),
            eventName: 'swipe',
            order: currentIndex + 1,
            viewType: '20',
            type: 'shorties'
          }
          handleTrackEvents({ id: videoId, data: obj })
        }
      }
    },
    [
      currentIndex,
      handleTrackEvents,
      isItemClickedTrack,
      sessionId,
      setIsItemClickedTrack,
      shortieList,
      trackData.shortieDetail.meta,
      watchId
    ]
  )

  useEffect(() => {
    if (page >= 1) {
      let obj = {
        page: page,
        excludeEntities: encodeURIComponent(
          `["${trackData.shortieDetail._id}"]`
        )
      }
      shortieRequest(obj)
    }
  }, [page, shortieRequest, trackData.shortieDetail._id])

  const renderShortieItems = useCallback(
    ({ item, index }) => (
      <SingleShortie
        item={item}
        index={index}
        handleShortiePlay={handleShortiePlay}
        currentIndex={currentIndex}
      />
    ),
    [currentIndex, handleShortiePlay]
  )

  const keyExtractor = useCallback(
    (item, idx) => `shortie_${item._id}_${idx}`,
    []
  )

  return (
    <SwiperFlatList
      removeClippedSuvViews={true}
      initialNumToRender={1}
      maxToRenderPerBatch={1}
      windowSize={1}
      pagingEnabled
      vertical={true}
      onChangeIndex={handleChangeIndexValue}
      data={shortieList}
      renderItem={renderShortieItems}
      keyExtractor={keyExtractor}
      onEndReached={handleEndReached}
      onEndReachedThreshold={1}
    />
  )
}

export default memo(ShortiesComponent)
