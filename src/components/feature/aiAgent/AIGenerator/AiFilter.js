import React from 'react'
import { Image, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'
import CView from '../../../common/core/View'
import CText from '../../../common/core/Text'
import { getFilterByTab } from '../../../../constants/constant'
import getStyles from './AIGenerator.styles'
import appImages from '../../../../resource/images'

const AiFilter = ({
  pageType,
  tabIndex,
  filterValue,
  setIsFilterModalVisible
}) => {
  const { mode } = useTheme()
  const styles = getStyles(mode)

  const filters = getFilterByTab(tabIndex === 1 ? 'script' : pageType)

  return (
    <CView row style={styles.filterWrapper}>
      {filters.map((item, index) => {
        return (
          <TouchableOpacity
            onPress={() =>
              setIsFilterModalVisible({
                isVisible: true,
                data: item?.filterTypeData,
                filterKey: item?.key
              })
            }
            style={styles.filterContainer}
            key={index}>
            <CView style={styles.filterIconContainer}>
              <Image source={item?.icon} style={styles.filterIcon} />
            </CView>
            <CText size="small">
              {filterValue?.[item?.key] || item.defaultValue?.filterValue}
            </CText>
            <CView>
              <Image
                source={appImages.arrowUpIcon}
                style={styles.dropDownIcon}
              />
            </CView>
          </TouchableOpacity>
        )
      })}
    </CView>
  )
}

export default AiFilter
