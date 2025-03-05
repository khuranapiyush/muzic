import React, { useState } from 'react'
import CView from '../../../common/core/View'
import CText from '../../../common/core/Text'
import { Image, Pressable } from 'react-native'
import appImages from '../../../../resource/images'
import styles from './style'
import { useQuery } from '@tanstack/react-query'
import { fetchStoriesTemplates } from '../../../../api/uploadContent'
import { useNavigation } from '@react-navigation/native'
import ROUTE_NAME from '../../../../navigator/config/routeName'

const UploadStories = ({ handleVideoUpload }) => {
  const navigation = useNavigation()
  const [templateData, setTemplateData] = useState()

  useQuery({
    queryKey: ['fetchStoriesTemplates'],
    queryFn: fetchStoriesTemplates,
    refetchOnMount: true,
    onSuccess: ({ data }) => {
      setTemplateData(data.data)
    }
  })
  const handleStoryTemplate = item => {
    navigation.navigate(ROUTE_NAME.StoryPost, { template: item })
  }

  return (
    <CView style={{ flex: 1 }}>
      <CView style={styles.wrapper}>
        {templateData?.templates?.map((item, i) => (
          <Pressable
            onPress={() => handleStoryTemplate(item)}
            key={`${item}'_'${i}`}
            style={{
              width: '32%',
              height: 203,
              paddingBottom: 8
            }}>
            <Image source={{ uri: item }} style={styles.itemStyle} />
          </Pressable>
        ))}
      </CView>
    </CView>
  )
}

export default UploadStories
