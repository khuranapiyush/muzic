import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import {
  fetchCreatorContentAnalysis,
  fetchCreatorGraphData,
  fetchCreatorTopContent
} from '../../../../../api/creatorDashboard'
import { get7DayDifference } from '../../../../../utils/common'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import Graph from '../../UI/Graph'
import VideoContent from '../../UI/VideoContent'
import styles from './style'
import { useTheme } from '@react-navigation/native'

const CreatorEngagement = () => {
  const [topContent, setTopContent] = useState()
  const [graphData, setGraphData] = useState()
  const [contentAnalysis, setContentAnalysis] = useState()
  const { mode } = useTheme()
  useQuery({
    queryKey: ['fetchCreatorGraphDataEarning'],
    queryFn: fetchCreatorGraphData.bind(this, {
      type: 'engagement',
      ...get7DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setGraphData(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorTopContentEarning'],
    queryFn: fetchCreatorTopContent.bind(this, {
      type: 'engagement',
      ...get7DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setTopContent(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorContentAnalysis'],
    queryFn: fetchCreatorContentAnalysis.bind(this, {
      type: 'engagement',
      ...get7DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setContentAnalysis(data)
    }
  })

  const handleCardClick = () => {}
  return (
    <SafeAreaView>
      <ScrollView>
        <CView style={styles.wrapper}>
          <CView centered row style={styles.alignDuration}>
            <CText size="smallBold">{graphData?.duration}</CText>
          </CView>
          <CText style={styles.marginTop20}>
            {graphData?.graph?.length > 0 && (
              <Graph graphData={graphData} theme={mode} />
            )}
          </CText>
          <CView style={styles.paddingTop20}>
            <CText size="mediumBold">{topContent?.title}</CText>
            {topContent?.topContent.map(item => (
              <VideoContent
                key={item.videoId}
                title={topContent?.title}
                data={item}
                handleClick={handleCardClick}
                type="engagement"
              />
            ))}
          </CView>
          <CView style={styles.paddingTop20}>
            <CView row style={styles.styleTitle}>
              <CText size="mediumBold">{contentAnalysis?.title}</CText>
              <CText size="mediumBold">{contentAnalysis?.value}</CText>
            </CView>
            <CText style={styles.textColor}>{contentAnalysis?.summary}</CText>
            <CView style={styles.audienceLevel}>
              {contentAnalysis?.items?.map(item => (
                <CView key={item.value} style={styles.paddingVertical10}>
                  <CView row style={styles.titleStyle}>
                    <CText>{item?.title}</CText>
                    <CText>{item?.value}</CText>
                  </CView>
                </CView>
              ))}
            </CView>
          </CView>
        </CView>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreatorEngagement
