import { useMutation } from '@tanstack/react-query'
import base64 from 'base-64'
import React, { useState } from 'react'
import { Image } from 'react-native'
import { SvgUri } from 'react-native-svg'
import { ScratchCard as RNScratchCard } from 'rn-scratch-card'
import { fetchGameResult } from '../../../../api/game'
import useToaster from '../../../../hooks/useToaster'
import appImages from '../../../../resource/images'
import CView from '../../../common/core/View'
import ScratchRewardCard from './ScratchReward'
import styles from './style'

const defaultConfig = { threshold: 50 }

const ScratchCard = ({ gameConfig, handleGameClose, handleCloseBtnMode }) => {
  console.log('🚀 ~ ScratchCard ~ gameConfig:', gameConfig)
  const config = { ...defaultConfig, ...gameConfig }
  const gameId = config.gameId

  const [isScratching, setIsScratching] = useState(false)
  const [isScratched, setIsScratched] = useState(false)

  const [rewards, setRewards] = useState({ showRewards: false, data: {} })

  const { showToaster } = useToaster()

  const { mutate: fetchGameResultAPI } = useMutation(
    obj => fetchGameResult(obj),
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

        setRewards({ showRewards: true, data: decryptedRewards[0] })
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

  const handleScratch = value => {
    if (!isScratching) {
      if (!!gameConfig?.subGameId) {
        let obj = { gameId: gameId, subGameId: gameConfig?.subGameId }
        fetchGameResultAPI(obj)
      } else {
        let obj = { gameId: gameId }
        fetchGameResultAPI(obj)
      }
    }
    setIsScratching(true)

    if (value > defaultConfig.threshold) {
      setIsScratched(true)
      // handleCloseBtnMode('dark')
    }
  }

  return (
    <CView style={styles.wrapper}>
      {isScratched && rewards.showRewards && (
        <CView style={styles.cardRewardLogoSlot}>
          {rewards.data.metaData.logo.includes('.svg') ? (
            <SvgUri uri={rewards.data.metaData.logo} width={50} height={50} />
          ) : (
            <Image
              source={{
                uri: rewards.data.metaData.logo || appImages.gameIconLogo
              }}
              style={styles.logoIcon}
            />
          )}
        </CView>
      )}
      {isScratching && rewards.showRewards && (
        <CView style={styles.rewardCardWrapper}>
          <ScratchRewardCard gameConfig={config} rewardsConfig={rewards.data} />
        </CView>
      )}
      {!isScratched && (
        <RNScratchCard
          source={appImages.scratchCardLayout}
          brushWidth={50}
          onScratch={handleScratch}
          style={styles.scratchCard}
        />
      )}
    </CView>
  )
}

export default ScratchCard
