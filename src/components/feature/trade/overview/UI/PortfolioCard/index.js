import React from 'react'
import CView from '../../../../../common/core/View'
import CText from '../../../../../common/core/Text'
import {
  calculateProfitLoss,
  dollarToInrWithRupeeSign
} from '../../../../../../utils/common'
import getStyles from './style'
import { Image } from 'react-native'
import { Colors } from '../../../../../common/core/colors'
import { useTheme } from '@react-navigation/native'

const PortFolioCard = ({ data }) => {
  const { mode } = useTheme()
  const styles = getStyles(mode)
  return (
    <CView style={styles.wrapper}>
      <CView row style={styles.titleContainer}>
        <CView row centered style={styles.title}>
          <Image source={{ uri: data?.imageUrl }} style={styles.imageStyle} />
          <CText size="normal" style={styles.nameStyle} numberOfLines={1}>
            {data?.name}
          </CText>
        </CView>
        <CView centered style={styles.btnContainer}>
          <CText style={{ color: Colors.Palette.white }}>
            {data?.quantity} FanCards
          </CText>
        </CView>
      </CView>

      <CView row style={styles.container}>
        <CView>
          <CText size="normal">Current</CText>
          <CView style={styles.itemContainer}>
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(data?.currentAmount)}
            </CText>
          </CView>
        </CView>
        <CView>
          <CText size="normal">Invested</CText>
          <CView style={styles.itemContainer}>
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(data?.investedAmount)}
            </CText>
          </CView>
        </CView>
        <CView>
          <CText size="normal">Buy Price</CText>
          <CView style={styles.itemContainer}>
            <CText size="normalBold">
              {dollarToInrWithRupeeSign(data?.buyPrice)}
            </CText>
          </CView>
        </CView>
      </CView>

      <CView row style={styles.returnContainer}>
        <CView>
          <CText size="normal">Returns</CText>
          <CView style={styles.itemContainer}>
            <CText
              style={
                data?.return?.returnType == 'profit'
                  ? styles.profit
                  : styles.loss
              }
              size="normalBold">
              {calculateProfitLoss(data?.return)}
            </CText>
          </CView>
        </CView>
        <CView>
          <CText size="normal">Royalty Returns</CText>
          <CView style={styles.itemContainer}>
            {data?.royaltyReturnV2 ? (
              <CText
                style={
                  data?.royaltyReturnV2?.returnType == 'profit'
                    ? styles.profit
                    : styles.loss
                }
                size="normalBold">
                {calculateProfitLoss(data?.royaltyReturnV2)}
              </CText>
            ) : (
              <CText>--</CText>
            )}
          </CView>
        </CView>
      </CView>
    </CView>
  )
}

export default PortFolioCard
