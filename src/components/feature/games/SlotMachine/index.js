import { useMutation } from '@tanstack/react-query'
import base64 from 'base-64'
import React, { useCallback, useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import AutoHeightImage from 'react-native-auto-height-image'
import LinearGradient from 'react-native-linear-gradient'
import Sound from 'react-native-sound'
import {
  confirmGameResult,
  fetchGameResult,
  fetchGameRewards
} from '../../../../api/game'
import useToaster from '../../../../hooks/useToaster'
import appAudios from '../../../../resource/audio'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import RewardCards from '../UI/RewardCards'
import SlotBox from './SlotBox'
import styles from './style'

const defaultConfig = {
  rounds: 5,
  timer: 3,
  slotSizeCount: 3,
  audioUrl: appAudios.slotMachine
}

const slots = Array.from(
  { length: defaultConfig.slotSizeCount },
  (_, i) => i + 1
)

const shuffleSlots = arr => {
  let m = arr.length
  while (m) {
    const i = Math.floor(Math.random() * m--)
    ;[arr[m], arr[i]] = [arr[i], arr[m]]
  }
  return arr
}

const SlotMachine = ({ gameConfig, handleGameClose }) => {
  const slotsData = gameConfig.slotSrc

  const [isBtnClicked, setIsBtnClicked] = useState(false)

  const [txnId, setTxnId] = useState(null)

  const [slotHeight, setSlotHeight] = useState(0)

  const [rewards, setRewards] = useState({ showRewards: false, data: {} })

  const [config, setConfig] = useState({
    ...defaultConfig,
    slotConfig: {
      ...slots.reduce(
        (acc, curr, idx) => ({
          ...acc,
          [`slot${curr}`]: {
            rounds: defaultConfig.rounds + idx,
            position: 0,
            distance: 0,
            slotHeight: 0,
            modifiedSlotsData: shuffleSlots([
              ...[...slotsData].concat(
                Array.from(
                  { length: slotsData.length * (defaultConfig.rounds + idx) },
                  (_, i) => {
                    const mod = i % slotsData.length
                    return mod
                  }
                ).map((item, idx) => ({ ...slotsData[item], label: idx + 1 }))
              )
            ]),
            timer: defaultConfig.timer + idx / 2
          }
        }),
        {}
      )
    },
    ...gameConfig
  })

  const [audioPlayer, setAudioPlayer] = useState(null)

  const { showToaster } = useToaster()

  const { mutate: getRollingResult } = useMutation(
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
        const winSlot = gameData.result
        console.log('🚀 ~ file: index.js:93 ~ SlotMachine ~ winSlot:', winSlot)

        calculateDistance(winSlot)

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

  const { mutate: getGameRewards } = useMutation(
    () => fetchGameRewards(txnId),
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

        const decodedRewards = base64.decode(gameData.rewards)
        const decryptedRewards = JSON.parse(decodedRewards)
        console.log('decryptedRewards=====>', decryptedRewards)
        setRewards(state => ({ ...state, data: decryptedRewards[0] }))
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

  const handleSlotLayout = event => {
    setSlotHeight(event.nativeEvent.layout.height + 16)
  }

  const calculateDistance = winSlot => {
    const dictionary = Object.keys(winSlot).reduce((acc, curr) => {
      if (acc[winSlot[curr]]?.length) {
        acc[winSlot[curr]] = [...acc[winSlot[curr]], curr]
      } else {
        acc[winSlot[curr]] = [curr]
      }
      return acc
    }, {})

    let updatedSlotInfo = {}

    slotsData.forEach(item => {
      if (dictionary[item.id]) {
        updatedSlotInfo = {
          ...updatedSlotInfo,
          ...dictionary[item.id].reduce((acc, curr) => {
            return { ...acc, [curr]: { data: item } }
          }, {})
        }
      }
    })

    slots.forEach((slot, idx) => {
      const slotKey = `slot${idx + 1}`
      const slotsLength = config.slotConfig[slotKey].modifiedSlotsData.length
      const distance = slotHeight * (slotsLength - 1)

      setConfig(state => {
        const updatedConfig = {
          [slotKey]: {
            ...state.slotConfig[slotKey],
            distance: distance + (updatedSlotInfo[slotKey] ? slotHeight : 0),
            modifiedSlotsData: [
              ...config.slotConfig[slotKey].modifiedSlotsData,
              !!updatedSlotInfo[slotKey] && updatedSlotInfo[slotKey].data
            ],
            slotHeight
          }
        }

        return {
          ...state,
          slotConfig: { ...state.slotConfig, ...updatedConfig }
        }
      })
    })
  }

  const handlePlaySlot = () => {
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

    setConfig(prevConfig => ({
      ...prevConfig,
      isRolling: true
    }))

    getGameRewards()
  }

  const handleAnimationEnd = useCallback(() => {
    confirmGameResultAPI()
  }, [confirmGameResultAPI])

  useEffect(() => {
    getRollingResult()
  }, [getRollingResult])

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
      <CView style={styles.contentWrapper}>
        <AutoHeightImage source={{ uri: config.layoutSrc }} width={300} />
        <LinearGradient
          colors={['#3767e4', '#45bedf']}
          locations={[0, 1]}
          useAngle={true}
          angle={90}
          style={styles.slotContainer}>
          {slots.map(slotIdx => {
            return (
              <LinearGradient
                key={slotIdx}
                colors={['#f7b0ff', '#606eff']}
                locations={[0, 1]}
                useAngle={true}
                angle={93.2}
                style={{
                  ...styles.slotBoxGradientWrapper,
                  marginRight: slotIdx === config.slotSizeCount ? 0 : 10
                }}>
                <CView style={styles.slotBoxWrapper}>
                  <SlotBox
                    slotIdx={slotIdx}
                    config={config}
                    isRolling={config.isRolling}
                    handleSlotLayout={handleSlotLayout}
                    handleAnimationEnd={handleAnimationEnd}
                  />
                </CView>
              </LinearGradient>
            )
          })}
        </LinearGradient>
        <TouchableOpacity
          disabled={isBtnClicked}
          onPress={handlePlaySlot}
          style={styles.playBtnWrapper}>
          <LinearGradient
            colors={['#ffcf01', '#ff9f00']}
            locations={[0, 1]}
            useAngle={true}
            angle={184}
            style={styles.playBtn}>
            <CText style={styles.playText}>Play the slot</CText>
          </LinearGradient>
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

export default SlotMachine
