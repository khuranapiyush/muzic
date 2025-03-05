import React from 'react'
import CText from '../../../../../common/core/Text'
import CView from '../../../../../common/core/View'
import { Image } from 'react-native'
import appImages from '../../../../../../resource/images'
import { useTheme } from '@react-navigation/native'
import Colors from '../../../../../common/Colors'

const UnlockedView = ({ item }) => {
  const { mode } = useTheme()
  return (
    <CView>
      <CView
        style={{
          backgroundColor: Colors[mode].appBg,
          padding: 10,
          borderRadius: 12
        }}
        centered>
        <CText>{item?.coinEarned}</CText>
        <Image source={appImages.coin} style={{ height: 24, width: 24 }} />
      </CView>

      <CText
        centered
        style={{ color: Colors[mode].textLightGray, marginTop: 5 }}>
        Day {item?.day}
      </CText>
    </CView>
  )
}

export default UnlockedView
