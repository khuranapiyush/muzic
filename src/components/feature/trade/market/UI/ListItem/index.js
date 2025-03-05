import React from 'react'
import { Image, Pressable } from 'react-native'
import { dollarToInrWithRupeeSign, round } from '../../../../../../utils/common'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import getStyles from './style'
import Colors from '../../../../../common/Colors'

const ListItem = ({ item, cardClick, mode }) => {
  const styles = getStyles(mode)
  return (
    <Pressable onPress={cardClick}>
      <CView row style={styles.container}>
        <CView row style={styles.width50}>
          <Image
            source={{ uri: item?.defaultImageUrl }}
            style={styles.imageStyle}
          />
          <CView style={{ flex: 1 }}>
            <CText size="normal" numberOfLines={1}>
              {item?.tierName}
            </CText>
            <CText size="small" style={{ color: Colors[mode].textLightGray }}>
              {item?.videoLanguage}
            </CText>
          </CView>
        </CView>
        <CView style={styles.width25}>
          <CText size="normal">
            {dollarToInrWithRupeeSign(item?.currentPrice)}
          </CText>
          <CView style={styles.itemContainer}>
            <CText
              size="small"
              style={
                item?.changePercent24Hr >= 0 ? styles.profit : styles.loss
              }>
              {item?.changePercent24Hr > 0 && '+'}
              {round(item?.changePercent24Hr)}%
            </CText>
          </CView>
        </CView>
        <CView style={styles.width25}>
          <CView style={styles.itemContainer}>
            <CText
              style={item?.maxReturn >= 0 ? styles.profit : styles.loss}
              size="normal">
              {item?.maxReturn > 0 && '+'}
              {item?.maxReturn}%
            </CText>
          </CView>
        </CView>
      </CView>
    </Pressable>
  )
}

export default ListItem
