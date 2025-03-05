import React, { useState } from 'react'
import { Image, Pressable, SafeAreaView } from 'react-native'
import AIGenerator from '../../components/feature/aiAgent/AIGenerator/AIGenerator'
import appImages from '../../resource/images'
import { useNavigation, useTheme } from '@react-navigation/native'
import CText from '../../components/common/core/Text'
import getStyles from '../../components/feature/aiAgent/AIGenerator/AIGenerator.styles'
import AiFilterModal from '../../components/feature/aiAgent/AIGenerator/AiFilterModal'
import Toaster from '../../components/common/Toaster'

const GenerateAIScreen = ({ route }) => {
  const { mode } = useTheme()
  const navigation = useNavigation()
  const styles = getStyles(mode)

  const [filterValue, setFilterValue] = useState({})
  const [modalDetail, setModalDetail] = useState({
    isVisible: false,
    data: {},
    filterKey: null
  })

  const handleBack = () => {
    navigation.goBack()
  }

  const handleFilterValueChange = (key, value) => {
    setFilterValue(prev => ({ ...prev, [key]: value }))
  }

  return (
    <SafeAreaView style={styles.flatList}>
      <Pressable onPress={handleBack} style={styles.header}>
        <Image source={appImages.arrowLeftIcon} style={styles.titleIcon} />
        <CText
          size="bricolageHeading"
          style={styles.titleText}
          text={route?.params?.title}
        />
      </Pressable>
      <AIGenerator
        pageHeading={route?.params?.tab}
        setIsFilterModalVisible={setModalDetail}
        filterValue={filterValue}
      />
      {modalDetail.isVisible && (
        <AiFilterModal
          isVisible={modalDetail?.isVisible}
          onClose={() =>
            setModalDetail(prev => ({ ...prev, isVisible: false }))
          }
          filterTypeData={modalDetail?.data}
          filterValue={filterValue?.[modalDetail?.filterKey]}
          setFilterValue={value => {
            handleFilterValueChange(modalDetail?.filterKey, value)
          }}
          modalHeading={modalDetail?.filterKey}
        />
      )}
      <Toaster />
    </SafeAreaView>
  )
}

export default GenerateAIScreen
