import React, { useCallback } from 'react'
import { FlatList, Pressable } from 'react-native'
import AutoHeightImage from 'react-native-auto-height-image'
import { screenWidth } from '../../../../../../utils/common'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import getStyles from './style'
import { useTheme } from '@react-navigation/native'

const customStyles = { spacing: 16 }

const Card80 = ({
  label,
  description,
  items,
  feedType,
  type,
  handleGameAction,
  ...rest
}) => {
  const handleClick = useCallback(
    idx => {
      handleGameAction(items[idx])
    },
    [handleGameAction, items]
  )

  const { mode } = useTheme()
  const styles = getStyles(mode)

  const renderItem = useCallback(({ item, index: idx }) => {
    return (
      <Pressable onPress={() => handleClick(idx)} disabled={item?.isLocked}>
        <AutoHeightImage
          source={{
            uri: item?.isLocked
              ? item?.metaData?.lockedCardImageUrl
              : item?.metaData?.cardImageUrl
          }}
          width={screenWidth * 0.8 - customStyles.spacing}
        />
      </Pressable>
    )
  }, [])

  const HorizontalItemSeparator = useCallback(() => {
    return (
      <CView
        style={{
          width: customStyles.spacing,
          ...(feedType == 'vertical' && { height: customStyles.spacing })
        }}
      />
    )
  }, [feedType])

  return (
    <CView style={styles.wrapper}>
      <CView style={{ paddingLeft: customStyles.spacing }}>
        <CView>
          <CText style={styles.feedHeaderText}>{label}</CText>
        </CView>

        {!!description && (
          <CView style={styles.feedDescriptionWrapper}>
            <CText style={styles.feedDescriptionText}>{description}</CText>
          </CView>
        )}
      </CView>

      <CView style={styles.itemWrapper}>
        <FlatList
          data={items}
          keyExtractor={item => item?.action?.gameId}
          renderItem={renderItem}
          horizontal={feedType == 'horizontal'}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={HorizontalItemSeparator}
          style={{
            ...(feedType == 'vertical' && { marginLeft: customStyles.spacing })
          }}
          contentContainerStyle={{
            ...(feedType == 'horizontal' && {
              paddingHorizontal: customStyles.spacing
            })
          }}
        />
      </CView>
    </CView>
  )
}
export default Card80
