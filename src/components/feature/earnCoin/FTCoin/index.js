import React from 'react'
import { Image } from 'react-native'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import styles from './style'

const FTCoin = ({ coin }) => {
  return (
    <CView row style={styles.itemContainer}>
      <Image source={appImages.coin} style={styles.coinStyle} />
      <CText size="mediumBold" text={coin} style={styles.textStyle} />
    </CView>
  )
}

export default FTCoin
