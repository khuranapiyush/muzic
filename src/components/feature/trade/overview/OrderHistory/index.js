import { useMutation } from '@tanstack/react-query'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import { Colors } from '../../../../common/core/colors'
import style from './style'
import { get } from '../../../../../utils/common'
import OrderHistoryCard from '../UI/OrderHistoryCard'
import { cancelOrder, fetchOrderHistory } from '../../../../../api/trade'
import { useSelector } from 'react-redux'
import useModal from '../../../../../hooks/useModal'
import { useAuthUser } from '../../../../../stores/selector'
import styles from './style'
import CButton from '../../../../common/core/Button'
import ROUTE_NAME from '../../../../../navigator/config/routeName'
import { useIsFocused } from '@react-navigation/native'
import ConfirmDialogBox from '../../../../common/Modal/ConfirmBox'
import useToaster from '../../../../../hooks/useToaster'

const OrderHistory = () => {
  const vdRef = useRef()
  const { isLoggedIn } = useSelector(useAuthUser)
  const { showModal, hideModal } = useModal()
  const focused = useIsFocused()

  const { showToaster } = useToaster()
  const [refreshing, setRefreshing] = useState(false)
  const [onEndReachedDuringMomentum, setOnEndReachedDuringMomentum] =
    useState(false)

  const [isConfirmBoxOpen, setIsConfirmBoxOpen] = useState(false)
  const [orderId, setOrderId] = useState('')

  const [orderHistory, setOrderHistory] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const { mutate: getOrderHistory } = useMutation(
    () => fetchOrderHistory(page),
    {
      onSuccess: ({ data }) => {
        const orders = get(data, 'data.results', [])
        if (page > 1) {
          setOrderHistory([...orderHistory, ...orders])
        } else {
          setOrderHistory(orders)
        }
        setIsLoading(false)
        setRefreshing(false)
      },
      onError: error => {
        setIsLoading(false)
      }
    }
  )

  useEffect(() => {
    if (focused) {
      // setPage(1)
      setIsLoading(true)
      getOrderHistory()
    }
  }, [getOrderHistory, page, focused])

  const keyExtractor = (item, index) => item?._id + index.toString()

  const renderItem = useCallback(
    ({ item, index }) => (
      <CView>
        <CView style={style.itemSeparator}>
          <OrderHistoryCard
            item={item}
            index={index}
            handleCancelOrder={handleCancelOrderBtn}
          />
        </CView>
      </CView>
    ),
    [handleCancelOrderBtn]
  )

  const handleReachEnd = useCallback(() => {
    if (!onEndReachedDuringMomentum) {
      setOnEndReachedDuringMomentum(true)
      setPage(page + 1)
    }
  }, [onEndReachedDuringMomentum, page])

  const handleScrollStart = useCallback(() => {
    setOnEndReachedDuringMomentum(false)
  }, [])

  const handleLogin = useCallback(() => {
    showModal('auth', {
      isVisible: true,
      onClose: () => hideModal('auth'),
      navigationData: { redirectToPath: ROUTE_NAME.Trade }
    })
  }, [hideModal, showModal])

  const handleCancelOrder = () => {
    handleCancelOrderApi()
  }
  const handleNo = () => {
    setIsConfirmBoxOpen(false)
  }

  const handleCancelOrderBtn = useCallback(id => {
    setOrderId(id)
    setIsConfirmBoxOpen(true)
  }, [])

  const { mutate: handleCancelOrderApi } = useMutation(
    () => cancelOrder(orderId),
    {
      onSuccess: ({ data }) => {
        showToaster({
          type: 'success',
          text1: 'Success',
          text2: 'Order Canceled Successfully!'
        })
        getOrderHistory()
        setIsConfirmBoxOpen(false)
      },
      onError: error => {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: error?.response?.data?.message
        })
        setIsConfirmBoxOpen(false)
      }
    }
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setPage(1)
    setTimeout(() => {
      getOrderHistory()
    }, 500)
  }, [getOrderHistory])

  return (
    <CView>
      {isLoggedIn ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={orderHistory}
          extraData={orderHistory}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReached={handleReachEnd}
          bounces={true}
          ref={vdRef}
          onMomentumScrollBegin={handleScrollStart}
          ListFooterComponent={
            isLoading && (
              <ActivityIndicator
                color={Colors.Palette.brandPink}
                size={'large'}
              />
            )
          }
          ListEmptyComponent={
            !isLoading && (
              <CText centered style={style.loadingStyle} size="normal">
                You don't have placed any order.
              </CText>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor={Colors.Palette.brandPink}
              onRefresh={onRefresh}
            />
          }
        />
      ) : (
        <CView centered style={styles.loginWrapper}>
          <CText>Please Login to</CText>
          <CText> view order history</CText>
          <CView style={styles.btnContainer}>
            <CButton
              size="large"
              buttonType="primary"
              text="Login"
              isGradientButton
              onPress={handleLogin}
              customStyles={{ buttonTextStyles: styles.submitBtn }}
            />
          </CView>
        </CView>
      )}
      {isConfirmBoxOpen && (
        <ConfirmDialogBox
          isOpen={isConfirmBoxOpen}
          labelNo="NO"
          labelYes="Yes, Cancel"
          handleYes={handleCancelOrder}
          handleNo={handleNo}
          title="Are you sure you want to cancel your order ?"
          handleClose={handleNo}
        />
      )}
    </CView>
  )
}

export default OrderHistory
