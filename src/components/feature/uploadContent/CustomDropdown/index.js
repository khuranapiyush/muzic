import React, { useState } from 'react'
import CView from '../../../common/core/View'
import CText from '../../../common/core/Text'
import style from './style'
import { Image, TouchableOpacity } from 'react-native'
import appImages from '../../../../resource/images'
import DropdownModal from '../DropdownModal'

const CustomDropdown = ({ text, setSelectedOption, ...rest }) => {
  const handlePress = () => {
    setIsModalVisible(true)
  }

  const [item, setItem] = useState({})
  console.log('🚀 ~ CustomDropdown ~ item:', item)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleSetItem = selectedItem => {
    setItem(selectedItem)
    setSelectedOption(selectedItem)
  }
  return (
    <CView style={style.wrapper}>
      <TouchableOpacity style={style.input} onPress={handlePress}>
        <CView centered row style={style?.inputContainer}>
          <CText color="commonBlack" size="medium" style={style.label}>
            {item?.label}
          </CText>
          <Image style={style.arrowIcon} source={appImages.arrowDownIcon} />
        </CView>
      </TouchableOpacity>
      <DropdownModal
        isVisible={isModalVisible}
        onClose={setIsModalVisible}
        {...rest}
        setItem={selectedItem => handleSetItem(selectedItem)}
      />
    </CView>
  )
}

export default CustomDropdown
