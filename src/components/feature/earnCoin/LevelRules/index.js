import React from 'react'
import { SvgUri } from 'react-native-svg'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './style'
import { Image } from 'react-native'

const LevelRules = ({ rules, theme }) => {
  const styles = getStyles(theme)
  return (
    <CView style={styles.wrapper}>
      <CText size="large" text="Level Rules" />
      <CView>
        {rules &&
          rules.map((item, i) => (
            <CView key={i}>
              {i == 0 ? (
                <CView row style={styles.headingStyle}>
                  <CText
                    centered
                    style={styles.width20}
                    size="normal"
                    text={item?.value1}
                  />
                  <CText
                    centered
                    style={styles.width20}
                    size="normal"
                    text={item?.value2}
                  />
                  <CText size="normal" text={item?.value3} />
                  <CText size="normal" text={item?.value4} />
                </CView>
              ) : (
                <CView row style={styles.levelContainer}>
                  {item?.value1?.includes('.svg') ? (
                    <SvgUri uri={item?.value1} style={styles.image} />
                  ) : (
                    <Image
                      source={{ uri: item?.value1 }}
                      style={styles.image}
                    />
                  )}
                  <CText
                    centered
                    style={styles.width20}
                    size="normal"
                    text={item?.value2}
                  />
                  <CText
                    style={styles.width20}
                    size="normal"
                    text={item?.value3}
                  />
                  <CText
                    style={styles.width10}
                    size="normal"
                    text={item?.value4}
                  />
                </CView>
              )}
            </CView>
          ))}
      </CView>
    </CView>
  )
}

export default LevelRules
