import React, { memo, useState } from 'react'
import { Image, LayoutAnimation, Pressable } from 'react-native'
import getStyle from './style'
import appImages from '../../../../../resource/images'
import CView from '../../../../common/core/View'
import CText from '../../../../common/core/Text'

const LevelUpCriteria = ({ data, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const styles = getStyle(theme)
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  return (
    <Pressable onPress={toggleExpansion}>
      <CView style={styles.transactionContainer}>
        <CView row>
          <CView row style={styles.itemCenter}>
            <CView>
              <Image source={{ uri: data?.icon }} style={styles.iconStyle} />
            </CView>
            <CView style={styles.textContainer}>
              <CText
                size="normal"
                style={styles.levelTitleStyle}
                numberOfLines={1}>
                {data?.level}
              </CText>
            </CView>
          </CView>

          <CView row centered style={styles.rightAlignedItem}>
            <Image
              source={appImages.arrowDownIcon}
              style={
                isExpanded ? styles.revArrowIconStyle : styles.arrowIconStyle
              }
            />
          </CView>
        </CView>

        {isExpanded && (
          <CView>
            <CView row style={styles.detailContainer}>
              <CText style={styles.textColor}>{data?.conditionTitle}</CText>
              <CText
                style={{ ...styles.maxWidthRightItem, ...styles.textColor }}
                numberOfLines={1}>
                {data?.rewardTitle}
              </CText>
            </CView>
            <CView row style={styles.detailContainer}>
              <CText>{data?.conditionValue}</CText>
              <CText style={styles.maxWidthRightItem} numberOfLines={1}>
                {data?.rewardValue}
              </CText>
            </CView>
          </CView>
        )}
      </CView>
    </Pressable>
  )
}

export default memo(LevelUpCriteria)
