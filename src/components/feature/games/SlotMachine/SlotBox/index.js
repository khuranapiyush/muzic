import React, { useEffect, useRef } from 'react'
import { Animated, Easing, Image } from 'react-native'
import styles from './style'

const SlotBox = ({
  slotIdx,
  isRolling,
  config,
  handleSlotLayout,
  handleAnimationEnd
}) => {
  const slotKey = `slot${slotIdx}`

  const translateY = useRef(new Animated.Value(0)).current

  const translateYInterpolation = translateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -config.slotConfig[slotKey].distance],
    extrapolate: 'clamp'
  })

  useEffect(() => {
    if (isRolling) {
      const duration = config.slotConfig[slotKey].timer * 1000 // Convert to milliseconds
      config.slotConfig[slotKey].modifiedSlotsData.length

      Animated.timing(translateY, {
        toValue: 1,
        duration,
        useNativeDriver: true, // Set to true if possible
        easing: Easing.bezier(0.42, 0, 0.58, 1)
      }).start(() => {
        if (slotIdx == 3) {
          handleAnimationEnd()
        }
      })
    }
  }, [
    config.slotConfig,
    handleAnimationEnd,
    isRolling,
    slotIdx,
    slotKey,
    translateY
  ])

  return (
    <>
      {config.slotConfig[slotKey].modifiedSlotsData.map((item, idx) => (
        <Animated.View
          key={idx}
          onLayout={handleSlotLayout}
          style={{
            ...styles.wrapper,
            ...(isRolling && {
              transform: [{ translateY: translateYInterpolation }]
            })
          }}>
          <Image source={{ uri: item.url }} style={styles.slotIcon} />
        </Animated.View>
      ))}
    </>
  )
}

export default SlotBox
