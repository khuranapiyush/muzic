import React, { memo } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import appImages from '../../../../../../resource/images'
import { screenHeight } from '../../../../../../utils/common'
import CText from '../../../../core/Text'
import CView from '../../../../core/View'
import styles from './style'

const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

const BottomControls = ({
  isLiveStream,
  playerProps,
  progress,
  duration,
  toggleMute,
  toggleFullScreen
}) => {
  const insets = useSafeAreaInsets()

  return (
    <CView
      style={[
        styles.bottomControlsContainer,
        !!playerProps.isFullScreen && {
          width: `${100 - ((insets.left + insets.right) / screenHeight) * 100}%`
        }
      ]}>
      {isLiveStream ? (
        <CView row style={styles.liveStreamContainer}>
          <CView
            style={{
              backgroundColor: '#F00',
              width: 8,
              height: 8,
              borderRadius: 50,
              marginRight: 4
            }}
          />
          <CText style={{ color: '#FFF', fontSize: 12, fontWeight: '500' }}>
            LIVE
          </CText>
        </CView>
      ) : (
        <CView row style={styles.durationContainer}>
          <CText style={{ color: 'white' }}>
            {formatTime(progress?.currentTime || 0)} / {formatTime(duration)}
          </CText>
        </CView>
      )}

      <CView row style={styles.controlsContainer}>
        {/* <CView style={styles.controlButton}>
          <TouchableOpacity onPress={toggleMute}>
            <Image
              source={
                playerProps.muted
                  ? appImages.playerUnMuteIcon
                  : appImages.playerMuteIcon
              }
              style={{ ...styles.controlButtonIcon }}
            />
          </TouchableOpacity>
        </CView> */}

        <CView style={styles.controlButton}>
          <TouchableOpacity onPress={toggleFullScreen}>
            <Image
              source={
                playerProps.isFullScreen
                  ? appImages.playerFullScreenIcon
                  : appImages.playerFullScreenIcon
              }
              style={{ ...styles.controlButtonIcon }}
            />
          </TouchableOpacity>
        </CView>

        {/* <CView style={styles.controlButton}>
          <TouchableOpacity>
            <Image
              source={appImages.playerSettingIcon}
              style={{ ...styles.controlButtonIcon }}
            />
          </TouchableOpacity>
        </CView> */}
      </CView>
    </CView>
  )
}

export default memo(BottomControls)
