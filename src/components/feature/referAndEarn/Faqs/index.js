import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { FlatList, SafeAreaView } from 'react-native'
import { fetchFaqs } from '../../../../api/referAndEarn'
import CView from '../../../common/core/View'
import FaqList from './UI/FaqList'
import styles from './style'
import { useTheme } from '@react-navigation/native'

const Faqs = () => {
  const [faqData, setFaqData] = useState([])
  const { mode } = useTheme()

  useQuery({
    queryKey: ['fetchFaqs'],
    queryFn: fetchFaqs,
    refetchOnMount: true,
    onSuccess: res => {
      const data = res.data.data
      setFaqData(data)
    }
  })

  const renderItem = ({ item }) => {
    return (
      <CView>
        <FaqList item={item} mode={mode} />
      </CView>
    )
  }
  return (
    <SafeAreaView style={styles.wrapper}>
      <CView style={styles.container}>
        <FlatList
          data={faqData}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      </CView>
    </SafeAreaView>
  )
}

export default Faqs
