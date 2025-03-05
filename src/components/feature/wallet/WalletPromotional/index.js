import React from 'react'
import { Image, ImageBackground, Pressable } from 'react-native'
import appImages from '../../../../resource/images'
import { screenWidth } from '../../../../utils/common'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './style'
import { useTheme } from '@react-navigation/native'
import CButton from '../../../common/core/Button'
import RenderHtml from 'react-native-render-html'
import Colors from '../../../common/Colors'
import LinearGradient from 'react-native-linear-gradient'

const WalletPromotional = ({
  handleClaimNow,
  handleHowItWorks,
  theme,
  data
}) => {
  const styles = getStyles(theme)
  const { mode } = useTheme()

  const tagsStyles = {
    body: {
      fontFamily: 'Nohemi',
      color: Colors[mode].commonBlack,
      fontSize: 16,
      fontWeight: '600'
    },
    a: {
      color: 'green'
    }
  }

  return (
    <LinearGradient
      style={styles.walletCoinContainer}
      colors={['#CDFF4D', '#FFFDD4']}
      start={{ x: 0.5, y: -0.1 }}
      end={{ x: 0.5, y: 1.14 }}>
      <ImageBackground
        source={appImages.walletBg}
        style={styles.background}
        resizeMode="cover" // or "contain", "stretch", etc.
      >
        <CView style={{ padding: 16 }}>
          <CView row>
            <LinearGradient
              colors={['#646464', '#1E1E1E']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.gradientBackground}>
              <CView style={styles.walletIconContainer}>
                <Image
                  source={{ uri: data?.header?.[0]?.logo }}
                  style={styles.coinStyle}
                />
              </CView>
            </LinearGradient>

            <CView style={styles.walletContent}>
              <CText
                size="normal"
                color="textGray"
                text={data?.header?.[0]?.title}
                style={styles.textStyle}
              />
              <CView row style={{ marginTop: 5 }}>
                {data?.header?.[0]?.currencyIcon && (
                  <CView>
                    <Image
                      source={{ uri: data?.header?.[0]?.currencyIcon }}
                      style={styles.currencyIConStyle}
                    />
                  </CView>
                )}

                <CText
                  centered
                  size="large"
                  color="commonBlack"
                  text={data?.header?.[0]?.value}
                  style={{
                    ...styles.textStyle,
                    fontSize: 20,
                    fontWeight: '700',
                    lineHeight: 22
                  }}
                />

                {data?.header?.[0]?.isStar && (
                  <CText
                    centered
                    size="large"
                    color="commonBlack"
                    text="*"
                    style={{
                      ...styles.textStyle,
                      fontSize: 20,
                      fontWeight: '700',
                      lineHeight: 22,
                      paddingHorizontal: 0
                    }}
                  />
                )}
              </CView>
            </CView>
          </CView>
          <CView>
            <CView row style={styles.walletWrapper}>
              {data?.body?.map((item, i) => (
                <CView key={item?.value + i}>
                  <CView style={styles.paddingLeft10}>
                    <CText color="textGray" size="small">
                      {item?.title}{' '}
                    </CText>
                  </CView>
                  <CView row centered>
                    {item?.currencyIcon && (
                      <Image
                        source={{ uri: item?.currencyIcon }}
                        style={styles.iconStyle}
                      />
                    )}
                    <CText color="commonBlack" size="mediumBold">
                      {' '}
                      {item?.value}{' '}
                    </CText>
                    {item?.isStar && (
                      <CText
                        color="commonBlack"
                        size="mediumBold"
                        style={{ paddingHorizontal: 0 }}>
                        *
                      </CText>
                    )}
                  </CView>
                </CView>
              ))}
            </CView>
            {data?.button?.title && (
              <CView style={{ marginTop: 20 }}>
                <CButton
                  size="large"
                  buttonType="primary"
                  text={data?.button?.title}
                  onPress={handleClaimNow}
                  customStyles={{
                    buttonTextStyles: styles.submitBtn,
                    buttonStyle: {
                      minWidth: '45%',
                      backgroundColor: '#6B61FF'
                    }
                  }}
                />
              </CView>
            )}
          </CView>
          <CView
            row
            style={{
              marginTop: 20,
              justifyContent: 'space-between'
            }}>
            <CView row style={{ paddingTop: 4 }}>
              {data?.footer?.title.map((item, i) => (
                <CView key={i} row>
                  {item?.isHtml ? (
                    <RenderHtml
                      contentWidth={screenWidth}
                      source={{
                        html: item?.text
                      }}
                      tagsStyles={tagsStyles}
                    />
                  ) : item?.isUrl ? (
                    <Image
                      style={{ height: 16, width: 16 }}
                      source={{ uri: item?.url }}
                    />
                  ) : (
                    <CText color="commonBlack" size="normal">
                      {item?.text}{' '}
                    </CText>
                  )}
                </CView>
              ))}
            </CView>

            <CView
              style={{
                marginTop: 5,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <CView row>
                <Pressable onPress={handleHowItWorks}>
                  <CText size="normal" color="textGray">
                    {data?.footer?.button?.title}?
                  </CText>
                </Pressable>
                <Image
                  source={appImages.arrowRightAngle}
                  style={styles.iconStyle}
                />
              </CView>

              {/* <RenderHtml
                contentWidth={screenWidth}
                source={{
                  html: `<span>${data?.footer?.terms?.title}</span>`
                }}
                tagsStyles={tagsStyles}
              /> */}
            </CView>
          </CView>
        </CView>
      </ImageBackground>
    </LinearGradient>
  )
}

export default WalletPromotional
