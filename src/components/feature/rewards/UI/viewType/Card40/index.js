import { useTheme } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { FlatList, Image, Pressable, TouchableOpacity } from 'react-native'
import AutoHeightImage from 'react-native-auto-height-image'
import Modal from 'react-native-modal'
import appImages from '../../../../../../resource/images'
import { screenWidth } from '../../../../../../utils/common'
import CButton from '../../../../../common/core/Button'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import getStyles from './style'

const customStyles = { spacing: 16 }

const Card40 = ({
  label,
  description,
  items,
  feedType,
  type,
  handleGameAction,
  ...rest
}) => {
  const { mode } = useTheme()
  const styles = getStyles(mode)

  const [isCashOut, setIsCashOut] = useState(false)
  const [options, setOptions] = useState([])
  const [selectedOptions, setSelectedOptions] = useState('')
  const [selectedItem, setSelectedItem] = useState([])

  const handleClose = () => {
    setIsCashOut(!isCashOut)
  }

  const handleClick = useCallback(
    idx => {
      if (items[idx]?.metaData?.gameName == 'CASHOUT') {
        setOptions(items[idx]?.metaData?.subtype)
        setSelectedOptions(items[idx]?.metaData?.subtype[0])
        setSelectedItem(items[idx])

        setIsCashOut(true)
      } else {
        handleGameAction(items[idx])
      }
    },
    [handleGameAction, items]
  )

  const handleRedeem = () => {
    let obj = { action: selectedOptions, subGameId: selectedItem.action.gameId }
    setIsCashOut(false)
    handleGameAction(obj)
  }

  const renderItem = useCallback(
    ({ item, index: idx }) => {
      return (
        <Pressable onPress={() => handleClick(idx)} disabled={item?.isLocked}>
          <AutoHeightImage
            source={{
              uri: item?.isLocked
                ? item?.metaData?.lockedCardImageUrl
                : item?.metaData?.cardImageUrl
            }}
            width={screenWidth * 0.4 - customStyles.spacing * 2}
          />
        </Pressable>
      )
    },
    [handleClick]
  )

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
    <>
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
              ...(feedType == 'vertical' && {
                marginLeft: customStyles.spacing,
                marginRight: customStyles.spacing
              }),
              ...(feedType == 'horizontal' &&
                items.length <= 2 && {
                  marginLeft: customStyles.spacing,
                  marginRight: customStyles.spacing
                })
            }}
            contentContainerStyle={{
              ...(feedType == 'horizontal' &&
                items.length > 2 && {
                  paddingHorizontal: customStyles.spacing
                })
            }}
          />
        </CView>
      </CView>

      {isCashOut && (
        <Modal
          isVisible={isCashOut}
          swipeDirection={['down']}
          propagateSwipe
          style={{ ...styles.modal }}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropOpacity={0.5}
          onBackdropPress={handleClose}
          onSwipeComplete={handleClose}
          avoidKeyboard={true}>
          <CView style={styles.container}>
            <CView style={styles.modalContainer}>
              <CView row style={styles.titleContainer}>
                <TouchableOpacity onPress={handleClose}>
                  <Image
                    source={appImages.closeIcon}
                    style={styles.closeButton}
                  />
                </TouchableOpacity>
              </CView>

              <CView centered>
                <CText color="textBlack" centered size="largeBold">
                  Cashout/Vouchers
                </CText>
                <CText
                  color="textBlack"
                  centered
                  size="normal"
                  style={{ marginTop: 10 }}>
                  Select your cashout type
                </CText>

                <CView style={{ width: '100%', height: 'auto' }}>
                  {options?.map(item => (
                    <Pressable
                      onPress={() => setSelectedOptions(item)}
                      key={item.id}>
                      <CView
                        row
                        style={
                          item.gameId == selectedOptions.gameId
                            ? {
                                ...styles.itemContainer,
                                ...styles.selectedItemContainer
                              }
                            : styles.itemContainer
                        }>
                        <CView row centered style={styles.alignStart}>
                          <CView centered style={styles.iconContainer}>
                            <Image
                              source={{ uri: item?.logoUrl }}
                              style={styles.modalLogo}
                            />
                          </CView>
                          <CView>
                            <CText size="mediumBold" color="textBlack">
                              {'  '}
                              {item?.label}
                            </CText>
                          </CView>
                        </CView>
                        <CView style={styles.flex1} />
                        <CView>
                          <Image
                            source={
                              item.gameId == selectedOptions.gameId
                                ? appImages.radioIcon
                                : appImages.radioUncheckIcon
                            }
                            style={styles.radioIcon}
                          />
                        </CView>
                      </CView>
                    </Pressable>
                  ))}
                </CView>
              </CView>
              <CView style={styles.flex1} />
              <CView centered row style={styles.btnContainer}>
                <CButton
                  size="large"
                  buttonType="primary"
                  text={'Redeem'}
                  isGradientButton
                  onPress={handleRedeem}
                  customStyles={{
                    buttonTextStyles: styles.submitBtn,
                    buttonStyle: {
                      minWidth: '100%'
                    }
                  }}
                />
              </CView>
            </CView>
          </CView>
        </Modal>
      )}
    </>
  )
}
export default Card40
