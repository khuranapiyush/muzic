import React from 'react'
import { Image, Pressable } from 'react-native'
import appImages from '../../../../resource/images'
import { dollarToInrWithRupeeSign } from '../../../../utils/common'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './style'
import { useTheme } from '@react-navigation/native'
import Colors from '../../../common/Colors'

const WalletInfo = ({
  balance,
  handleWithdrawMoney,
  handleAddMoney,
  handleTradeFanCards,
  theme
}) => {
  const styles = getStyles(theme)

  return (
    <>
      <CView style={styles.walletCoinContainer}>
        <CView row>
          {/* <CView style={styles.walletCoinIcon}>
            <Image source={appImages.walletIcon} style={styles.coinStyle} />
          </CView> */}
          <CView style={styles.walletContent}>
            <CText
              size="normal"
              text="Wallet Balance"
              style={styles.textStyle}
            />
            <CText
              centered
              size="large"
              text={dollarToInrWithRupeeSign(balance)}
              style={{
                ...styles.textStyle,
                paddingTop: 8,
                color: Colors[theme].textBlack
              }}
            />
          </CView>
        </CView>
        <CView>
          <CView row style={styles.walletWrapper}>
            <Pressable onPress={handleWithdrawMoney}>
              <CView centered>
                <CView>
                  <Image
                    source={appImages.withdrawMoneyIcon}
                    style={styles.iconStyle}
                  />
                </CView>
                <CView centered style={styles.paddingLeft10}>
                  <CText color="textLightGray" size="small">
                    Withdraw{' '}
                  </CText>
                  <CText color="textLightGray" size="small">
                    Money
                  </CText>
                </CView>
              </CView>
            </Pressable>
            <Pressable onPress={handleAddMoney}>
              <CView centered>
                <CView>
                  <Image
                    source={appImages.addMoneyIcon}
                    style={styles.iconStyle}
                  />
                </CView>
                <CView centered style={styles.paddingLeft10}>
                  <CText color="textLightGray" size="small">
                    Add{' '}
                  </CText>
                  <CText color="textLightGray" size="small">
                    Money
                  </CText>
                </CView>
              </CView>
            </Pressable>
            <Pressable onPress={handleTradeFanCards}>
              <CView centered>
                <CView>
                  <Image
                    source={appImages.tradeFanCardIcon}
                    style={styles.iconStyle}
                  />
                </CView>
                <CView centered style={styles.paddingLeft10}>
                  <CText color="textLightGray" size="small">
                    Trade{' '}
                  </CText>
                  <CText color="textLightGray" size="small">
                    FanCards
                  </CText>
                </CView>
              </CView>
            </Pressable>
          </CView>
        </CView>
      </CView>
    </>
  )
}

export default WalletInfo
