import React from 'react'
import styles from './style'
import CView from '../../../../../common/core/View'
import CText from '../../../../../common/core/Text'
import LinearGradient from 'react-native-linear-gradient'
import { Image } from 'react-native'
import appImages from '../../../../../../resource/images'
import { useTheme } from '@react-navigation/native'
import Colors from '../../../../../common/Colors'

const LockedView = ({ item }) => {
  const { mode } = useTheme()

  return (
    <CView center style={styles.streakStats}>
      <Image
        source={appImages.greenTick}
        style={{ height: 16, width: 16, marginBottom: 5 }}
      />
      <LinearGradient colors={['#6B61FF', '#FE9BF3']} style={styles.streakLock}>
        <CText style={{ color: Colors[mode].commonWhite }}>
          {item?.coinEarned}
        </CText>
        <Image source={appImages.coin} style={{ height: 24, width: 24 }} />
      </LinearGradient>
      <CText style={{ paddingLeft: 5, marginTop: 5 }}>Day {item?.day}</CText>
    </CView>
  )
}

export default LockedView
