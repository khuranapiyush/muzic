import { useMutation } from '@tanstack/react-query'
import base64 from 'base-64'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Image, TouchableOpacity } from 'react-native'
import Sound from 'react-native-sound'
import { confirmGameResult, fetchGameResult } from '../../../../api/game'
import useToaster from '../../../../hooks/useToaster'
import appAudios from '../../../../resource/audio'
import CView from '../../../common/core/View'
import RewardCards from '../UI/RewardCards'
import styles from './style'

const defaultConfig = {
  rotate: 0,
  timer: 4,
  rounds: 5,
  totalSlots: 4,
  wheelBoxSize: 300,
  spinBtnSize: 100,
  audioUrl: appAudios.spinWheel
}

const SpinWheel = ({ gameConfig, handleGameClose }) => {
  const [config, setConfig] = useState({
    ...defaultConfig,
    rotate: defaultConfig.rotate,
    timer: defaultConfig.timer,
    rounds: defaultConfig.rounds,
    totalSlots: defaultConfig.totalSlots,
    ...gameConfig
  })

  const [isBtnClicked, setIsBtnClicked] = useState(false)

  const [txnId, setTxnId] = useState(null)

  const [rewards, setRewards] = useState({ showRewards: false, data: {} })

  const spinValue = useRef(new Animated.Value(0)).current

  const [audioPlayer, setAudioPlayer] = useState(null)

  const spinBtnPos = useMemo(
    () => ({
      top: config.wheelBoxSize / 2 - config.spinBtnSize / 2,
      left: config.wheelBoxSize / 2 - config.spinBtnSize / 2
    }),
    [config.spinBtnSize, config.wheelBoxSize]
  )

  const { showToaster } = useToaster()

  const calcRotatingAngle = useCallback(
    winSlot => {
      const slotAngle = 360 / config.totalSlots

      const rotatingAngle = slotAngle * (config.totalSlots - winSlot + 1)

      return rotatingAngle
    },
    [config.totalSlots]
  )

  const { mutate: getSpinResult } = useMutation(
    () => fetchGameResult(config?.gameId),
    {
      onSuccess: ({ data }) => {
        const gameData = data?.data

        if (!gameData) {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: gameData.message,
            position: 'top'
          })
          handleGameClose()
        }
        const winSlot = gameData.winningSlot

        setConfig(state => ({ ...state, rotate: calcRotatingAngle(winSlot) }))

        const decodedRewards = base64.decode(gameData.rewards)
        const decryptedRewards = JSON.parse(decodedRewards)
        console.log('decryptedRewards=====>', decryptedRewards)
        setRewards(state => ({ ...state, data: decryptedRewards[0] }))

        setTxnId(gameData.resultId)
      },
      onError: err => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data.message,
          position: 'top'
        })
        handleGameClose()
      }
    }
  )

  const { mutate: confirmGameResultAPI } = useMutation(
    () => confirmGameResult(txnId),
    {
      onSuccess: ({ data }) => {
        setTimeout(() => {
          setRewards(state => ({ ...state, showRewards: true }))
        }, 500)
      },
      onError: err => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: err.response.data.message,
          position: 'top'
        })
      }
    }
  )

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * config.rounds + config.rotate}deg`]
  })

  const handleSpin = () => {
    if (isBtnClicked) {
      return
    }
    setIsBtnClicked(true)

    audioPlayer.play(success => {
      if (success) {
        console.log('Audio played successfully')
      } else {
        console.log('Error playing audio')
      }
    })

    getSpinResult()

    Animated.timing(spinValue, {
      toValue: 1,
      duration: config.timer * 1000,
      easing: Easing.bezier(0.42, 0, 0.58, 1),
      useNativeDriver: true
    }).start(() => {
      confirmGameResultAPI()
    })
  }

  useEffect(() => {
    if (config.audioUrl) {
      const audio = new Sound(config.audioUrl, '', error => {
        if (error) {
          setAudioPlayer(null)
        }
      })
      setAudioPlayer(audio)
    }
  }, [config.audioUrl])

  return (
    <CView style={styles.wrapper}>
      <CView style={{}}>
        <CView>
          <Animated.Image
            source={{ uri: config?.layoutSrc }}
            style={{
              width: config.wheelBoxSize,
              height: config.wheelBoxSize,
              transform: [{ rotate: spin }]
            }}
          />
        </CView>
        <TouchableOpacity
          disabled={isBtnClicked}
          onPress={handleSpin}
          style={{
            position: 'absolute',
            top: spinBtnPos.top,
            left: spinBtnPos.left
          }}>
          <Image
            source={{ uri: config?.spinButtonUrl }}
            style={{ width: config.spinBtnSize, height: config.spinBtnSize }}
          />
        </TouchableOpacity>
      </CView>

      {!!rewards.showRewards && (
        <RewardCards
          as={rewards.data.type}
          isVisible={rewards.showRewards}
          handleClose={handleGameClose}
          rewardsConfig={rewards.data}
        />
      )}
    </CView>
  )
}

export default SpinWheel
