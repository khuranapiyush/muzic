import React from 'react'
import { Image, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import appImages from '../../../../../../resource/images'
import { setMiniModePlayer } from '../../../../../../stores/slices/watch'
import CText from '../../../../core/Text'
import CView from '../../../../core/View'
import { useTheme } from '@react-navigation/native'
import Colors from '../../../../Colors'
import LinearGradient from 'react-native-linear-gradient'
import getStyles from './style'

const TopControls = ({ isFullScreen, toggleFullScreen }) => {
  const { fantigerCoin: fanTvCoin } = useSelector(state => state.walletStats)
  const { isShowFeature } = useSelector(state => state.app)
  const { mode } = useTheme()

  const dispatch = useDispatch()

  const handleMiniPlayerMode = () => {
    if (isFullScreen) {
      toggleFullScreen()
    } else {
      dispatch(setMiniModePlayer())
    }
  }

  const styles = getStyles(mode)

  return (
    <CView style={[styles.topControlsContainer]}>
      <CView style={styles.controlButton}>
        <TouchableOpacity onPress={handleMiniPlayerMode}>
          <Image
            source={
              !isFullScreen ? appImages.arrowDownIcon : appImages.arrowLeftIcon
            }
            style={{
              ...styles.controlButtonIcon,
              tintColor: Colors[mode].white
            }}
          />
        </TouchableOpacity>
      </CView>
      {isShowFeature && (
        <CView row>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.5)', 'rgba(153, 153, 153, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.coinWrapper}>
            <CView row>
              <Image source={appImages.coin} style={styles.coinIcon} />
              <CText
                style={{
                  ...styles.coinValue,
                  color: Colors[mode].white
                }}>
                {fanTvCoin}
              </CText>
            </CView>
          </LinearGradient>
        </CView>
      )}
    </CView>
  )
}

export default TopControls
