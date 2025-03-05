import React, { useCallback } from 'react'
import { FlatList, Image, Pressable } from 'react-native'
import appImages from '../../../../../../resource/images'
import { screenWidth } from '../../../../../../utils/common'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import ROUTE_MAPPING_BE from '../../../../../../navigator/config/routeMappingBE'
import { useNavigation } from '@react-navigation/native'
import Colors from '../../../../../common/Colors'

const ViewType3 = ({ items, theme }) => {
  const navigation = useNavigation()

  const keyExtractor = useCallback((item, idx) => `list_${idx}`, [])

  const renderItem = useCallback(
    ({ item, index: idx }) => {
      return (
        <CView
          row
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[theme].cardBorderColor,
            backgroundColor: Colors[theme].cardBg,
            paddingHorizontal: 12,
            paddingVertical: 16,
            marginRight: 16,
            width: screenWidth * 0.55
          }}>
          <CView>
            <Image
              source={{ uri: item.icon }}
              style={{ width: 66, height: 66 }}
            />
          </CView>

          <CView style={{ marginLeft: 10, flex: 1 }}>
            <CText
              numberOfLines={1}
              style={{ fontSize: 14, fontWeight: '500', color: '#D2D2D2' }}>
              {item.text}
            </CText>
            <CText
              numberOfLines={1}
              style={{
                fontSize: 12,
                fontWeight: '500',
                marginTop: 5,
                color: '#FE9BF3'
              }}>
              {item.description}
            </CText>
            <CText
              numberOfLines={1}
              style={{
                fontSize: 14,
                fontWeight: '500',
                marginTop: 5,
                color: '#D2D2D2'
              }}>
              {item.value}
            </CText>
          </CView>
        </CView>
      )
    },
    [theme]
  )

  const handleBuyNft = action => {
    const routeConfig = ROUTE_MAPPING_BE['TRADE_VIEW']
    if (!routeConfig) {
      return
    }
    navigation.navigate(routeConfig.name, routeConfig.params)
  }

  return !items.length ? (
    <CView row>
      <Pressable
        onPress={handleBuyNft}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: screenWidth * 0.55,
          borderWidth: 1,
          borderColor: Colors[theme].cardBorderColor,
          backgroundColor: Colors[theme].cardBg,
          borderRadius: 12,
          padding: 20
        }}>
        <Image
          source={appImages.plusIcon}
          style={{ width: 24, height: 24, tintColor: Colors[theme].white }}
        />
        <CText
          style={{
            marginTop: 12,
            fontSize: 12,
            fontWeight: '400'
          }}>
          Buy your First FanCard
        </CText>
      </Pressable>
    </CView>
  ) : (
    <FlatList
      horizontal={true}
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  )
}

export default ViewType3
