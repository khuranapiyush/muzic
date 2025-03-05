import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import { fetchGameResult } from '../../../../api/game'
import useToaster from '../../../../hooks/useToaster'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import styles from './style'

const CoinToCash = ({ gameConfig, handleGameClose }) => {
  const gameId = gameConfig.gameId

  const [rewards, setRewards] = useState({ showRewards: false, data: {} })

  const [isBtnClicked, setIsBtnClicked] = useState(false)

  const { showToaster } = useToaster()

  const { mutate: fetchGameResultAPI, isLoading } = useMutation(
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

        setRewards({ showRewards: true, data: {} })
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

  const handlePlayGame = () => {
    if (rewards.showRewards) {
      handleGameClose()
      return
    }

    if (isBtnClicked) {
      return
    }

    setIsBtnClicked(true)

    if (!!gameConfig?.subGameId) {
      let obj = { gameId: gameId, subGameId: gameConfig?.subGameId }
      fetchGameResultAPI(obj)
    } else {
      let obj = { gameId: gameId }
      fetchGameResultAPI(obj)
    }
  }

  return (
    <CView style={styles.wrapper}>
      <CView style={styles.contentWrapper}>
        <CText style={styles.coinToCashText}>Coins To Cash</CText>

        <CView style={styles.coinLogoWrapper}>
          <Image
            source={gameConfig.logo || appImages.gameCoinToCash}
            style={styles.coinLogo}
          />
        </CView>
        <CView style={styles.descriptionWrapper}>
          <CText centered style={styles.descriptionTextWrapper}>
            <CText style={styles.amountText}>
              {'\u20B9'}
              {gameConfig.amount || 10}
            </CText>
            {` ${gameConfig.description}` ||
              'will be credited to your verified bank account in 24 hours'}
          </CText>
        </CView>

        <TouchableOpacity
          style={styles.btnWrapper}
          onPress={handlePlayGame}
          isLoading={isLoading}>
          <CText style={styles.btnText}>
            {!rewards.showRewards ? 'CASH OUT' : 'CASHED OUT'}
          </CText>
        </TouchableOpacity>
        <CView style={styles.assistText}>
          <CText>For assistance reach out to 📱+91 806 951 0565</CText>
        </CView>
      </CView>
    </CView>
  )
}

export default CoinToCash
