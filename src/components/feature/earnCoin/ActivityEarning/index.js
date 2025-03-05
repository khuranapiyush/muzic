import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import {
  Image,
  ImageBackground,
  LayoutAnimation,
  Pressable
} from 'react-native'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import ActivityCard from './UI/ActivityCard'
import getStyles from './style'
import Colors from '../../../common/Colors'

const ActivityEarning = ({ page = 'earnCoin', activities, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigation = useNavigation()
  const showItem = isExpanded ? activities?.length : 3

  const styles = getStyles(theme)

  const handleMoreDetails = () => {
    if (page == 'earnCoin') {
      setIsExpanded(!isExpanded)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    } else if (page == 'Wallet') {
      navigation.replace('EarnCoin')
    }
  }

  return (
    <CView>
      <ImageBackground
        source={appImages.dailyBg}
        style={{
          backgroundColor: Colors[theme].activeEarningBg,
          borderRadius: 12,
          marginTop: 14
        }}>
        <CView row style={styles.streakContainer}>
          <Image source={appImages.activity} />
          <CText size="medium"> &nbsp; Activity Earning</CText>
        </CView>
      </ImageBackground>
      <CView>
        <CView style={styles.streakCountContainer}>
          {activities?.length > 0 &&
            activities?.slice(0, showItem).map((item, i) => (
              <CView key={i} style={styles.itemStyle}>
                <ActivityCard theme={theme} data={item} />
              </CView>
            ))}
          <Pressable onPress={() => handleMoreDetails()}>
            <CView row style={styles.moreDetails}>
              <CText
                size="normal"
                text={!isExpanded ? 'More' : 'Less'}
                style={styles.textStyle}
              />
              <Image
                source={
                  !isExpanded ? appImages.arrowDownIcon : appImages.arrowUpIcon
                }
                style={{ tintColor: Colors[theme].white }}
              />
            </CView>
          </Pressable>
        </CView>
      </CView>
    </CView>
  )
}

export default ActivityEarning
