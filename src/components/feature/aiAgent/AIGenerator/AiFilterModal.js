import React, { useState, useEffect } from 'react'
import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import Modal from 'react-native-modal'
import { screenHeight } from '../../../../utils/common'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './AIGenerator.styles'
import { useTheme } from '@react-navigation/native'
import { Image } from 'react-native'
import appImages from '../../../../resource/images'
import Colors from '../../../common/Colors'
import CButton from '../../../common/core/Button'

const AiFilterModal = ({
  isVisible,
  onClose,
  filterTypeData,
  filterValue,
  setFilterValue,
  modalHeading
}) => {
  const { mode } = useTheme()
  const styles = getStyles(mode)

  const [selectedOptions, setSelectedOptions] = useState(
    filterValue || filterTypeData[0]
  )

  useEffect(() => {
    if (filterValue) {
      setSelectedOptions(filterValue)
    }
  }, [filterValue])

  const handleFilterSelection = item => {
    setSelectedOptions(item)
  }

  const handleFilterSubmit = item => {
    setFilterValue(item?.filterValue)
    onClose()
  }

  return (
    <Modal
      useNativeDriver={true}
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection={null}
      propagateSwipe
      style={{ ...styles.modal }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      avoidKeyboard={true}>
      <SafeAreaView
        style={{
          ...styles.modalContainer,
          height: screenHeight * 0.5
        }}>
        <CView style={styles.modalContent}>
          <CText size={'largeBold'} style={styles.headingContainer}>
            {modalHeading}
          </CText>
          <ScrollView
            horizontal={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContainer}>
            {filterTypeData?.map((item, idx) => (
              <TouchableOpacity
                onPress={() => handleFilterSelection(item)}
                key={idx}
                style={styles.filterTextContainer}>
                <CText
                  size={'medium'}
                  style={{ color: Colors[mode].textLightGray }}>
                  {item?.filterValue}
                </CText>
                <Image
                  source={
                    item.filterValue === selectedOptions?.filterValue
                      ? appImages.radioIcon
                      : appImages.radioUncheckIcon
                  }
                  style={styles.radioIcon}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <CView style={styles.filterButtonContainer}>
            <CButton
              size={'large'}
              buttonType={'primary'}
              text={'Done'}
              isGradientButton
              onPress={() => handleFilterSubmit(selectedOptions)}
              customStyles={{ buttonTextStyles: styles.submitButton }}
            />
          </CView>
        </CView>
      </SafeAreaView>
    </Modal>
  )
}

export default AiFilterModal
