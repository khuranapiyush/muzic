import { useMutation } from '@tanstack/react-query'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, TouchableOpacity } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import {
  awsThumbPresignedUrl,
  awsVideoPresignedUrl
} from '../../../../api/uploadContent'
import fetcher from '../../../../dataProvider'
import useToaster from '../../../../hooks/useToaster'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import CView from '../../../common/core/View'
import style from './style'

function ThumbnailUpload({
  mediaUploadInfo,
  setMediaUploadInfo,
  contentType = 'shortie'
}) {
  const { showToaster } = useToaster()
  const [selectedThumb, setSelectedThumb] = useState('')

  const aspectRatio = useMemo(
    () => (contentType == 'shortie' ? 0.5625 : 1.77),
    [contentType]
  )

  const checkAspectRatio = useCallback(
    (videoFile, expectedRatio = 1.77, marginOfError) => {
      let actualRatio
      // if (expectedRatio == 1.77) {
      //   actualRatio = parseFloat(videoFile.height / videoFile.width).toFixed(2)
      // } else {
      actualRatio = parseFloat(videoFile.width / videoFile.height).toFixed(2)
      // }

      const [min, max] = [
        expectedRatio - expectedRatio * (marginOfError / 100),
        expectedRatio + expectedRatio * (marginOfError / 100)
      ]
      console.log('🚀 ~ actualRatio:', actualRatio)
      console.log('🚀 ~ expectedRatio:', expectedRatio)
      console.log('🚀 ~ max:', max)
      console.log('🚀 ~ min:', min)

      if (actualRatio >= min && actualRatio <= max) {
        return true
      } else {
        return false
      }
    },
    []
  )
  const handleImagePicker = useCallback(async () => {
    const options = {
      title: 'Select Thumbnail',
      mediaType: 'photo',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    }
    const result = await launchImageLibrary(options)
    if (result?.assets != null) {
      // setSelectedThumb(result?.assets)
      let ratio = contentType == 'shortie' ? 0.5625 : 1.77
      console.log('🚀 ~ handleImagePicker ~ contentType:', contentType)
      if (checkAspectRatio(result.assets[0], ratio, 50)) {
        setSelectedThumb(result?.assets)
      } else {
        showToaster({
          type: 'error',
          text1: 'Error',
          text2: `Video Should maintain aspect ratio of ${
            contentType == 'shortie' ? '9/16' : '16/9'
          }`
        })
      }
    }
  }, [])

  const uploadToAws = async signedRequest => {
    try {
      const uri = selectedThumb[0]['uri']
      const response = await fetch(uri)
      const imgBlob = await response.blob()

      fetch(signedRequest, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedThumb[0]?.type || 'image/jpg'
        },
        body: imgBlob
      })
        .catch(error => {
          console.error('Error:', error)
          showToaster({
            type: 'error',
            text1: 'Error',
            text2: 'Something went wrong'
          })
          return error.text()
        })

        .then(response => {
          showToaster({
            type: 'success',
            text1: 'Success',
            text2: 'Thumbnail uploaded!'
          })
        })
    } catch (err) {
      console.log('🚀 ~ uploadToAws ~ err:', err)
    }
  }

  const { mutate: awsThumbPresignedUrlApi } = useMutation(
    data => awsVideoPresignedUrl(data),
    {
      onSuccess: ({ data }) => {
        setMediaUploadInfo({
          ...mediaUploadInfo,
          thumbnailUploadId: `${data.data.uuid}.${
            selectedThumb[0].type.split('/')[1]
          }`
        })

        uploadToAws(data.data.presignedUrl)
      },
      onError: err => {
        alert(err.response.data.message)
      }
    }
  )

  useEffect(() => {
    if (selectedThumb) {
      awsThumbPresignedUrlApi({
        contentType: selectedThumb[0]?.type || 'image/jpg'
      })
    }
  }, [awsThumbPresignedUrlApi, selectedThumb])

  return (
    <CView>
      <CText size="large" style={style.thumbnailContainer}>
        Add Thumbnail*
      </CText>

      <TouchableOpacity onPress={handleImagePicker}>
        <CView style={style.thumbnail}>
          {selectedThumb ? (
            <CView style={{ flex: 1 }}>
              <Image
                source={{ uri: selectedThumb[0]?.uri?.replace('file://', '') }}
                style={style.selectedThumbnailImage}
              />
            </CView>
          ) : (
            <Image
              source={appImages.galleryIcon}
              style={style.thumbnailImage}
            />
          )}
        </CView>
      </TouchableOpacity>

      <TouchableOpacity
        style={style.uploadNewContainer}
        onPress={handleImagePicker}>
        <Image
          source={appImages.newUploadIcon}
          style={style.newUploadIconStyle}
        />
        <CText size="normal" style={style.uploadNew}>
          upload new
        </CText>
      </TouchableOpacity>

      <CText>Thumbnail size should be 720x1280px or in similar ratio</CText>
    </CView>
  )
}

export default ThumbnailUpload
