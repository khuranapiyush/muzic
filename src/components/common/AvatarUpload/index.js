import React, { useState } from 'react'
import { Image, Pressable } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import appImages from '../../../resource/images'
import CView from '../core/View'

const AvatarUpload = ({ url, handleAvatarUpload }) => {
  const [avatar, setAvatar] = useState(null)

  const handleSelectImage = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      quality: 0
    }
    const result = await launchImageLibrary(options)

    if (result.assets) {
      const { base64 } = result.assets[0]
      const imageUrl = `data:image/jpeg;base64,${base64}`
      setAvatar(imageUrl)
      handleAvatarUpload(imageUrl)
    }
  }

  return (
    <CView>
      <Pressable onPress={handleSelectImage}>
        <Image
          source={{ uri: avatar || url }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderColor: '#000',
            borderWidth: 1,
            resizeMode: 'cover'
          }}
        />
        <CView
          style={{
            width: 24,
            height: 24,
            backgroundColor: 'white',
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            right: 0,
            bottom: 0,
            flexDirection: 'row'
          }}>
          <Image
            source={appImages.cameraIcon}
            style={{ width: 16, height: 16 }}
          />
        </CView>
      </Pressable>
    </CView>
  )
}

export default AvatarUpload
