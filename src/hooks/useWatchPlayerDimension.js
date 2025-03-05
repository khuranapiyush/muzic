import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { setMiniPlayer } from '../stores/slices/player'
import { screenHeight, screenWidth } from '../utils/common'

const useWatchPlayerDimension = () => {
  const animation = useRef(new Animated.Value(0)).current
  const opacityMiniPlayerControls = useRef(new Animated.Value(0)).current
  const opacityScrollView = useRef(new Animated.Value(1)).current
  const [handleWatchModeRunning, setHandleWatchModeRunning] = useState(false)

  const insets = useSafeAreaInsets()

  const dispatch = useDispatch()

  const { isFullScreen: isPlayerFullScreen, isMiniPlayer } = useSelector(
    state => state.player
  )

  const prevIsMiniPlayerRef = useRef(isMiniPlayer)

  const width = useMemo(
    () => (isPlayerFullScreen ? screenHeight : screenWidth),
    [isPlayerFullScreen]
  )

  const height = useMemo(
    () => (isPlayerFullScreen ? screenWidth : screenWidth * 0.5625),
    [isPlayerFullScreen]
  )

  const miniPlayerWidth = useMemo(() => width * 0.33, [width])

  const miniPlayerHeight = useMemo(
    () => miniPlayerWidth * 0.5625,
    [miniPlayerWidth]
  )

  const footerHeight = useMemo(() => screenHeight * 0.09, [])

  const translateYPlayerUpperLimit = useMemo(
    () =>
      screenHeight -
      footerHeight -
      height * 0.33 -
      insets.top -
      miniPlayerHeight -
      1,
    [footerHeight, height, insets.top, miniPlayerHeight]
  )

  const translateYMiniPlayerUpperLimit = useMemo(
    () => screenHeight - footerHeight - insets.top - miniPlayerHeight - 1,
    [footerHeight, insets.top, miniPlayerHeight]
  )

  const translateYScrollUpperLimit = useMemo(
    () => translateYPlayerUpperLimit - height * 0.33 - 5,
    [height, translateYPlayerUpperLimit]
  )

  const translateYPlayer = animation.interpolate({
    inputRange: [-350, 0, 350],
    outputRange: [0, 0, translateYPlayerUpperLimit],
    extrapolate: 'clamp'
  })

  const translateXPlayer = animation.interpolate({
    inputRange: [0, 350],
    outputRange: [0, -miniPlayerWidth],
    extrapolate: 'clamp'
  })

  const scalePlayer = animation.interpolate({
    inputRange: [0, 350],
    outputRange: [1, 0.34],
    extrapolate: 'clamp'
  })

  const translateYMiniPlayerControls = animation.interpolate({
    inputRange: [-350, 0, 350],
    outputRange: [0, 0, translateYMiniPlayerUpperLimit],
    extrapolate: 'clamp'
  })

  const widthMiniPlayerControls = animation.interpolate({
    inputRange: [0, 350],
    outputRange: [0, width * 0.67],
    extrapolate: 'clamp'
  })

  const heightMiniPlayerControls = animation.interpolate({
    inputRange: [-350, 0, 350],
    outputRange: [height, height, miniPlayerHeight + 1],
    extrapolate: 'clamp'
  })

  const translateYScrollView = animation.interpolate({
    inputRange: [-350, 0, 350],
    outputRange: [0, 0, translateYScrollUpperLimit],
    extrapolate: 'clamp'
  })

  const paddingBottomWatchContainer = animation.interpolate({
    inputRange: [0, 350],
    outputRange: [0, screenHeight * 0.089],
    extrapolate: 'clamp'
  })

  useEffect(() => {
    const listenerId = heightMiniPlayerControls.addListener(({ value }) => {
      if (value >= miniPlayerHeight + 5) {
        opacityMiniPlayerControls.setValue(0)
        opacityScrollView.setValue(1)
      } else {
        opacityMiniPlayerControls.setValue(1)
        opacityScrollView.setValue(0)
      }

      if (value + 3 > height) {
        if (
          isMiniPlayer !== prevIsMiniPlayerRef.current &&
          !handleWatchModeRunning
        ) {
          dispatch(setMiniPlayer(false))
        }
        prevIsMiniPlayerRef.current = false
      } else if (value - 3 <= miniPlayerHeight) {
        if (
          isMiniPlayer !== prevIsMiniPlayerRef.current &&
          !handleWatchModeRunning
        ) {
          dispatch(setMiniPlayer(true))
        }
        prevIsMiniPlayerRef.current = true
      }
    })

    return () => {
      heightMiniPlayerControls.removeListener(listenerId)
    }
  }, [
    handleWatchModeRunning,
    height,
    heightMiniPlayerControls,
    miniPlayerHeight,
    opacityMiniPlayerControls,
    opacityScrollView,
    dispatch,
    isMiniPlayer
  ])

  const videoStyles = useMemo(
    () => ({
      transform: [
        {
          translateY: translateYPlayer
        },
        {
          translateX: translateXPlayer
        },
        {
          scale: scalePlayer
        }
      ]
    }),
    [scalePlayer, translateXPlayer, translateYPlayer]
  )

  const scrollStyles = useMemo(
    () => ({
      opacity: opacityScrollView,
      transform: [
        {
          translateY: translateYScrollView
        }
      ]
    }),
    [opacityScrollView, translateYScrollView]
  )

  const miniPlayerControlStyles = useMemo(
    () => ({
      transform: [
        {
          translateY: translateYMiniPlayerControls
        }
      ],
      width: widthMiniPlayerControls,
      height: heightMiniPlayerControls
    }),
    [
      heightMiniPlayerControls,
      translateYMiniPlayerControls,
      widthMiniPlayerControls
    ]
  )

  const miniPlayerExtendedStyles = useMemo(
    () => ({
      opacity: opacityMiniPlayerControls
    }),
    [opacityMiniPlayerControls]
  )

  const watchContainerStyles = useMemo(
    () => ({
      paddingBottom: paddingBottomWatchContainer
    }),
    [paddingBottomWatchContainer]
  )

  const handleWatchMode = useCallback(
    mode => {
      if (mode == 'shouldBeMax') {
        setHandleWatchModeRunning(true)
        animation.setOffset(0)
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }).start(() => {
          setHandleWatchModeRunning(false)
          dispatch(setMiniPlayer(false))
        })
      } else if (mode == 'shouldBeMini') {
        setHandleWatchModeRunning(true)
        animation.setOffset(350)
        Animated.timing(animation, {
          toValue: 350,
          duration: 300,
          useNativeDriver: false
        }).start(() => {
          setHandleWatchModeRunning(false)
          dispatch(setMiniPlayer(true))
        })
      }
    },
    [animation, dispatch]
  )

  return {
    animation,
    insets,
    isPlayerFullScreen,
    isMiniPlayer,
    videoStyles,
    scrollStyles,
    miniPlayerControlStyles,
    miniPlayerExtendedStyles,
    watchContainerStyles,
    width,
    height,
    handleWatchMode
  }
}

export default useWatchPlayerDimension
