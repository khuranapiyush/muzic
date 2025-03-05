import React from 'react'
import { Image } from 'react-native'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import FTCoin from '../FTCoin'
import getStyles from './style'
import { numberWithComma } from '../../../../utils/common'

const CoinInfo = ({ page = 'earnCoin', coinEarn, coinBalance, theme }) => {
  const styles = getStyles(theme)

  return (
    <>
      {page == 'Wallet' ? (
        <CView row style={styles.walletCoinContainer}>
          <CView row centered>
            <CView style={styles.walletCoinIcon}>
              <Image source={appImages.coin} style={styles.coinStyle} />
            </CView>
            <CView style={styles.walletContent}>
              <CText
                size="normal"
                text="Coins Balance"
                style={styles.textStyle}
              />
              <CText
                centered
                size="mediumBold"
                text={numberWithComma(coinBalance)}
                style={styles.textStyle}
              />
            </CView>
          </CView>
        </CView>
      ) : (
        <CView row style={styles.levelContainer}>
          <CView>
            <CText size="normal">Yesterday’s Earning</CText>
            <CView style={styles.coinContainer}>
              <FTCoin coin={coinEarn?.coinEarnYesterday} />
            </CView>
          </CView>
          <CView>
            <CText size="normal">This Month Earning</CText>
            <CView style={styles.coinContainer}>
              <FTCoin coin={coinEarn?.coinEarnMonth} />
            </CView>
          </CView>
        </CView>
      )}
    </>
  )
}

export default CoinInfo
