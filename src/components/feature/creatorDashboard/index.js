import { useNavigation, useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useState } from 'react'
import { Pressable, SafeAreaView, ScrollView } from 'react-native'
import {
  fetchCreatorCommunityReferral,
  fetchCreatorGraphData,
  fetchCreatorLevelInfo,
  fetchCreatorLevelUpCriteria,
  fetchCreatorRedeemCoin
} from '../../../api/creatorDashboard'
import ROUTE_NAME from '../../../navigator/config/routeName'
import { get7DayDifference } from '../../../utils/common'
import CText from '../../common/core/Text'
import CView from '../../common/core/View'
import Graph from './UI/Graph'
import LevelUpCriteria from './UI/LevelUpCriteria'
import TileList from './UI/TileList'
import styles from './style'

const CreatorDashboard = () => {
  const navigation = useNavigation()
  const [creatorLevelInfo, setCreatorLevelInfo] = useState()
  const [creatorRedeemCoin, setCreatorRedeemCoin] = useState([])
  const [creatorCommunityReferrals, setCreatorCommunityReferrals] = useState([])
  const [creatorLevelUpCriteria, setCreatorLevelUpCriteria] = useState([])
  const [creatorGraphData, setCreatorGraphData] = useState([])

  const { mode } = useTheme()

  useQuery({
    queryKey: ['fetchCreatorLevelInfo'],
    queryFn: fetchCreatorLevelInfo,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setCreatorLevelInfo(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorRedeemCoin'],
    queryFn: fetchCreatorRedeemCoin,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setCreatorRedeemCoin(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorCommunityReferral'],
    queryFn: fetchCreatorCommunityReferral,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setCreatorCommunityReferrals(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorLevelUpCriteria'],
    queryFn: fetchCreatorLevelUpCriteria,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setCreatorLevelUpCriteria(data)
    }
  })

  useQuery({
    queryKey: ['fetchCreatorGraphData'],
    queryFn: fetchCreatorGraphData.bind(this, {
      ...get7DayDifference(),
      type: 'earning'
    }),
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setCreatorGraphData(data)
    }
  })

  const handleCreatorRedeem = useCallback(() => {
    navigation.navigate(ROUTE_NAME.Rewards)
  }, [navigation])

  const handleInsight = useCallback(() => {
    navigation.navigate(ROUTE_NAME.CreatorInsights)
  }, [navigation])

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView>
        <CView style={styles.padding10}>
          <CView row centered style={styles.headingContainer}>
            <CText>Current Level:</CText>
            <CView style={styles.levelStyle}>
              <CText>{creatorLevelInfo?.creatorInfoV2?.level}</CText>
            </CView>
          </CView>
          <CView row style={styles.insightStyle}>
            <CText size="mediumBold">Creator Insights</CText>
            <Pressable onPress={handleInsight}>
              <CText style={styles.textInPink}>See all</CText>
            </Pressable>
          </CView>
          <CView>
            {creatorGraphData?.graph?.length > 0 && (
              <Graph graphData={creatorGraphData} theme={mode} />
            )}
          </CView>
          <CView style={styles.paddingTop20}>
            {creatorRedeemCoin && (
              <TileList
                theme={mode}
                title={creatorRedeemCoin[0]?.title}
                data={creatorRedeemCoin[0]?.Name}
                handleClick={handleCreatorRedeem}
              />
            )}
          </CView>
          <CView style={styles.paddingTop20}>
            {creatorCommunityReferrals && (
              <TileList
                theme={mode}
                title="Community Referrals"
                data={creatorCommunityReferrals}
              />
            )}
          </CView>
          <CView style={styles.paddingTop20}>
            <CText size="mediumBold">Level Up Criteria</CText>
            {creatorLevelUpCriteria.map((item, idx) => (
              <CView key={item?.level} style={styles.paddingTop10}>
                <LevelUpCriteria theme={mode} data={item} />
              </CView>
            ))}
          </CView>
        </CView>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CreatorDashboard
