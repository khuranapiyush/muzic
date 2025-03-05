import React from 'react'
import { Image, ImageBackground } from 'react-native'
import { SvgUri } from 'react-native-svg'
import appImages from '../../../../resource/images'
import ProgressBar from '../../../common/ProgressBar'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './style'

const Level = ({ levels, theme }) => {
  const styles = getStyles(theme)

  return (
    <CView style={{ marginTop: 10 }}>
      <CView style={styles.levelContainer}>
        <ImageBackground
          source={appImages.levelBlurBG}
          style={{
            resizeMode: 'contain',
            flex: 1,
            width: '100%'
          }}>
          <CView row style={styles.container}>
            {levels &&
              levels?.map((item, i) => (
                <CView key={i} style={styles.itemContainer}>
                  {item?.levelImgUrl?.includes('.svg') ? (
                    <SvgUri uri={item?.levelImgUrl} style={styles.image} />
                  ) : (
                    <Image
                      source={{ uri: item?.levelImgUrl }}
                      style={styles.image}
                    />
                  )}
                  <CView style={styles.shadowContainer}>
                    <CText
                      centered
                      text={item?.name}
                      style={styles.textAlign}
                    />
                    <ProgressBar
                      progress={item?.currentLevelProgressPercent}
                      withPercent={false}
                      height={8}
                      borderRadius={3}
                    />
                    {item?.currentLevelProgressPercent == 100 && (
                      <Image
                        source={appImages.greenTick}
                        style={styles.greenTickImage}
                      />
                    )}
                  </CView>
                </CView>
              ))}
          </CView>
        </ImageBackground>
      </CView>
    </CView>
  )
}

export default Level
