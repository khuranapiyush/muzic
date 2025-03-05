/* eslint-disable react-native/no-inline-styles */
import { Image } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import CView from '../../../common/core/View'
import { TouchableOpacity } from 'react-native'
import Popover from 'react-native-popover-view'
import { AuthShareButton } from '../../../common/Button/ShareButton'
import { useTheme } from '@react-navigation/native'
import getStyles from './AIGenerator.styles'
import appImages from '../../../../resource/images'
import CText from '../../../common/core/Text'
import { formatTime } from '../../../../utils/common'

const MusicCard = ({ item, index, handlePlayPause }) => {
  const { mode } = useTheme()
  const touchable = useRef()
  const styles = getStyles(mode)
  const [showPopover, setShowPopover] = useState(false)

  const shareOptions = useMemo(
    () => ({
      title: 'AI Generated Muzic',
      url: item?.audioUrl
    }),
    [item]
  )

  const handleSongPress = () => {
    if (item) {
      handlePlayPause(item.audioUrl, item.title, item.duration, item.imageUrl)
      return
    }
  }

  return (
    <>
      <CView style={styles.cardListContainer} key={index}>
        <TouchableOpacity
          style={{
            ...styles.cardListContainer,
            opacity: 1
          }}
          onPress={handleSongPress}>
          <CView row style={styles.cardWrapper}>
            <CView row style={styles.leftWrapper}>
              <CView style={styles.leftIconWrapper}>
                <Image
                  source={{ uri: item?.imageUrl }}
                  style={styles.leftIcon}
                />
              </CView>
              <CView style={{ width: '65%' }}>
                {item?.title && (
                  <CText numberOfLines={1} style={styles.labelText}>
                    {item?.title}
                  </CText>
                )}
                {item?.subHeading && (
                  <CText numberOfLines={1} style={styles.descriptionText}>
                    {item?.subHeading}
                  </CText>
                )}
                {item?.duration && (
                  <CText numberOfLines={1} style={styles.descriptionText}>
                    {formatTime(item?.duration)}
                  </CText>
                )}
                {item?.status && (
                  <CText numberOfLines={1} style={styles.descriptionText}>
                    {item?.status}
                  </CText>
                )}
              </CView>
            </CView>

            <CView row style={styles.iconContainer}>
              <TouchableOpacity
                ref={touchable}
                onPress={() => setShowPopover(true)}>
                <Image
                  source={appImages.shareIcon}
                  style={styles.shareIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Popover
                from={touchable}
                isVisible={showPopover}
                backgroundStyle={styles.popoverBg}
                onRequestClose={() => setShowPopover(false)}>
                <CView style={styles.popoverContainer}>
                  <AuthShareButton
                    shareOptions={shareOptions}
                    customStyles={{
                      shareContainer: styles.shareContainer
                    }}
                  />
                </CView>
              </Popover>
              <TouchableOpacity
                ref={touchable}
                onPress={() => setShowPopover(true)}>
                <Image
                  source={appImages.threeDotIcon}
                  style={styles.dotIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Popover
                from={touchable}
                isVisible={showPopover}
                backgroundStyle={styles.popoverBg}
                onRequestClose={() => setShowPopover(false)}>
                <CView style={styles.popoverContainer}>
                  <AuthShareButton
                    shareOptions={shareOptions}
                    customStyles={{
                      shareContainer: styles.shareContainer
                    }}
                  />
                </CView>
              </Popover>
            </CView>
          </CView>
        </TouchableOpacity>
      </CView>
    </>
  )
}

export default MusicCard
