import React from 'react'
import AutoHeightImage from 'react-native-auto-height-image'
import { screenWidth } from '../../../../../utils/common'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import CarouselView from '../../../home/CarouselView'
import getStyles from './style'
import { useTheme } from '@react-navigation/native'

const PastWinners = ({ config }) => {
  const renderBanner = ({ item, index }) => (
    <AutoHeightImage
      key={index}
      source={{ uri: item }}
      width={screenWidth - 32}
    />
  )

  const { mode } = useTheme()
  const styles = getStyles(mode)

  return (
    <CView>
      <CText style={styles.label}>Congratulations</CText>
      <CText style={styles.description}>Past Winners</CText>
      <CarouselView
        data={config?.items}
        renderComponent={renderBanner}
        loop={true}
        autoplay={true}
      />
    </CView>
  )
}

export default PastWinners
