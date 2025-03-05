import React, { useState } from 'react'

import { useNavigation, useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Image, Pressable } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  fetchCreatorInsightsPage,
  fetchCreatorTopContent
} from '../../../../api/creatorDashboard'
import ROUTE_NAME from '../../../../navigator/config/routeName'
import appImages from '../../../../resource/images'
import { get30DayDifference, numberWithComma } from '../../../../utils/common'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import VideoContent from '../UI/VideoContent'
import getStyle from './style'

const CreatorInsights = () => {
  const navigation = useNavigation()
  const [creatorInsightData, setCreatorInsightData] = useState()

  const { mode } = useTheme()
  console.log('🚀 ~ CreatorInsights ~ mode:', mode)
  const styles = getStyle(mode)

  const handleClick = item => {
    if (item.type == 'EARNINGS') {
      navigation.navigate(ROUTE_NAME.CreatorEarnings)
    } else if (item.type == 'VIEWS') {
      navigation.navigate(ROUTE_NAME.CreatorViews)
    } else if (item.type == 'ENGAGEMENT') {
      navigation.navigate(ROUTE_NAME.CreatorEngagement)
    }
  }

  const [topContent, setTopContent] = useState()

  const handleCardClick = item => {
    alert('handleCardClick')
  }

  useQuery({
    queryKey: ['fetchCreatorInsightsPage'],
    queryFn: fetchCreatorInsightsPage.bind(this, {
      type: 'insights',
      ...get30DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setCreatorInsightData(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorTopContentInsights'],
    queryFn: fetchCreatorTopContent.bind(this, {
      type: 'insights',
      ...get30DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setTopContent(data)
    }
  })

  return (
    <ScrollView>
      <CView style={styles.wrapper}>
        <CView centered row style={{ justifyContent: 'flex-start' }}>
          <CText size="smallBold">
            {creatorInsightData?.overViewsDetails?.duration}
          </CText>
          <CText size="small" style={styles.textColor}>
            {'   '} {creatorInsightData?.overViewsDetails?.summary}
          </CText>
        </CView>

        <CView style={styles.paddingTop15}>
          <CText size="mediumBold">
            {creatorInsightData?.overViewsDetails?.title}
          </CText>
        </CView>
        <CView style={styles.paddingTop15}>
          <CText size="small" style={styles.textColor}>
            {creatorInsightData?.overViewsDetails?.overViewSummary}
          </CText>
        </CView>
        {creatorInsightData?.overViewsDetails?.propertyDetails?.length > 0 &&
          creatorInsightData?.overViewsDetails?.propertyDetails?.map(
            (item, i) => (
              <Pressable onPress={() => handleClick(item)}>
                <CView key={i} row centered style={styles.levelContainer}>
                  <CText text={item.heading} style={styles.itemLabelStyle} />
                  <CView row centered>
                    <CView centered>
                      <CText text={numberWithComma(item?.value || 0)} />
                      <CView row centered style={{ paddingTop: 6 }}>
                        <Image
                          source={appImages.increaseIcon}
                          style={styles.increaseIconStyle}
                        />
                        <CText
                          style={styles.increaseStyle}
                          text={item?.percentage}
                        />
                      </CView>
                    </CView>

                    <Image
                      source={appImages.arrowRightAngle}
                      style={styles.iconStyle}
                    />
                  </CView>
                </CView>
              </Pressable>
            )
          )}

        <CView style={styles.paddingTop15}>
          <CText size="mediumBold">{topContent?.title}</CText>
          {topContent?.topContent.map(item => (
            <VideoContent
              key={item?.videoId}
              title={topContent?.title}
              data={item}
              handleClick={handleCardClick}
              type="views"
            />
          ))}
        </CView>
      </CView>
    </ScrollView>
  )
}

export default CreatorInsights
