import React, { memo, useState } from 'react'
import { Image, LayoutAnimation, Pressable } from 'react-native'
import getStyles from './style'
import appImages from '../../../../../../resource/images'
import CView from '../../../../../common/core/View'
import CText from '../../../../../common/core/Text'
import {
  convertUSDtoINR,
  dollarToInrWithRupeeSign,
  formatDate
} from '../../../../../../utils/common'
import { useTheme } from '@react-navigation/native'

const OrderHistoryCard = ({ item, index, handleCancelOrder }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const { mode } = useTheme()
  const styles = getStyles(mode)

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  const getStatus = item => {
    if (item.status == 'PARTIAL_SUCCESS') {
      return { label: 'Partial Success', color: '#DCA048' }
    } else if (item.status == 'SUCCESS') {
      return { label: 'Completed', color: '#48B16E' }
    } else if (item.status == 'PENDING') {
      return { label: 'Pending', color: '#DCA048' }
    } else if (item.status == 'CANCELLED' && item.executedQuantity > 0) {
      return { label: 'Partially Cancelled', color: '#48B16E' }
    } else if (item.status == 'CANCELLED') {
      return { label: 'Cancelled', color: '#FB3836' }
    } else if (item.status == 'FAILED') {
      return { label: 'Failed', color: '#FB3836' }
    } else {
      return { label: 'Pending', color: '#DCA048' }
    }
  }

  return (
    <Pressable onPress={toggleExpansion}>
      <CView style={styles.transactionContainer}>
        <CView row>
          <CView row style={styles.itemCenter}>
            <Image
              source={{ uri: item?.tierDetails?.defaultImageUrl }}
              style={styles.iconStyle}
            />
            <CView style={styles.textContainer}>
              <CText size="normal" numberOfLines={1}>
                {item?.tierDetails?.tierName}
              </CText>
              <CView row>
                <CText size="small" style={styles.dateColor}>
                  {formatDate(item?.createdAt)}
                  {' | '}
                </CText>
                <CText
                  style={{
                    ...styles.textNormal,
                    color: getStatus(item).color
                  }}>
                  {getStatus(item)?.label}
                </CText>
              </CView>
            </CView>
          </CView>

          <CView row centered style={styles.rightAlignedItem}>
            <CView row>
              <CText>
                {item?.orderInfo?.totalTokenAmount
                  ? dollarToInrWithRupeeSign(item?.orderInfo?.totalTokenAmount)
                  : '-'}
              </CText>
            </CView>
            <Image
              source={appImages.arrowDownIcon}
              style={
                isExpanded ? styles.revArrowIconStyle : styles.arrowIconStyle
              }
            />
          </CView>
        </CView>

        {isExpanded && (
          <CView>
            <CView style={styles.detailContainer}>
              {(item?.status == 'PENDING' ||
                item?.status == 'PARTIAL_SUCCESS') && (
                <Pressable onPress={() => handleCancelOrder(item?.orderId)}>
                  <CText style={styles.cancelOrder}>Cancel Order</CText>
                </Pressable>
              )}
              <CView row style={styles.detailContainer}>
                <CText>Order ID</CText>
                <CText align="right">{item?.orderId}</CText>
              </CView>

              <CView row style={styles.detailContainer}>
                <CText>Date/Time</CText>
                <CText align="right">{formatDate(item?.createdAt)}</CText>
              </CView>

              <CView row style={styles.detailContainer}>
                <CText>Order Type</CText>
                <CText align="right">
                  {item?.side} {item?.orderType}
                </CText>
              </CView>

              {(item?.status == 'SUCCESS' ||
                (item?.status == 'CANCELLED' && !item?.executedQuantity) ||
                item?.status == 'PENDING') && (
                <CView row style={styles.detailContainer}>
                  <CText>Quantity</CText>
                  <CText align="right">{item?.quantity}</CText>
                </CView>
              )}

              {(item?.status == 'PARTIAL_SUCCESS' ||
                (item?.status == 'CANCELLED' &&
                  item?.executedQuantity > 0)) && (
                <>
                  <CView row style={styles.detailContainer}>
                    <CText>Requested Quantity</CText>
                    <CText align="right">{item?.quantity}</CText>
                  </CView>
                  <CView row style={styles.detailContainer}>
                    <CText>Success Quantity</CText>
                    <CText align="right">{item?.executedQuantity}</CText>
                  </CView>
                </>
              )}

              {item?.status == 'PARTIAL_SUCCESS' && (
                <CView row style={styles.detailContainer}>
                  <CText>Pending Quantity</CText>
                  <CText align="right">
                    {item?.quantity - item?.executedQuantity}
                  </CText>
                </CView>
              )}
              {item?.status == 'CANCELLED' && item?.executedQuantity > 0 && (
                <CView row style={styles.detailContainer}>
                  <CText>Cancelled Quantity</CText>
                  <CText align="right">
                    {item?.quantity - item?.executedQuantity}
                  </CText>
                </CView>
              )}

              {!!item?.price && (
                <CView row style={styles.detailContainer}>
                  <CText>Limit Price</CText>
                  <CText align="right">{convertUSDtoINR(item?.price)}</CText>
                </CView>
              )}

              {(item?.status == 'SUCCESS' ||
                item?.status == 'PARTIAL_SUCCESS' ||
                (item?.status == 'CANCELLED' &&
                  item?.executedQuantity > 0)) && (
                <CView row style={styles.detailContainer}>
                  <CText>{item?.orderType} Price</CText>
                  <CText align="right">
                    {item.status == 'PARTIAL_SUCCESS' ||
                    item?.executedQuantity > 0
                      ? convertUSDtoINR(
                          item?.orderInfo?.totalTokenAmount /
                            item?.executedQuantity
                        )
                      : convertUSDtoINR(
                          item?.orderInfo?.totalTokenAmount / item?.quantity
                        )}
                  </CText>
                </CView>
              )}

              {(item?.status == 'PARTIAL_SUCCESS' ||
                item?.status == 'SUCCESS' ||
                (item.status == 'CANCELLED' && item.executedQuantity > 0)) && (
                <CView row style={styles.detailContainer}>
                  {item.orderType == 'BUY' ? (
                    <CText>Amount Paid</CText>
                  ) : (
                    <CText>Amount Received</CText>
                  )}
                  <CText align="right">
                    {item?.orderInfo?.totalTokenAmount
                      ? convertUSDtoINR(
                          item?.orderInfo?.totalTokenAmount ||
                            item?.orderInfo?.totalHoldAmount
                        )
                      : '-'}
                  </CText>
                </CView>
              )}

              {item.orderType == 'BUY' &&
                (item?.status == 'PARTIAL_SUCCESS' ||
                  item?.status == 'PENDING') && (
                  <CView row style={styles.detailContainer}>
                    <CText>Amount Hold</CText>
                    <CText align="right">
                      {item?.orderInfo?.totalHoldAmount
                        ? convertUSDtoINR(item?.orderInfo?.totalHoldAmount)
                        : '-'}
                    </CText>
                  </CView>
                )}

              <CView row style={styles.detailContainer}>
                <CText>Transaction Fee</CText>
                <CText align="right">0 </CText>
              </CView>
            </CView>
          </CView>
        )}
      </CView>
    </Pressable>
  )
}

export default memo(OrderHistoryCard)
