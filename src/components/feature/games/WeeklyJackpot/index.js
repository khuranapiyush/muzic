import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Image } from 'react-native'
import { fetchGameResult } from '../../../../api/game'
import useToaster from '../../../../hooks/useToaster'
import appImages from '../../../../resource/images'
import CButton from '../../../common/core/Button'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import styles from './style'

const WeeklyJackpot = ({ gameConfig, handleGameClose }) => {
  const gameId = gameConfig.gameId

  const [rewards, setRewards] = useState({ showRewards: false, data: {} })

  const [isBtnClicked, setIsBtnClicked] = useState(false)

  const { showToaster } = useToaster()

  const { mutate: fetchGameResultAPI, isLoading } = useMutation(
    () => fetchGameResult(gameId),
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
    fetchGameResultAPI()
  }
  return (
    <CView style={styles.wrapper}>
      <CView style={styles.contentWrapper}>
        <Image
          source={appImages.thumbsUpGameIcon}
          style={styles.thumbsUpIcon}
        />
        <CText style={styles.wohooText}>Wohoo!</CText>
        <CText style={styles.titleText}>
          {gameConfig.title ||
            'Click Confirm to participate in FanTV weekly lucky draw!'}
        </CText>

        <CView style={styles.coinWrapper}>
          <Image source={appImages.coin} style={styles.coinIcon} />
          <CText style={styles.coinValue}>{gameConfig.entryFee}</CText>
        </CView>

        <CText style={styles.descriptionText}>
          {gameConfig.description ||
            'Winner will be announced on every Thursday.'}
        </CText>

        <CButton
          onPress={handlePlayGame}
          size="large"
          buttonType="primary"
          text={rewards.showRewards ? 'Confirmed' : 'Confirm'}
          isGradientButton
          isLoading={isLoading}
          customStyles={{
            buttonTextStyles: { fontSize: 14, fontWeight: '700' }
          }}
        />
      </CView>
    </CView>
  )
}

export default WeeklyJackpot
