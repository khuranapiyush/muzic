import { useNavigation } from '@react-navigation/native'
import React, { useCallback } from 'react'
import { FlatList, Image, TouchableOpacity } from 'react-native'
import ROUTE_MAPPING_BE from '../../../../../../navigator/config/routeMappingBE'
import appImages from '../../../../../../resource/images'
import { generateTransparentColor } from '../../../../../../utils/common'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import getStyles from './styles'
import Colors from '../../../../../common/Colors'

const ViewType5 = ({ items, theme }) => {
  const navigation = useNavigation()
  const styles = getStyles(theme)

  const keyExtractor = useCallback((item, idx) => `list_${idx}`, [])

  const handleActionBtn = useCallback(
    action => {
      const routeConfig = ROUTE_MAPPING_BE[action]
      if (!routeConfig) {
        return
      }

      navigation.navigate(routeConfig.name, routeConfig.params)
    },
    [navigation]
  )

  const renderItem = useCallback(
    ({ item, index: idx }) => {
      return (
        <TouchableOpacity onPress={() => handleActionBtn(item.action)}>
          <CView row style={styles.wrapper}>
            <CView row style={styles.leftWrapper}>
              <CView
                row
                style={{
                  alignItems: 'center',
                  ...(!item.value && { width: '100%' })
                }}>
                {/* <CView style={styles.leftIconWrapper}>
                  {!!item.icon && (
                    <Image
                      source={{ uri: item.icon }}
                      style={styles.leftIcon}
                    />
                  )}
                </CView> */}

                <CView>
                  <CView row style={{ justifyContent: 'space-between' }}>
                    {!!item?.text && (
                      <CText style={styles.labelText}>{item?.text} </CText>
                    )}

                    {item.action && ROUTE_MAPPING_BE[item.action] && (
                      <CView row style={styles.actionBtnWrapper}>
                        <Image
                          source={appImages.arrowRightAngle}
                          style={styles.actionIcon}
                        />
                      </CView>
                    )}
                  </CView>
                  {!!item?.description && (
                    <CText
                      style={{
                        ...styles.descriptionText,
                        color: Colors[theme].textLightGray
                      }}>
                      {item?.description}
                    </CText>
                  )}

                  <CView
                    row
                    style={{
                      borderRadius: 12,
                      backgroundColor: Colors[theme].iconBg,
                      paddingLeft: 12,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 16,
                      marginTop: 12
                    }}>
                    <Image
                      source={{ uri: item.referBannerIcon }}
                      style={{ height: 30, width: 30 }}
                    />

                    <CView
                      style={{
                        width: '100%',
                        paddingRight: 20
                      }}>
                      <CView>
                        <CText
                          style={{
                            fontSize: 16,
                            fontWeight: '600'
                          }}>
                          {item.referBannerTitle}
                        </CText>
                      </CView>

                      <CText
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          fontWeight: '400',
                          lineHeight: 15
                        }}>
                        {item.referBannerDescription}
                      </CText>
                    </CView>
                  </CView>
                </CView>
              </CView>

              {!!item.value && (
                <CView
                  style={{
                    ...styles.valueWrapper,
                    backgroundColor: item?.valueColor
                      ? generateTransparentColor(item?.valueColor, 0.4)
                      : '#E8E8E8'
                  }}>
                  <CText
                    style={{
                      ...styles.valueText,
                      color: item.valueColor || '#000'
                    }}>
                    {item.value}
                  </CText>
                </CView>
              )}
            </CView>
          </CView>
        </TouchableOpacity>
      )
    },
    [handleActionBtn, theme]
  )

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  )
}

export default ViewType5
