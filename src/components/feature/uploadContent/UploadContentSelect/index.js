import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Image,
  NativeModules,
  Platform,
  Pressable,
  SafeAreaView
} from 'react-native'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import getStyles from './style'

import { useIsFocused, useNavigation, useTheme } from '@react-navigation/native'
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions'
import { TabBar, TabView } from 'react-native-tab-view'
import useToaster from '../../../../hooks/useToaster'
import ROUTE_NAME from '../../../../navigator/config/routeName'
import GoLivePrev from '../GoLivePreview'
import UploadShorties from '../UploadShorties'
import UploadVideo from '../UploadVideo'
const { FilePicker } = NativeModules

const UploadContentSelect = ({ route }) => {
  const navigation = useNavigation()

  const isFocused = useIsFocused()
  const { showToaster } = useToaster()
  const [contentType, setContentType] = useState('video')

  const { mode } = useTheme()
  const styles = getStyles(mode)

  const [index, setIndex] = useState(
    route?.params?.type == 'stories'
      ? 2
      : route?.params?.type == 'shorties'
      ? 1
      : 0
  )

  useEffect(() => {
    if (index == 0) {
      setContentType('video')
    } else {
      setContentType('shortie')
    }
  }, [index])

  console.log('🚀 ~ UploadContentSelect ~ index:', index)

  const [routes] = useState([
    { key: 'video', title: 'Video' },
    { key: 'shorties', title: 'Shorties' },
    // { key: 'stories', title: 'Stories' },
    { key: 'live', title: 'Go Live' }
  ])

  // const aspectRatio = useMemo(
  //   () => (contentType == 'shortie' ? 0.5625 : 1.77),
  //   [contentType]
  // )
  const fileSize = useMemo(
    () => (contentType == 'shortie' ? 800 : 5000),
    [contentType]
  )

  const checkAspectRatio = useCallback(
    (videoFile, expectedRatio = 0.5625, marginOfError) => {
      const actualRatio = parseFloat(
        videoFile.width / videoFile.height
      ).toFixed(2)

      const [min, max] = [
        expectedRatio - expectedRatio * (marginOfError / 100),
        expectedRatio + expectedRatio * (marginOfError / 100)
      ]

      if (actualRatio >= min && actualRatio <= max) {
        console.log('checkAspectRatio', true)
        return true
      } else {
        console.log('checkAspectRatio', false)
        return false
      }
    },
    []
  )

  const requestPhotoPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.PHOTO_LIBRARY
        const status = await check(permission)

        if (status !== RESULTS.GRANTED) {
          const result = await request(permission)
          if (result === RESULTS.GRANTED) {
            return true
          } else {
            return false
          }
        } else if (status === RESULTS.GRANTED) {
          return true
        }
      }
    } catch (error) {
      console.log('Error in requestMediaPermission', error)
      return false
    }
  }, [])

  // const handleImagePicker = useCallback(async () => {
  //   const options = {
  //     mediaType: 'video',
  //     formatAsMp4: true
  //   }

  //   try {
  //     const result = await launchImageLibrary(options)

  //     if (result?.assets != null) {
  //       if (result.assets[0].fileSize > 1024 * 1024 * fileSize) {
  //         showToaster({
  //           type: 'error',
  //           text1: 'Error',
  //           text2: `Video Should be less than ${
  //             contentType == 'shortie' ? '800 MB' : '5GB'
  //           }`
  //         })
  //         return
  //       }

  //       if (checkAspectRatio(result.assets[0], aspectRatio, 20)) {
  //         navigation.navigate(ROUTE_NAME.UploadContent, {
  //           fileContent: result.assets[0],
  //           contentType: contentType
  //         })
  //       } else {
  //         showToaster({
  //           type: 'error',
  //           text1: 'Error',
  //           text2: `Video Should maintain aspect ratio of ${
  //             contentType == 'shortie' ? '9/16' : '16/9'
  //           }`
  //         })
  //       }
  //     } else if (result.didCancel) {
  //     }
  //   } catch (error) {
  //     console.log('Error in handleImagePicker', error)
  //   }
  // }, [checkAspectRatio, navigation, showToaster])

  const handleImagePicker = useCallback(async () => {
    try {
      // const result = await launchImageLibrary(options)
      const result = await FilePicker.pickVideo()

      if (result?.assets != null) {
        const videoAsset = result.assets[0] // Get the first selected video
        const videoSize = videoAsset.fileSize

        // Check file size asynchronously
        if (videoSize > 1024 * 1024 * 800) {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: `Video Should be less than ${
              contentType == 'shortie' ? '800 MB' : '5GB'
            }`
          })
          return
        }

        if (checkAspectRatio(videoAsset, 0.5625, 40)) {
          navigation.navigate(ROUTE_NAME.UploadContent, {
            fileContent: videoAsset,
            contentType: contentType,
            videoType: 'shortie'
          })
        } else {
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: 'Video should maintain aspect ratio of 9/16'
          })
        }
      } else if (result.didCancel) {
        // Handle cancellation
        console.log('User cancelled the media selection')
      }
    } catch (error) {
      console.error('Error in handleImagePicker', error)
    }
  }, [checkAspectRatio, navigation, showToaster])

  const handleShortieUpload = useCallback(async () => {
    setContentType('shortie')
    try {
      const permissionGranted = await requestPhotoPermission()
      if (permissionGranted) {
        handleImagePicker()
      }
    } catch (error) {
      console.log('Error requesting permissions:', error)
    }
  }, [handleImagePicker, requestPhotoPermission])

  const handleTabChange = item => {
    // if (item == 2) {
    //   navigation.navigate(ROUTE_NAME.GoInstaLive)
    // } else {
    //   setIndex(item)
    // }

    setIndex(item)
  }

  const renderTabBar = props => {
    return (
      <TabBar
        {...props}
        renderLabel={({ route, focused }) => (
          <CText
            centered
            style={focused ? styles.activeTabLabel : styles.inactiveTabLabel}
            size="normal">
            {route.title}
          </CText>
        )}
        style={styles.tabBarContainer}
        indicatorStyle={styles.activeIndicatorStyle}
      />
    )
  }

  useEffect(() => {
    if (route?.params?.type == 'stories') {
      setIndex(2)
    }
  }, [isFocused, route?.params?.type])

  const handleBack = () => {
    navigation.goBack()
  }

  const handleGoLive = title => {
    navigation.navigate(ROUTE_NAME.GoInstaLive, { title: title })
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CView
        row
        centered
        style={{
          alignSelf: 'flex-start',
          marginBottom: 10
        }}>
        <Pressable onPress={handleBack}>
          <Image
            source={appImages.arrowLeftIcon}
            style={styles.backArrowIcon}
          />
        </Pressable>
        <CText
          numberOfLines={1}
          style={styles.headerTitle}
          size="bricolageHeading">
          Upload Content
        </CText>
      </CView>

      {index == 0 ? (
        <CView style={styles.modalContent}>
          <UploadVideo />
        </CView>
      ) : index == 1 ? (
        <CView style={styles.modalContent}>
          <UploadShorties handleShortieUpload={handleShortieUpload} />
        </CView>
      ) : index == 2 ? (
        <CView style={{ flex: 1 }}>
          <GoLivePrev goLive={handleGoLive} />
          {/* <UploadStories handleVideoUpload={handleShortieUpload} /> */}
        </CView>
      ) : (
        <></>
      )}

      <CView style={styles.tabViewContainer}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={() => <></>}
          renderTabBar={renderTabBar}
          onIndexChange={handleTabChange}
        />
      </CView>
    </SafeAreaView>
  )
}

export default UploadContentSelect
