import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Pressable
} from 'react-native'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import LockedView from './UI/LockedView'
import UnlockedView from './UI/UnlockedView'
import getStyles from './style'
import Colors from '../../../common/Colors'

const DailyStreak = ({ page = 'earnCoin', dailyStreak, coinEarn, theme }) => {
  const navigation = useNavigation()
  const [isExpanded, setIsExpanded] = useState(false)
  const showItem = isExpanded ? dailyStreak.clonedArray?.length : 10

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
      <CView row style={styles.wrapper}>
        <CView row centered>
          {/* <CView style={styles.coinContainer}>
            <Image source={appImages.coin} style={styles.coinStyle} />
          </CView> */}
          <CText
            size="mediumBold"
            text="Points Earned Today"
            style={styles.textStyle}
          />
        </CView>
        <CText
          centered
          size="mediumBold"
          text={coinEarn?.coinEarnToday}
          style={styles.textStyle}
        />
      </CView>

      <CView row centered style={styles.streakContainer}>
        <CView row centered>
          <Image source={appImages.fireIcon} />
          <CText size="medium"> &nbsp;Daily Streak</CText>
        </CView>
        <CText>{dailyStreak?.streakCount} Days</CText>
      </CView>
      <CView>
        <CView style={styles.streakCountContainer}>
          {dailyStreak != null ? (
            <CView style={styles.streakCountStyle}>
              {dailyStreak?.clonedArray?.length > 0 &&
                dailyStreak.clonedArray.slice(0, showItem).map((item, i) => (
                  <CView key={i} style={styles.itemStyle}>
                    {!item.isLock ? (
                      <LockedView item={item} />
                    ) : (
                      <UnlockedView item={item} />
                    )}
                  </CView>
                ))}
            </CView>
          ) : (
            <ActivityIndicator
              color={Colors.Palette.brandPink}
              size={'large'}
            />
          )}
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

export default DailyStreak
