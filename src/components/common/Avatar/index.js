import React from 'react'
import { Image, StyleSheet } from 'react-native'
import CText from '../core/Text'
import CView from '../core/View'
import { SvgUri } from 'react-native-svg'

const Avatar = ({ name, imageUrl, customStyles }) => {
  const getInitials = name => {
    const names = name?.split(' ')
    return names
      ?.map(name => name?.charAt(0))
      ?.join('')
      ?.toUpperCase()
  }

  return (
    <CView
      style={{ ...styles.avatarContainer, ...customStyles?.avatarContainer }}>
      {imageUrl ? (
        <>
          {imageUrl?.includes('.svg') || imageUrl?.includes('/svg') ? (
            <SvgUri
              style={styles.image}
              uri={imageUrl}
              height="100%"
              width="100%"
            />
          ) : (
            <Image
              source={{
                uri: imageUrl
              }}
              style={styles.image}
            />
          )}
        </>
      ) : (
        <CView
          style={{
            ...styles.initialsContainer,
            ...customStyles?.initialsContainer
          }}>
          <CText style={{ ...styles.initials, ...customStyles?.initials }}>
            {getInitials(name)}
          </CText>
        </CView>
      )}
    </CView>
  )
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  initialsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  initials: {
    fontWeight: 'bold'
  }
})

export default Avatar
