import React, { useCallback, useEffect, useState } from 'react'
import CView from '../../../common/core/View'
import CText from '../../../common/core/Text'
import {
  fetchReferralInfo,
  fetchReferralList
} from '../../../../api/referAndEarn'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ActivityIndicator, FlatList, Image, SafeAreaView } from 'react-native'
import getStyle from './styles'
import { Colors } from '../../../common/core/colors'
import { useTheme } from '@react-navigation/native'

const Referrals = () => {
  const [referralInfo, setReferralInfo] = useState()
  const [referralList, setReferralList] = useState()

  const { mode } = useTheme()
  const styles = getStyle(mode)

  const [currentIndex] = useState(0)
  const [onEndReachedDuringMomentum, setOnEndReachedDuringMomentum] =
    useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [page, setPage] = useState(1)

  useQuery({
    queryKey: ['fetchReferralInfo'],
    queryFn: fetchReferralInfo,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setReferralInfo(data)
    }
  })

  const { mutate: getReferralList } = useMutation(
    () => fetchReferralList(page),
    {
      onSuccess: res => {
        if (page > 1) {
          setReferralList([...referralList, ...res.data.data])
        } else {
          setReferralList(res?.data?.data)
        }
        setIsLoading(false)
      },
      onError: error => {
        setIsLoading(false)
      }
    }
  )

  useEffect(() => {
    setIsLoading(true)
    getReferralList()
  }, [getReferralList, page])

  const keyExtractor = (item, index) => item?._id + index.toString()

  const renderItem = useCallback(
    ({ item, index }) => (
      <CView>
        {index == 0 && (
          <CView style={styles.titleContainer}>
            <CText size="mediumBold">Referral Cash Leaderboard</CText>
          </CView>
        )}
        <CView centered row style={styles.itemContainer}>
          <CView centered row>
            <Image
              source={{ uri: item?.profilePic }}
              style={styles.profilePicStyle}
            />
            <CText size="normal">{item.user}</CText>
          </CView>
          <CText size="normalBold" style={styles.amountStyle}>
            {item.amountEarned}
          </CText>
        </CView>
      </CView>
    ),
    []
  )

  const handleReachEnd = useCallback(() => {
    if (!onEndReachedDuringMomentum) {
      setOnEndReachedDuringMomentum(true)
      setPage(page + 1)
    }
  }, [onEndReachedDuringMomentum, page])

  const handleScrollStart = useCallback(() => {
    setOnEndReachedDuringMomentum(false)
  }, [])

  return (
    <SafeAreaView style={styles.wrapper}>
      <FlatList
        ListHeaderComponent={
          <CView style={styles.container} row>
            <CView>
              <CText style={styles.coloredText}>
                {referralInfo?.totalReferrals || '0'}
              </CText>
              <CText style={styles.subText}>Referral Sent</CText>
            </CView>
            <CView>
              <CText style={styles.coloredText}>
                {referralInfo?.successReferrals || '0'}
              </CText>
              <CText style={styles.subText}>Successful Referral</CText>
            </CView>
            <CView>
              <CText style={styles.coloredText}>
                ₹{referralInfo?.totalAmount || '0'}
              </CText>
              <CText style={styles.subText}>Cash Earned</CText>
            </CView>
          </CView>
        }
        showsVerticalScrollIndicator={false}
        data={referralList}
        keyExtractor={keyExtractor}
        extraData={currentIndex}
        renderItem={renderItem}
        onEndReached={handleReachEnd}
        bounces={false}
        onMomentumScrollBegin={handleScrollStart}
        ListFooterComponent={
          isLoading && (
            <ActivityIndicator
              color={Colors.Palette.brandPink}
              size={'large'}
            />
          )
        }
      />
    </SafeAreaView>
  )
}

export default Referrals
