import React, { memo, useState } from 'react'
import { Image, LayoutAnimation, Pressable } from 'react-native'
import appImages from '../../../../resource/images'
import { convertUSDtoINR, formatDate } from '../../../../utils/common'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './style'

const TransactionList = ({ item, index, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isSuccess = item?.paymentStatus == 'SUCCESS'
  let status = isSuccess ? 'Completed' : 'Failed'
  let statusTextColor = isSuccess ? '#48B16E' : '#FB3836'

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  const styles = getStyles(theme)
  return (
    <Pressable onPress={toggleExpansion}>
      <CView style={styles.transactionContainer}>
        <CView row>
          <CView row style={styles.itemCenter}>
            <CView style={styles.iconContainer}>
              <Image source={{ uri: item?.icon }} style={styles.iconStyle} />
            </CView>
            <CView style={styles.textContainer}>
              <CView row>
                <CText
                  size="normal"
                  numberOfLines={1}
                  style={styles.labelStyle}>
                  {item?.txnLabel}
                </CText>
                <CView style={styles.itemCenter} />
                <CView row style={styles.rightAlignedItem}>
                  {item?.txnMode == 'coin' ? (
                    <CView>
                      <CView row>
                        <Image
                          source={appImages.coin}
                          style={styles.coinStyle}
                        />
                        <CText size="normal">
                          {item?.txnType == 'credit' ? '+' : '-'}
                        </CText>
                        <CText size="normal">{item?.amount}</CText>
                      </CView>
                    </CView>
                  ) : item?.txnMode == 'ioutoken' ? (
                    <CView>
                      <CView row>
                        <Image
                          source={appImages.xFanTvTokenIcon}
                          style={styles.coinStyle}
                        />
                        <CText size="normal">
                          {item?.txnType == 'credit' ? '+' : '-'}
                        </CText>
                        <CText size="normal">{item?.amount}</CText>
                      </CView>
                    </CView>
                  ) : (
                    <CView row>
                      <CText size="normal" style={styles.textNormal}>
                        {item?.txnType == 'credit' ? '+ ' : '- '}
                      </CText>
                      <CText size="normal">
                        {convertUSDtoINR(item?.amount)}
                      </CText>
                    </CView>
                  )}
                  <Image
                    source={appImages.arrowDownIcon}
                    style={
                      isExpanded
                        ? styles.revArrowIconStyle
                        : styles.arrowIconStyle
                    }
                  />
                </CView>
              </CView>

              <CView row style={styles.padding5}>
                <CText size="small" style={styles.dateColor}>
                  {formatDate(item?.createdAt)}
                  {' | '}
                </CText>
                <CText style={{ ...styles.textNormal, color: statusTextColor }}>
                  {status}
                </CText>
              </CView>
            </CView>
          </CView>
        </CView>

        {isExpanded && (
          <CView>
            {item?.keyValue?.map((item, idx) => (
              <CView row key={idx} style={styles.detailContainer}>
                <CText>{item?.key}</CText>
                <CText style={styles.maxWidthRightItem} numberOfLines={1}>
                  {item?.value}
                </CText>
              </CView>
            ))}
          </CView>
        )}
      </CView>
    </Pressable>
  )
}

export default memo(TransactionList)
