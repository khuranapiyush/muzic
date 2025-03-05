import React, { useEffect, useState } from 'react'
import CView from '../../common/core/View'
import { Button, Image, SafeAreaView, TouchableOpacity } from 'react-native'
import CText from '../../common/core/Text'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchStories, storyTrackEvents } from '../../../api/uploadContent'
import LinearGradient from 'react-native-linear-gradient'
import styles from './style'
import appImages from '../../../resource/images'
import { useNavigation } from '@react-navigation/native'
import ROUTE_NAME from '../../../navigator/config/routeName'
import InstagramStories from '@birdwingo/react-native-instagram-stories'
import { getUniqueId } from '../../../utils/common'

const Stories = ({ stories }) => {
  const navigation = useNavigation()

  const { mutate: handleTrackEvents } = useMutation(obj =>
    storyTrackEvents(obj)
  )
  const [storyData, setStoryData] = useState([])

  const handleTouchStory = item => {
    handleTouchStory
  }

  useEffect(() => {
    let temp = stories?.map(story => ({
      id: story.user,
      name: story.username,
      imgUrl: story.profilePic,

      stories: story.items.map(item => ({
        id: item._id,
        sourceUrl: item.url,
        type: 'image',
        text: item.text
      }))
    }))

    setStoryData(temp)
  }, [])

  const updateSeenStories = (userId, storyId) => {
    let obj = {
      watchId: getUniqueId()
    }
    handleTrackEvents({ id: storyId, data: obj })
  }

  const handlePlus = () => {
    navigation.navigate(ROUTE_NAME.UploadContentSelect, { type: 'stories' })
  }

  return (
    <CView>
      {stories && (
        <CView>
          <InstagramStories
            stories={storyData}
            modalAnimationDuration={200}
            storyAvatarSize={25}
            avatarSize={50}
            progressColor="gray"
            avatarListContainerStyle={{
              paddingHorizontal: 10
            }}
            showName={true}
            nameTextStyle={{
              marginHorizontal: 33,
              backgroundColor: 'white',
              height: 1,
              width: 1
            }}
            closeIconColor="#FFF"
            saveProgress={true}
            avatarBorderColors={['#E14084', '#3454FA', '#54B5BB']}
            avatarSeenBorderColors={['#c1c1c1']}
            animationDuration={5000}
            textStyle={{ color: '#FFF', paddingLeft: 8, fontWeight: '500' }}
            imageStyles={{
              borderRadius: 10
            }}
            onStoryStart={updateSeenStories}
          />

          <TouchableOpacity onPress={handlePlus}>
            <CView centered style={styles.indicatorGradientBox}>
              <CText
                centered
                style={{
                  color: '#FFF',
                  fontSize: 18,
                  fontWeight: '800'
                }}>
                +
              </CText>
            </CView>
          </TouchableOpacity>
        </CView>
      )}
    </CView>
  )
}

export default Stories
