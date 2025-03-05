import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'
import { useDispatch } from 'react-redux'
import { fetchMarketScrollList } from '../../../../api/trade'
import { setSelectedTabId } from '../../../../stores/slices/trade'
import CView from '../../../common/core/View'
import ScrollableTabs from './UI/ScrollableTabs'
import styles from './style'

const Market = () => {
  const dispatch = useDispatch()
  const [scrollList, setScrollList] = useState([])
  useQuery({
    queryKey: ['fetchMarketScrollList'],
    queryFn: fetchMarketScrollList,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      const updatedArray = data.map(item => ({
        ...item,
        key: item._id,
        listData: []
      }))
      dispatch(setSelectedTabId(data[0]._id))
      setScrollList(updatedArray)
    }
  })
  return (
    <SafeAreaView style={styles.container}>
      <CView style={styles.container}>
        {scrollList?.length > 0 && <ScrollableTabs scrollList={scrollList} />}
      </CView>
    </SafeAreaView>
  )
}

export default Market
