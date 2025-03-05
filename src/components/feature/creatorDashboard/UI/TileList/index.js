import React from 'react'

import { Image, Pressable } from 'react-native'
import getStyles from './style'
import CView from '../../../../common/core/View'
import appImages from '../../../../../resource/images'
import CText from '../../../../common/core/Text'

const TileList = ({ title, data, handleClick, theme }) => {
  const styles = getStyles(theme)
  return (
    <CView>
      <CText size="mediumBold">{title}</CText>
      {data?.length > 0 &&
        data.map((item, i) => (
          <Pressable onPress={handleClick} key={i}>
            <CView key={i} row style={styles.levelContainer}>
              <CText text={item.title} style={styles.itemLabelStyle} />
              <CView row>
                <CText text={item?.value} />
                <Image
                  source={appImages.arrowRightAngle}
                  style={styles.iconStyle}
                />
              </CView>
            </CView>
          </Pressable>
        ))}
    </CView>
  )
}

export default TileList
