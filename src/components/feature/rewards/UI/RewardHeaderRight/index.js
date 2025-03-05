import { useNavigation, useTheme } from '@react-navigation/native'
import React, { useCallback, useEffect } from 'react'
import { Image, Pressable, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import useModal from '../../../../../hooks/useModal'
import useMqtt from '../../../../../hooks/useMqtt'
import ROUTE_NAME from '../../../../../navigator/config/routeName'
import appImages from '../../../../../resource/images'
import { useAuthUser } from '../../../../../stores/selector'
import { updateWalletStats } from '../../../../../stores/slices/walletStats'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import LinearGradient from 'react-native-linear-gradient'
import { getCoinsInMn } from '../../../../../utils/common'
import getStyles from './style'

const RewardHeaderRight = ({ showHistory = { showHistory: true } }) => {
  const { userId } = useSelector(state => state.user)
  const { fantigerCoin: fanTvCoin } = useSelector(state => state.walletStats)
  const { isLoggedIn } = useSelector(useAuthUser)

  const navigation = useNavigation()

  const { subscribeToTopic, unsubscribeFromTopic } = useMqtt()

  const { showModal, hideModal } = useModal()

  const dispatch = useDispatch()

  const { mode } = useTheme()
  const styles = getStyles(mode)

  const handleCoinPress = () => {
    if (isLoggedIn) {
      navigation.navigate(ROUTE_NAME.Wallet)
    } else {
      showModal('auth', {
        isVisible: true,
        onClose: () => hideModal('auth'),
        navigationData: { redirectToPath: ROUTE_NAME.Wallet }
      })
    }
  }

  const handleHistoryClick = () => {
    if (isLoggedIn) {
      navigation.push(ROUTE_NAME.RewardHistory)
    } else {
      showModal('auth', {
        isVisible: true,
        onClose: () => hideModal('auth'),
        navigationData: { redirectToPath: ROUTE_NAME.RewardHistory }
      })
    }
  }

  const handleWalletBalanceChange = useCallback(
    data => {
      const updatedData = JSON.parse(data)

      dispatch(updateWalletStats(updatedData))
    },
    [dispatch]
  )

  useEffect(() => {
    if (userId) {
      subscribeToTopic(
        `wallet-production/${userId}/get-wallet-balance`,
        handleWalletBalanceChange
      )
    }

    return () => {
      unsubscribeFromTopic(`wallet-production/${userId}/get-wallet-balance`)
    }
  }, [
    handleWalletBalanceChange,
    subscribeToTopic,
    unsubscribeFromTopic,
    userId
  ])

  return (
    <CView row style={styles.wrapper}>
      {showHistory && (
        <TouchableOpacity onPress={handleHistoryClick}>
          <CText size="smallBold" style={styles.historyStyle}>
            Check History
          </CText>
        </TouchableOpacity>
      )}
      {/* <CView style={styles.coinWrapper}>
        <Pressable style={styles.coinBtnWrapper} onPress={handleCoinPress}>
          <Image source={appImages.coin} style={styles.coinIcon} />
          <CText style={styles.coinValue}>{fanTvCoin}</CText>
        </Pressable>
      </CView> */}
      <CView>
        <LinearGradient
          colors={['#F8F8F8', '#E6E6E6']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.xFanTVcoinWrapper}>
          <Pressable style={styles.coinBtnWrapper} onPress={handleCoinPress}>
            <Image source={appImages.coin} style={styles.coinIcon} />
            <CText style={styles.coinValue}>{getCoinsInMn(fanTvCoin)}</CText>
          </Pressable>
        </LinearGradient>
      </CView>
    </CView>
  )
}

export default RewardHeaderRight
