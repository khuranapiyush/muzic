import React, { useMemo, useState } from 'react'
import { Button, FlatList } from 'react-native'
import AutoHeightImage from 'react-native-auto-height-image'
import { screenWidth } from '../../../../../../utils/common'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import CustomCard30 from '../../CustomView/Card30'
import getStyles from './style'
import { useTheme } from '@react-navigation/native'

const customStyles = { spacing: 16 }

const Custom30 = ({
  label,
  description,
  items,
  feedType,
  visibleItems,
  type,
  handleGameAction,
  ...rest
}) => {
  const [isShowMoreItems, setIsShowItems] = useState(false)

  const { mode } = useTheme()
  const styles = getStyles(mode)

  const isGrid = false

  useMemo(
    () => feedType === 'vertical' && items.length > visibleItems,
    [feedType, items.length, visibleItems]
  )

  const renderItem = ({ item, index: idx }) => {
    return <CustomCard30 item={item} metaData={items[idx]} />
  }

  const renderGrid = (item, idx) => {
    return (
      <CView key={idx}>
        <AutoHeightImage
          source={{ uri: item?.metaData?.cardImageUrl }}
          width={screenWidth * 0.9}
        />
      </CView>
    )
  }

  const HorizontalItemSeparator = () => {
    return (
      <CView
        style={{
          width: customStyles.spacing,
          ...(feedType == 'vertical' && { height: customStyles.spacing })
        }}
      />
    )
  }

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
        {isGrid ? (
          <CView>
            <CView row style={{ flexWrap: 'wrap', flex: 1 }}>
              {items.slice(0, visibleItems).map(renderGrid)}
            </CView>
            {!isShowMoreItems ? (
              <Button
                title=" View more"
                onPress={() => setIsShowItems(true)}></Button>
            ) : (
              <Button
                title="Show less"
                onPress={() => setIsShowItems(false)}></Button>
            )}
          </CView>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => item?.action?.gameId}
            renderItem={renderItem}
            horizontal={feedType == 'horizontal'}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={HorizontalItemSeparator}
            style={{
              ...(feedType == 'vertical' && {
                marginLeft: customStyles.spacing,
                marginRight: customStyles.spacing
              }),
              ...(feedType == 'horizontal' &&
                items.length <= 3 && {
                  marginLeft: customStyles.spacing,
                  marginRight: customStyles.spacing
                })
            }}
            contentContainerStyle={{
              ...(feedType == 'horizontal' &&
                items.length > 3 && {
                  paddingHorizontal: customStyles.spacing
                })
            }}
          />
        )}
      </CView>
    </CView>
  )
}
export default Custom30
