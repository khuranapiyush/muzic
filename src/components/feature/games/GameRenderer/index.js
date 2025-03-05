import React, { useCallback, useEffect, useState } from 'react'
import { Image, SafeAreaView, TouchableOpacity } from 'react-native'
import Modal from 'react-native-modal'
import appImages from '../../../../resource/images'
import { screenHeight } from '../../../../utils/common'
import CView from '../../../common/core/View'
import CoinToCash from '../CoinToCash'
import ScratchCard from '../ScratchCard'
import SlotMachine from '../SlotMachine'
import SpinWheel from '../SpinWheel'
import WeeklyJackpot from '../WeeklyJackpot'
import styles from './style'

const gameMapping = {
  spinWheel: {
    component: SpinWheel,
    showSwipeDirection: true,
    shouldHandleBackDropPress: true,
    closeBtnMode: 'dark'
  },
  slotMachine: {
    component: SlotMachine,
    shouldHandleBackDropPress: true,
    showSwipeDirection: true,
    closeBtnMode: 'dark'
  },
  scratchCard: {
    component: ScratchCard,
    closeBtnMode: 'dark',
    shouldHandleBackDropPress: true,
    showSwipeDirection: false
  },
  coinToCash: {
    component: CoinToCash,
    showSwipeDirection: true,
    shouldHandleBackDropPress: true,
    closeBtnMode: 'dark'
  },
  weeklyJackpot: {
    component: WeeklyJackpot,
    showSwipeDirection: true,
    shouldHandleBackDropPress: true,
    closeBtnMode: 'dark'
  }
  // matchPredictor: MatchPredictor,
}

const GameRenderer = ({
  isVisible,
  onClose,
  config = { type: 'custom' },
  gameConfig
}) => {
  const gameMappingConfig = gameMapping[gameConfig?.type]
  const Game = gameMappingConfig?.component
  const [closeBtnMode, setCloseBtnMode] = useState('dark')

  useEffect(() => {
    if (gameMappingConfig) {
      setCloseBtnMode(gameMappingConfig.closeBtnMode)
    }
  }, [gameMappingConfig])

  const handleClose = useCallback(() => {
    setCloseBtnMode('dark')
    onClose()
  }, [onClose])

  const handleCloseBtnMode = useCallback(mode => {
    setCloseBtnMode(mode)
  }, [])

  if (!Game) {
    return <></>
  }

  return (
    <Modal
      useNativeDriver={true}
      isVisible={isVisible}
      onBackdropPress={
        gameMappingConfig.shouldHandleBackDropPress ? onClose : null
      }
      onBackButtonPress={onClose}
      swipeDirection={!gameMappingConfig.showSwipeDirection ? [] : ['down']}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={config.type == 'max' ? false : true}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * (config.type == 'max' ? 1 : 0.5)
        }}>
        <CView style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Image
              source={appImages.closeIcon}
              style={{
                ...styles.closeIcon,
                ...(closeBtnMode === 'dark'
                  ? { tintColor: '#000' }
                  : { tintColor: '#fff' })
              }}
            />
          </TouchableOpacity>
          <Game
            showGame={isVisible}
            handleGameClose={handleClose}
            gameConfig={gameConfig?.metaData}
            // handleCloseBtnMode={handleCloseBtnMode}
          />
        </CView>
      </SafeAreaView>
    </Modal>
  )
}

export default GameRenderer
