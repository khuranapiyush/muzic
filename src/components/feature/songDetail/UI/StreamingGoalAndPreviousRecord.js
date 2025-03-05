import React, { useEffect, useState } from 'react'
import { Image, StyleSheet } from 'react-native'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import appImages from '../../../../resource/images'
import { dollarToInrWithRupeeSign } from '../../../../utils/common'
import { Divider } from 'react-native-elements'

const getStyles = theme => {
  return StyleSheet.create({
    text: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '400'
    },
    readButton: {
      alignSelf: 'flex-end',
      color: '#E14084',
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '400'
    },
    btnStyle: {
      width: '80%',
      height: 60,
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: '#D66393',
      paddingVertical: 8,
      paddingHorizontal: 10
    },
    iconStyle: {
      width: 25,
      height: 25,
      marginRight: 5
    },
    width50: {
      width: '50%'
    },
    marginTop30: {
      marginTop: 30
    },
    marginTopBottom30: {
      marginVertical: 20
    }
  })
}

const StreamingGoalAndPreviousRecord = ({
  tradingRoyaltyShare,
  buyPrice,
  roi,
  theme
}) => {
  const [streamGoal, setStreamingGoal] = useState(0)

  const styles = getStyles(theme)

  useEffect(() => {
    const price = buyPrice * 80 * 1.5
    const revShare = 0.04 * (tradingRoyaltyShare / 100)
    const totalValue = price / revShare
    setStreamingGoal(Math.round((totalValue / 1000000) * 1e2) / 1e2)
  }, [tradingRoyaltyShare, buyPrice])

  return (
    <CView style={{ marginTop: 10 }}>
      <CView row>
        <CView row centered style={styles.width50}>
          <Image source={appImages.music} style={styles.iconStyle} />
          <CView>
            <CText>Streaming Goal for</CText>
            <CText>1.5x Royalty Return</CText>
          </CView>
        </CView>
        <CView centered style={styles.width50}>
          <CView style={styles.btnStyle}>
            <CText size="largeBold">{streamGoal}</CText>
            <CText size="small">Million Streams</CText>
          </CView>
        </CView>
      </CView>
      <Divider style={styles.marginTopBottom30} />
      <CView row>
        <CView row centered style={styles.width50}>
          <Image source={appImages.music} style={styles.iconStyle} />
          <CView>
            <CText>Previous Record</CText>
            <CText>For Similar Song</CText>
          </CView>
        </CView>
        <CView centered style={styles.width50}>
          <CView style={styles.btnStyle}>
            <CText size="largeBold">{roi}x</CText>
          </CView>
        </CView>
      </CView>

      <CView row style={styles.marginTop30}>
        <CView centered style={styles.width50}>
          <CView>
            <CText>Current Price</CText>
            <CText centered size="mediumBold">
              {dollarToInrWithRupeeSign(buyPrice)}
            </CText>
          </CView>
        </CView>
        <CView centered style={styles.width50}>
          <CView>
            <CText>Royalty Share</CText>
            <CText centered size="mediumBold">
              {tradingRoyaltyShare}%
            </CText>
          </CView>
        </CView>
      </CView>
    </CView>
  )
}

export default StreamingGoalAndPreviousRecord
