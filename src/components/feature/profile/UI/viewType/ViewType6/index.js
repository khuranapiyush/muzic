import React, { useCallback } from 'react'
import { FlatList, Image } from 'react-native'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import getStyles from './styles'
import Divider from '../../../../../common/core/Divider'
import Colors from '../../../../../common/Colors'

const ViewType6 = ({ items, theme }) => {
  const keyExtractor = useCallback((item, idx) => `list_${idx}`, [])
  const styles = getStyles(theme)
  const renderItem = useCallback(
    ({ item, index: idx }) => {
      return (
        <CView style={styles.wrapper}>
          <CView
            row
            style={{
              paddingHorizontal: 12
            }}>
            {!!item.icon && (
              <Image source={{ uri: item.icon }} style={styles.leftIcon} />
            )}
            {!!item?.text && (
              <CText style={styles.labelText}>{item?.text}</CText>
            )}
          </CView>

          <CView style={{ marginTop: 20, marginBottom: 20 }}>
            {item.menuItems.map((menu, menuIdx) => (
              <CView key={menuIdx}>
                <CView
                  key={idx}
                  row
                  style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                  <Image
                    source={{ uri: menu.icon }}
                    style={{ width: 16, height: 16 }}
                  />
                  <CText
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      fontWeight: '600'
                    }}>
                    {menu.text}
                  </CText>
                </CView>
                {item.menuItems.length - 1 != idx && (
                  <Divider
                    customStyle={{
                      borderWidth: 1,
                      borderColor: Colors[theme].borderColor
                    }}
                  />
                )}
              </CView>
            ))}
          </CView>
        </CView>
      )
    },
    [theme]
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

export default ViewType6
