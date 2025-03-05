import React from 'react'
import { Image, TouchableOpacity } from 'react-native'
import appImages from '../../../../../../resource/images'
import CText from '../../../../core/Text'
import CView from '../../../../core/View'
import styles from './style'

const MainControls = ({
  playerProps,
  handlePreviousPress,
  togglePlayPause,
  handleNextPress,
  config = {}
}) => {
  return (
    <CView style={styles.mainControlsContainer}>
      <CView
        pointerEvents="none"
        style={{ ...styles.controlButton, opacity: 0 }}>
        <TouchableOpacity onPress={handlePreviousPress}>
          <CText>P</CText>
        </TouchableOpacity>
      </CView>

      <CView style={styles.controlButton}>
        <TouchableOpacity onPress={togglePlayPause}>
          <Image
            source={
              playerProps.paused
                ? appImages.playerPlayIcon
                : appImages.playerPauseIcon
            }
            style={{ ...styles.controlButtonIcon, width: 38, height: 38 }}
          />
        </TouchableOpacity>
      </CView>

      <CView style={styles.controlButton}>
        <TouchableOpacity onPress={handleNextPress}>
          <Image
            source={appImages.playerNextIcon}
            style={styles.controlButtonIcon}
          />
        </TouchableOpacity>
      </CView>
    </CView>
  )
}

export default MainControls
