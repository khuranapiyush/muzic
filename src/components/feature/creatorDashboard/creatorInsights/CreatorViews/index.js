import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Image, SafeAreaView, ScrollView } from 'react-native'
import {
  fetchCreatorContentInteractions,
  fetchCreatorGraphData,
  fetchCreatorTopContent
} from '../../../../../api/creatorDashboard'
import CText from '../../../../common/core/Text'
import CView from '../../../../common/core/View'
import Graph from '../../UI/Graph'
import VideoContent from '../../UI/VideoContent'
import styles from './style'
import { get7DayDifference } from '../../../../../utils/common'
import { useTheme } from '@react-navigation/native'

const CreatorView = () => {
  const [topContent, setTopContent] = useState()
  const [contentInteractionData, setContentInteractionData] = useState()
  const [graphData, setGraphData] = useState()
  const { mode } = useTheme()
  useQuery({
    queryKey: ['fetchCreatorGraphDataEarning'],
    queryFn: fetchCreatorGraphData.bind(this, {
      type: 'views',
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
      type: 'views',
      ...get7DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setTopContent(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorContentInteractions'],
    queryFn: fetchCreatorContentInteractions.bind(this, {
      type: 'views',
      ...get7DayDifference()
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setContentInteractionData(data)
    }
  })

  const handleCardClick = () => {}
  return (
    <SafeAreaView>
      <ScrollView>
        <CView style={styles.wrapper}>
          <CView centered row style={styles.durationStyle}>
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
                key={item?.videoId}
                title={topContent?.title}
                data={item}
                handleClick={handleCardClick}
                type="views"
              />
            ))}
          </CView>
          <CView style={styles.paddingTop20}>
            <CView row style={styles.interactionContainer}>
              <CText size="mediumBold">Content Interactions</CText>
              {contentInteractionData && (
                <CText size="mediumBold">
                  {contentInteractionData['Content Interactions']}
                </CText>
              )}
            </CView>
            {contentInteractionData && (
              <CText style={styles.textColor}>
                {contentInteractionData['summary']}
              </CText>
            )}
            <CView style={styles.audienceLevel}>
              {contentInteractionData &&
                Object.entries(contentInteractionData)
                  .slice(2)
                  .map(([key, value]) => (
                    <CView key={key} row centered style={styles.itemContainer}>
                      <CView row centered>
                        <Image
                          source={{ uri: value.icon }}
                          style={styles.iconStyle}
                        />
                        <CText size="normalBold">{key}</CText>
                      </CView>
                      <CText size="normalBold"> {value?.value}</CText>
                    </CView>
                  ))}
            </CView>
          </CView>
        </CView>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreatorView
