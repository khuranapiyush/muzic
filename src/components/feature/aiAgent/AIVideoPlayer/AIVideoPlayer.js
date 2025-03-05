import React, { useEffect, useRef, useState } from 'react'
import Video from 'react-native-video'
import { useDispatch, useSelector } from 'react-redux'
import usePlayerTrackEvent from '../../../../hooks/usePlayerTrackEvent'
import { setWatchId } from '../../../../stores/slices/watch'
import { getUniqueId } from '../../../../utils/common'
import CView from '../../../common/core/View'
import styles from '../../shorties/SingleShortie/style'
import { ActivityIndicator } from 'react-native'

const AIVideoPlayer = ({ item, index, currentIndex, handleShortiePlay }) => {
  const dispatch = useDispatch()
  const [isPaused, setIsPaused] = useState(true)
  const [loading, setLoading] = useState(true)
  const { watchId } = useSelector(state => state.watch)

  const [progress, setProgress] = useState({})
  const [duration, setDuration] = useState(0)

  const [lastIntervalTriggered, setLastIntervalTriggered] = useState(-1)

  const [videoResolution, setVideoResolution] = useState({
    initial: {
      width: 0,
      height: 0
    },
    current: {
      width: 0,
      height: 0
    }
  })

  const { logPlayerEvents } = usePlayerTrackEvent({
    playerType: 'ShortiePlayer',
    playerProps: { mute: false },
    duration: duration,
    watchId: watchId,
    videoResolution: videoResolution
  })

  const videoRef = useRef()

  useEffect(() => {
    if (currentIndex != index) {
      setIsPaused(true)
      videoRef.current = null
    } else if (currentIndex == index) {
      setIsPaused(false)
    }
  }, [currentIndex, index])

  const handlePlayerLoad = data => {
    setLoading(false)
    dispatch(setWatchId(getUniqueId()))

    const { width, height } = data.naturalSize
    setVideoResolution(prev => ({ ...prev, initial: { width, height } }))
    setDuration(data.duration)

    logPlayerEvents({
      data: {
        category: 'player',
        name: 'start',
        playerType: 'ShortiePlayer',
        mode: 'Normal',
        videoTimeStamp: progress?.currentTime,
        shortieId: item?._id
      }
    })
  }

  const handlePlayerOnEnd = () => {
    logPlayerEvents({
      data: {
        category: 'player',
        name: 'ended',
        playerType: 'ShortiePlayer',
        mode: 'Normal',
        videoTimeStamp: 0,
        shortieId: item?._id
      }
    })
  }

  const handleProgress = data => {
    const progressWidth = (data.currentTime / duration) * 100
    const bufferWidth = (data.playableDuration / duration) * 100
    const currentTime = Math.trunc(data.currentTime)

    handleInterval(currentTime)

    setProgress({ ...data, progressWidth, bufferWidth, currentTime })
  }

  const handleInterval = currentTime => {
    if (currentTime !== 0 && currentTime !== lastIntervalTriggered) {
      setLastIntervalTriggered(currentTime)

      const { interval } = {
        interval: { secondsToCall: 5, strict: true, label: '5' }
      }

      if (currentTime % interval.secondsToCall === 0) {
        const data = {
          label: interval?.label,
          secondsToCall: interval.secondsToCall
        }

        handleIntervalEvent(data, { currentTime })
      }
    }
  }

  const handleIntervalEvent = (data, config) => {
    logPlayerEvents({
      data: {
        category: 'interval',
        name: data?.label,
        playerType: 'ShortiePlayer',
        mode: 'Normal',
        videoTimeStamp: config.currentTime
      }
    })
  }

  return (
    <CView style={styles.wrapper}>
      {loading && (
        <CView style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </CView>
      )}
      <Video
        ref={videoRef}
        ignoreSilentSwitch="ignore"
        repeat={true}
        onLoad={handlePlayerLoad}
        // poster={item?.background?.value || item?.thumbUrl}
        resizeMode={'contain'}
        paused={isPaused}
        onEnd={handlePlayerOnEnd}
        onProgress={handleProgress}
        source={{
          uri: item?.videoUrl
        }}
        muted={false}
        style={styles.videoStyle}
        selectedVideoTrack={{
          type: 'resolution',
          value: 720
        }}
        posterResizeMode={'contain'}
      />
    </CView>
  )
}

export default AIVideoPlayer
