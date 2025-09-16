import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Image, Pressable } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { screenWidth } from '../../../../utils/common';
import Colors from '../../../common/Colors';
import CButton from '../../../common/core/Button';
import CText from '../../../common/core/Text';
import CView from '../../../common/core/View';
import getStyles from './style';
import AutoHeightImage from 'react-native-auto-height-image';
import appImages from '../../../../resource/images';

const WalletCreatorProgram = ({
  joinYoutube,
  handleHowItWorks,
  theme,
  data,
}) => {
  const styles = getStyles(theme);
  const { mode } = useTheme();

  const tagsStyles = {
    body: {
      whiteSpace: 'normal',
      color: Colors[mode].textBlack,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '600',
      fontFamily: 'Nohemi-Regular',
    },
    a: {
      color: 'green',
    },
    // span: {
    //   fontSize: 15
    // }
  };

  return (
    <CView style={{ marginTop: 20 }}>
      <CText
        size="mediumBold"
        text={data?.header?.title}
        style={styles.textStyle}
      />
      <CView row style={{ justifyContent: 'space-between' }}>
        <CText
          size="normal"
          text={data?.header?.subtitle}
          style={{ ...styles.textStyle, opacity: 0.8 }}
        />
        <Pressable
          onPress={handleHowItWorks}
          style={{
            alignSelf: 'flex-start',
            height: 28,
            borderColor: '#FFF',
            color: '#FE9BF3',
          }}>
          <CView row>
            <CText size="small" color="buttonBackground">
              {data?.header?.button?.title}
            </CText>
            <Image
              source={appImages.arrowRightAngle}
              style={styles.iconStyle}
            />
          </CView>
        </Pressable>
      </CView>

      <CView style={styles.streakLock}>
        <CView row style={{ marginTop: 10 }}>
          <CView
            row
            style={{
              width: '100%',
              justifyContent: 'space-between',
            }}>
            {data?.body?.map((item, i) => (
              <CView key={item?.bannerUrl + i}>
                <AutoHeightImage
                  source={{ uri: item.bannerUrl }}
                  width={screenWidth * 0.25 - 20}
                />
              </CView>
            ))}
          </CView>
        </CView>

        <CView row style={{ justifyContent: 'space-between', marginTop: 20 }}>
          <CView>
            <CText style={{ color: Colors[mode].textBlack }} size="medium">
              {' '}
              {data?.footer?.title}{' '}
            </CText>
            <CView row style={{ paddingTop: 4 }}>
              {data?.footer?.subtitle?.map((item, i) => (
                <CView key={i} row>
                  {item.isHtml ? (
                    <RenderHtml
                      contentWidth={screenWidth}
                      source={{
                        html: item.text,
                      }}
                      tagsStyles={tagsStyles}
                    />
                  ) : item.isUrl ? (
                    <Image
                      style={{ height: 24, width: 24 }}
                      source={{ uri: item.url }}
                    />
                  ) : (
                    <CText
                      style={{
                        fontSize: 22,
                        lineHeight: 28,
                        fontWeight: '600',
                        fontFamily: 'Nohemi-Regular',
                        color: Colors[mode].textBlack,
                      }}>
                      {item.text}
                    </CText>
                  )}
                </CView>
              ))}
            </CView>
          </CView>
          <CView>
            <CButton
              size="large"
              buttonType="primary"
              text={data?.footer?.button?.title}
              onPress={() => joinYoutube(data?.footer)}
              customStyles={{
                buttonTextStyles: styles.submitBtn,
                buttonStyle: {
                  minWidth: '45%',
                  backgroundColor: Colors[mode].buttonBackground,
                },
              }}
            />
          </CView>
        </CView>
      </CView>
    </CView>
  );
};

export default WalletCreatorProgram;
