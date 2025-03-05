import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, TouchableOpacity } from 'react-native'
import Ionic from 'react-native-vector-icons/Ionicons'
import Video from 'react-native-video'
import { useDispatch, useSelector } from 'react-redux'
import usePlayerTrackEvent from '../../../../hooks/usePlayerTrackEvent'
import { setShortiePlayerMuted } from '../../../../stores/slices/shortiePlayer'
import { setWatchId } from '../../../../stores/slices/watch'
import { getUniqueId } from '../../../../utils/common'
import CView from '../../../common/core/View'
import ShortieBottomItemComponent from '../ShortieComponent/ShortieBottomItemComponent'
import styles from './style'

const SingleShortie = ({ item, index, currentIndex, handleShortiePlay }) => {
  const dispatch = useDispatch()
  const { isMuted } = useSelector(state => state.shortiePlayer)
  const [isPaused, setIsPaused] = useState(true)
  const { watchId } = useSelector(state => state.watch)
  const [seekValue, setSeekValue] = useState(0)

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

  const handleMuteUnmute = useCallback(() => {
    dispatch(setShortiePlayerMuted(!isMuted))
  }, [dispatch, isMuted])

  useEffect(() => {
    if (currentIndex != index) {
      setIsPaused(true)
      videoRef.current = null
    } else if (currentIndex == index) {
      setIsPaused(false)
    }
  }, [currentIndex, index])

  const handlePlayerLoad = data => {
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

  const handlePlayerReadyForDisplay = () => {
    handleShortiePlay()
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
    setSeekValue(currentTime)
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
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleMuteUnmute}
        style={styles.container}>
        <Video
          ref={videoRef}
          ignoreSilentSwitch="ignore"
          repeat={true}
          onReadyForDisplay={handlePlayerReadyForDisplay}
          onLoad={handlePlayerLoad}
          poster={item?.background?.value}
          resizeMode="cover"
          paused={isPaused}
          onEnd={handlePlayerOnEnd}
          onProgress={handleProgress}
          source={{ uri: item?.data }}
          muted={isMuted}
          style={styles.videoStyle}
          selectedVideoTrack={{
            type: 'resolution',
            value: 720
          }}
          posterResizeMode="cover"
        />
      </TouchableOpacity>
      {isMuted && (
        <Pressable onPress={handleMuteUnmute} style={styles.muteIconContainer}>
          <Ionic name="volume-mute" style={styles.muteIcon} />
        </Pressable>
      )}
      <ShortieBottomItemComponent
        seekValue={seekValue}
        duration={duration}
        item={item}
      />
    </CView>
  )
}

export default memo(SingleShortie)
