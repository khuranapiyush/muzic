import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { SafeAreaView, ScrollView } from 'react-native'
import {
  fetchCreatorAudienceData,
  fetchCreatorGraphData,
  fetchCreatorTopContent
} from '../../../../../api/creatorDashboard'
import {
  get7DayDifference,
  toFixedWithoutRound
} from '../../../../../utils/common'
import ProgressBar from '../../../../common/ProgressBar'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import Graph from '../../UI/Graph'
import VideoContent from '../../UI/VideoContent'
import styles from './style'
import { useTheme } from '@react-navigation/native'

const CreatorEarnings = () => {
  const [topContent, setTopContent] = useState()
  const [audienceData, setAudienceData] = useState()
  const [graphData, setGraphData] = useState()

  const { mode } = useTheme()

  useQuery({
    queryKey: ['fetchCreatorAudienceData'],
    queryFn: fetchCreatorAudienceData.bind(this, {
      type: 'earning',
      startDate: '2023-09-07',
      endDate: '2023-09-14'
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setAudienceData(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorGraphDataEarning'],
    queryFn: fetchCreatorGraphData.bind(this, {
      type: 'earnings',
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
      type: 'earnings',
      ...get7DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setTopContent(data)
    }
  })

  const handleCardClick = () => {}
  return (
    <SafeAreaView>
      <ScrollView>
        <CView style={styles.wrapper}>
          <CView centered row style={styles.durations}>
            <CText size="smallBold">{graphData?.duration}</CText>
          </CView>
          <CText style={styles.marginTop20}>
            {graphData?.graph?.length > 0 && (
              <Graph theme={mode} graphData={graphData} />
            )}
          </CText>
          <CView style={styles.paddingTop15}>
            <CText size="mediumBold">{topContent?.title}</CText>
            {topContent?.topContent.map(item => (
              <VideoContent
                key={item?.videoId}
                title={topContent?.title}
                data={item}
                handleClick={handleCardClick}
                type="earnings"
              />
            ))}
          </CView>
          <CView style={styles.paddingTop15}>
            <CText size="mediumBold">{audienceData?.mainHeading}</CText>
            <CView style={styles.audienceLevel}>
              <CText size="normalBold">{audienceData?.title}</CText>
              {audienceData?.audiencePerGraph?.map(item => (
                <CView style={styles.paddingTop15}>
                  <CView row style={styles.levelPercentage}>
                    <CText>{item?.level}</CText>
                    <CText>{toFixedWithoutRound(item?.percentage)}%</CText>
                  </CView>
                  <ProgressBar
                    progress={item?.percentage}
                    withPercent={false}
                    color="#3454FA"
                    height={8}
                    borderRadius={3}
                  />
                </CView>
              ))}
            </CView>
          </CView>
        </CView>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreatorEarnings
