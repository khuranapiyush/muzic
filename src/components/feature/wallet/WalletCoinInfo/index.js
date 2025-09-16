import React from 'react';
import { Image } from 'react-native';
import appImages from '../../../../resource/images';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import getStyles from './style';
import { numberWithComma, toFixedWithoutRound } from '../../../../utils/common';
import CButton from '../../../common/core/Button';

const WalletCoinInfo = ({
  xFanTvToken,
  coinBalance,
  handleRedeem,
  theme,
  xFanTvTokenUnlocked,
  isInternational,
}) => {
  const styles = getStyles(theme);

  return (
    <>
      <CView style={styles.walletCoinContainer}>
        <CView row>
          <CView style={styles.width50}>
            <CView row>
              <CView style={styles.walletCoinIcon}>
                <CView style={styles.iconContainer}>
                  <Image
                    source={appImages.xFanTvTokenIcon}
                    style={styles.coinStyle}
                  />
                </CView>
              </CView>
              <CView style={styles.walletContent}>
                <CText size="normal" text="xFanTv" style={styles.textStyle} />
                <CText
                  adjustsFontSizeToFit={true}
                  allowFontScaling
                  numberOfLines={1}
                  size="mediumBold"
                  text={xFanTvToken || '0.0'}
                  style={styles.valueTextStyle}
                />
              </CView>
            </CView>
            <CView row style={{ marginTop: 30 }}>
              <CView>
                <CText
                  size="small"
                  text="Unlocked xFanTV"
                  style={{ ...styles.textStyle, paddingBottom: 3 }}
                />
                <CView row>
                  <CView style={styles.iconContainer}>
                    <Image
                      source={appImages.xFanTvTokenIcon}
                      style={styles.coinStyle}
                    />
                  </CView>
                  <CText
                    adjustsFontSizeToFit={true}
                    allowFontScaling
                    numberOfLines={1}
                    size="mediumBold"
                    text={toFixedWithoutRound(xFanTvTokenUnlocked || '0.0', 6)}
                    style={{
                      ...styles.valueTextStyle,
                      paddingTop: 5,
                      paddingLeft: 8,
                    }}
                  />
                </CView>
              </CView>
            </CView>
          </CView>

          <CView style={styles.width50}>
            <CView row>
              <CView style={styles.walletCoinIcon}>
                <CView style={styles.iconContainer}>
                  <Image source={appImages.coin} style={styles.coinStyle} />
                </CView>
              </CView>
              <CView style={styles.walletContent}>
                <CText size="small" text="Points" style={styles.textStyle} />
                <CText
                  adjustsFontSizeToFit={true}
                  allowFontScaling
                  numberOfLines={1}
                  size="mediumBold"
                  text={numberWithComma(coinBalance)}
                  style={styles.valueTextStyle}
                />
              </CView>
            </CView>
          </CView>
        </CView>

        <CView>
          {!isInternational && (
            <CView style={styles.btnContainer}>
              <CButton
                size="large"
                buttonType="primary"
                text="Claim Now"
                onPress={handleRedeem}
                customStyles={{
                  buttonTextStyles: styles.submitBtn,
                  buttonStyle: {
                    minWidth: '45%',
                    backgroundColor: '#6B61FF',
                  },
                }}
              />
            </CView>
          )}
        </CView>

        {/* <CView
          style={{
            position: 'absolute',
            right: 10,
            top: 10
          }}>
        <Pressable onPress={() => handleMoreDetails()}>
            <CView row style={styles.moreDetails}>
              <Image
                source={
                  !isExpanded ? appImages.arrowDownIcon : appImages.arrowUpIcon
                }
                style={{ tintColor: Colors[mode].white }}
              />
            </CView>
          </Pressable>
        </CView> */}
      </CView>
    </>
  );
};

export default WalletCoinInfo;
