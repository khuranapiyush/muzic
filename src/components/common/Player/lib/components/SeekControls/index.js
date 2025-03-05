import { Slider } from '@miblanchard/react-native-slider'
import React, { useCallback, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { screenHeight } from '../../../../../../utils/common'
import styles from './style'

const SeekControls = ({
  playerProps,
  isSeeking,
  seekValue,
  duration,
  handleSeekStart: propsHandleSeekStart,
  handleSeekMove: propsHandleSeekMove,
  handleSeekEnd: propsHandleSeekEnd
}) => {
  const [localSeek, setLocalSeek] = useState(seekValue)

  const thumbSize = useRef(new Animated.Value(1)).current

  const insets = useSafeAreaInsets()

  const renderThumbComponent = useCallback(() => {
    return (
      <Animated.View
        style={{
          ...styles.thumb,
          transform: [
            {
              scale: thumbSize.interpolate({
                inputRange: [1, 1.3],
                outputRange: [1, 1.3]
              })
            }
          ]
        }}
      />
    )
  }, [thumbSize])

  const startThumbAnimation = toValue => {
    Animated.timing(thumbSize, {
      toValue,
      duration: 200,
      useNativeDriver: false
    }).start()
  }

  const handleSeekStart = value => {
    setLocalSeek(value)
    startThumbAnimation(1.3)
    propsHandleSeekStart(value)
  }

  const handleSeekMove = value => {
    setLocalSeek(value)
    propsHandleSeekMove(value)
  }

  const handleSeekEnd = value => {
    setLocalSeek(value)
    startThumbAnimation(1)
    propsHandleSeekEnd(value)
  }

  return (
    <Slider
      containerStyle={[
        styles.sliderContainer,
        !!playerProps.isFullScreen && {
          width: `${
            100 - ((insets.left + insets.right) / screenHeight) * 100
          }%`,
          bottom: '6%'
        }
      ]}
      value={isSeeking ? localSeek : seekValue}
      minimumValue={0}
      maximumValue={duration}
      onSlidingStart={handleSeekStart}
      onValueChange={handleSeekMove}
      onSlidingComplete={handleSeekEnd}
      minimumTrackTintColor="#6B61FF"
      maximumTrackTintColor="#ccc"
      renderThumbComponent={renderThumbComponent}
      thumbTouchSize={{ width: 10, height: 10 }}
      trackStyle={styles.trackStyle}
    />
  )
}

export default SeekControls
